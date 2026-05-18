import pytest
from unittest.mock import AsyncMock, patch
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base
from app.models.case import Case
from app.models.review import Review
from app.models.score import Score
from app.services.scoring import (
    score_review,
    GradingResult,
    CriterionGrade,
    NarrativeResult,
)


@pytest.fixture
async def db():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield async_sessionmaker(engine, expire_on_commit=False)
    await engine.dispose()


async def _seed(factory, action: str, reasoning: str, correct_decisions: list[str]) -> str:
    async with factory() as s:
        s.add(Case(
            id="001_t",
            title="Marketing Variance",
            category="Variance Analysis",
            difficulty="easy",
            dataset=[],
            ai_narrative="AI says spend is recurring.",
            ai_recommendation="approve",
            hidden_truth={
                "correctDecision": correct_decisions,
                "correctIssueSummary": "Annual conference sponsorship misclassified as recurring.",
                "expertFeedback": "Expert would have requested the GL export.",
                "evidenceToRequest": ["GL export"],
                "aiFailureMode": "one_off_as_recurring",
            },
        ))
        review = Review(
            case_id="001_t",
            action=action,
            reasoning=reasoning,
            time_spent_seconds=300,
        )
        s.add(review)
        await s.commit()
        return review.id


def _grade(score: int, name: str) -> CriterionGrade:
    tone = "pass" if score >= 7 else "partial" if score >= 4 else "fail"
    return CriterionGrade(score=score, tone=tone, rationale=f"Mock rationale for {name}.")


def _grading(cmi: int, ota: int, eq: int) -> GradingResult:
    return GradingResult(
        caught_main_issue=_grade(cmi, "CMI"),
        over_trusted_ai=_grade(ota, "OTA"),
        explanation_quality=_grade(eq, "EQ"),
    )


_NARRATIVE = NarrativeResult(
    feedback_summary="Mock feedback paragraph.",
    expert_would_do="Mock expert paragraph.",
)


async def test_perfect_review(db):
    """Caught issue, escalated correctly, detailed reasoning. total >= 85."""
    # EA=10 (escalate exact), CMI=9, OTA=9, EQ=9 → total=((9+9+10+9)/4)*10=92.5
    review_id = await _seed(
        db,
        action="escalate",
        reasoning=(
            "The $240,000 FinanceConnect sponsorship is a one-time annual event — it appears "
            "nowhere in prior-year GL. The AI treated it as recurring quarterly spend, inflating "
            "the full-year projection by ~$720K. Escalating for finance manager sign-off."
        ),
        correct_decisions=["escalate"],
    )
    with patch("app.services.scoring.AsyncSessionLocal", db), \
         patch("app.services.scoring.complete_json", new_callable=AsyncMock) as mock_llm:
        mock_llm.side_effect = [_grading(9, 9, 9), _NARRATIVE]
        result = await score_review(review_id)

    assert result is not None
    assert result.total >= 85
    ea = next(c for c in result.criteria if c["name"] == "escalated_appropriately")
    assert ea["score"] == 10
    assert result.over_trust_delta > 0


async def test_over_trust_review(db):
    """Approved despite the issue. OTA score <= 3, total <= 40."""
    # EA=0 (approve vs escalate, wrong direction), CMI=2, OTA=1, EQ=3 → total=15
    review_id = await _seed(
        db,
        action="approve",
        reasoning="The AI analysis looks correct. The variance seems acceptable to me.",
        correct_decisions=["escalate"],
    )
    with patch("app.services.scoring.AsyncSessionLocal", db), \
         patch("app.services.scoring.complete_json", new_callable=AsyncMock) as mock_llm:
        mock_llm.side_effect = [_grading(2, 1, 3), _NARRATIVE]
        result = await score_review(review_id)

    assert result is not None
    assert result.total <= 40
    ota = next(c for c in result.criteria if c["name"] == "over_trusted_ai")
    assert ota["score"] <= 3
    assert result.over_trust_delta < 0


async def test_wrong_action_near_match(db):
    """Rejected when correct was Escalate. EA=6 (near match), total in 50-70."""
    # EA=6 (both concerned), CMI=6, OTA=6, EQ=5 → total=((6+6+6+5)/4)*10=57.5
    review_id = await _seed(
        db,
        action="reject",
        reasoning=(
            "The variance is too large. The AI missed the one-off conference sponsorship. "
            "Rejecting this variance report."
        ),
        correct_decisions=["escalate"],
    )
    with patch("app.services.scoring.AsyncSessionLocal", db), \
         patch("app.services.scoring.complete_json", new_callable=AsyncMock) as mock_llm:
        mock_llm.side_effect = [_grading(6, 6, 5), _NARRATIVE]
        result = await score_review(review_id)

    assert result is not None
    ea = next(c for c in result.criteria if c["name"] == "escalated_appropriately")
    assert ea["score"] == 6
    assert 50 <= result.total <= 70
