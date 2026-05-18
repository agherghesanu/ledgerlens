"""
Tests for the pure aggregator helpers in app.routes.profile.
No DB, no HTTP — just unit tests on the logic functions.

Covers:
  - compute_over_trust_index (OTI formula)
  - compute_patterns (1.5σ threshold, strength/weakness direction)
  - format_time_spent (formatting helper)
  - _streak (consecutive-day streak)

And one integration-style test using the in-memory DB + HTTP client
for GET /profile.
"""
import math
import uuid
from datetime import datetime, UTC, timedelta

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import patch, AsyncMock

from app.main import app
from app.db.session import Base, get_session
from app.models.case import Case
from app.models.review import Review
from app.models.score import Score
from app.routes.profile import (
    compute_over_trust_index,
    compute_patterns,
    format_time_spent,
    _streak,
    ALL_CRITERIA,
)


# ── DB fixture (in-memory SQLite) ─────────────────────────────────────────────

@pytest_asyncio.fixture
async def db_engine():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_engine):
    factory = async_sessionmaker(db_engine, expire_on_commit=False)

    async def override_get_session():
        async with factory() as s:
            yield s

    app.dependency_overrides[get_session] = override_get_session

    from app.core.security import get_current_user
    from app.models.user import User
    app.dependency_overrides[get_current_user] = lambda: User(id="test_user", email="test@test.com")

    with patch("app.main.seed_if_empty", new_callable=AsyncMock), \
         patch("app.main.engine", new=db_engine):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            yield ac, db_engine

    app.dependency_overrides.clear()


# ── Helper: seed a case + review + score ─────────────────────────────────────

async def _seed_scored_review(
    engine,
    case_id: str = "001_test",
    category: str = "Variance Analysis",
    criteria_scores: dict[str, int] | None = None,
    total: float = 7.5,
    time_spent: int = 300,
    submitted_at: datetime | None = None,
) -> tuple[str, str]:
    """Inserts Case+Review+Score. Returns (case_id, review_id)."""
    factory = async_sessionmaker(engine, expire_on_commit=False)

    # Default criteria: all 7
    cs = criteria_scores or {
        "caught_main_issue": 7,
        "over_trusted_ai": 8,
        "escalated_appropriately": 8,
        "explanation_quality": 7,
    }
    criteria_list = [
        {"name": k, "score": v, "tone": "pass" if v >= 7 else "partial" if v >= 4 else "fail", "rationale": "ok"}
        for k, v in cs.items()
    ]

    async with factory() as s:
        # Upsert case
        existing = await s.get(Case, case_id)
        if not existing:
            s.add(Case(
                id=case_id,
                title=f"Test Case {case_id}",
                category=category,
                difficulty="medium",
                dataset=[],
                ai_narrative="AI says X.",
                ai_recommendation="approve",
                hidden_truth={
                    "correctDecision": ["escalate"],
                    "correctIssueSummary": "Test issue.",
                    "expertFeedback": "Expert feedback.",
                    "evidenceToRequest": ["GL export"],
                    "aiFailureMode": "one_off_as_recurring",
                },
            ))

        from app.models.user import User
        # Upsert User
        existing_user = await s.get(User, "test_user")
        if not existing_user:
            s.add(User(id="test_user", email="test@test.com", hashed_password="pw"))

        review = Review(
            case_id=case_id,
            user_id="test_user",
            action="escalate",
            reasoning="Test reasoning.",
            time_spent_seconds=time_spent,
        )
        if submitted_at:
            review.submitted_at = submitted_at
        s.add(review)
        await s.commit()
        await s.refresh(review)
        review_id = review.id

        s.add(Score(
            id=str(uuid.uuid4()),
            review_id=review_id,
            criteria=criteria_list,
            total=total,
            feedback_summary="Good work.",
            expert_would_do="Expert paragraph.",
            over_trust_delta=0.5,
        ))
        await s.commit()

    return case_id, review_id


# ── Unit tests: compute_over_trust_index ─────────────────────────────────────

class TestComputeOverTrustIndex:
    def test_returns_none_for_empty(self):
        assert compute_over_trust_index([]) is None

    def test_perfect_skeptic_all_tens(self):
        """OTA=10 → user never over-trusts → OTI = mean(10-10)*10 = 0%"""
        result = compute_over_trust_index([10.0] * 20)
        assert result == 0.0

    def test_complete_over_truster_all_zeros(self):
        """OTA=0 → user always over-trusts → OTI = mean(10-0)*10 = 100%"""
        result = compute_over_trust_index([0.0] * 20)
        assert result == 100.0

    def test_moderate_score(self):
        """OTA=5 → OTI = mean(10-5)*10 = 50%"""
        result = compute_over_trust_index([5.0] * 10)
        assert result == 50.0

    def test_only_last_20_used(self):
        """
        25 reviews: first 5 (newest) are OTA=10, remaining 20 are OTA=0.
        [:20] takes the first 20 = [10,10,10,10,10, 0,0,...0] (5 tens + 15 zeros).
        OTI = mean(10-10)*5 + mean(10-0)*15 / 20 = (0*5 + 10*15)/20 * 10 = 75%.
        """
        ota_scores = [10.0] * 5 + [0.0] * 20  # newest first
        result = compute_over_trust_index(ota_scores)
        assert result == pytest.approx(75.0, abs=0.1)

    def test_single_review(self):
        result = compute_over_trust_index([8.0])
        assert result == 20.0  # (10-8)*10 = 20

    def test_mixed_scores(self):
        """3 reviews with OTA 10, 5, 0 → mean(0,5,10)*10 = 50%"""
        result = compute_over_trust_index([10.0, 5.0, 0.0])
        assert result == pytest.approx(50.0, abs=0.1)


# ── Unit tests: compute_patterns ─────────────────────────────────────────────

class TestComputePatterns:
    def _global(self, means: dict[str, float], stdevs: dict[str, float]):
        return means, stdevs

    def test_no_patterns_within_threshold(self):
        """User exactly at global mean — no patterns."""
        means = {k: 7.0 for k in ALL_CRITERIA}
        stdevs = {k: 1.0 for k in ALL_CRITERIA}
        user_means = {k: 7.0 for k in ALL_CRITERIA}
        result = compute_patterns(user_means, means, stdevs)
        assert result == []

    def test_strength_detected(self):
        """User is 2σ above global mean on caught_main_issue → strength."""
        global_means = {k: 5.0 for k in ALL_CRITERIA}
        global_stdevs = {k: 2.0 for k in ALL_CRITERIA}
        user_means = {k: 5.0 for k in ALL_CRITERIA}
        user_means["caught_main_issue"] = 9.0   # z = (9-5)/2 = 2.0 → strength

        result = compute_patterns(user_means, global_means, global_stdevs)
        strengths = [p for p in result if p.direction == "strength"]
        assert len(strengths) == 1
        assert strengths[0].z_score == pytest.approx(2.0, abs=0.01)

    def test_weakness_detected(self):
        """User is 2σ below global mean on over_trusted_ai → weakness."""
        global_means = {k: 7.0 for k in ALL_CRITERIA}
        global_stdevs = {k: 2.0 for k in ALL_CRITERIA}
        user_means = {k: 7.0 for k in ALL_CRITERIA}
        user_means["over_trusted_ai"] = 3.0  # z = (3-7)/2 = -2.0 → weakness

        result = compute_patterns(user_means, global_means, global_stdevs)
        weaknesses = [p for p in result if p.direction == "weakness"]
        assert len(weaknesses) == 1
        assert weaknesses[0].z_score == pytest.approx(-2.0, abs=0.01)

    def test_exactly_at_threshold_not_flagged(self):
        """z = 1.49 is just under threshold — not flagged."""
        global_means = {k: 5.0 for k in ALL_CRITERIA}
        global_stdevs = {k: 2.0 for k in ALL_CRITERIA}
        user_means = {k: 5.0 for k in ALL_CRITERIA}
        user_means["caught_main_issue"] = 5.0 + 1.49 * 2.0  # z=1.49

        result = compute_patterns(user_means, global_means, global_stdevs)
        assert result == []

    def test_exactly_at_threshold_flagged(self):
        """z = 1.50 is exactly at threshold — should be flagged."""
        global_means = {k: 5.0 for k in ALL_CRITERIA}
        global_stdevs = {k: 2.0 for k in ALL_CRITERIA}
        user_means = {k: 5.0 for k in ALL_CRITERIA}
        user_means["caught_main_issue"] = 5.0 + 1.5 * 2.0  # z=1.5

        result = compute_patterns(user_means, global_means, global_stdevs)
        assert len(result) == 1

    def test_zero_stdev_skipped(self):
        """If all users score the same, stdev=0 → skip that criterion."""
        global_means = {k: 7.0 for k in ALL_CRITERIA}
        # explanation_quality has stdev=0 (all identical)
        global_stdevs = {k: 1.0 for k in ALL_CRITERIA}
        global_stdevs["explanation_quality"] = 0.0
        user_means = {k: 9.5 for k in ALL_CRITERIA}  # extreme, but eq skipped

        result = compute_patterns(user_means, global_means, global_stdevs)
        names = [p.criterion for p in result]
        assert "Explanation Quality" not in names

    def test_sorted_by_abs_z(self):
        """Results are sorted by |z| descending."""
        global_means = {k: 5.0 for k in ALL_CRITERIA}
        global_stdevs = {k: 1.0 for k in ALL_CRITERIA}
        user_means = dict(global_means)
        user_means["caught_main_issue"] = 9.0   # z=4.0
        user_means["over_trusted_ai"] = 2.5     # z=-2.5
        user_means["explanation_quality"] = 6.8  # z=1.8

        result = compute_patterns(user_means, global_means, global_stdevs)
        abs_zs = [abs(p.z_score) for p in result]
        assert abs_zs == sorted(abs_zs, reverse=True)

    def test_missing_user_criterion_skipped(self):
        """If a user has no data for a criterion, it's skipped."""
        global_means = {k: 5.0 for k in ALL_CRITERIA}
        global_stdevs = {k: 1.0 for k in ALL_CRITERIA}
        # User has no data for caught_main_issue
        user_means = {k: 8.0 for k in ALL_CRITERIA if k != "caught_main_issue"}

        result = compute_patterns(user_means, global_means, global_stdevs)
        names = [p.criterion for p in result]
        assert "Catching the Main Issue" not in names


# ── Unit tests: format_time_spent ────────────────────────────────────────────

class TestFormatTimeSpent:
    def test_under_an_hour(self):
        assert format_time_spent(720) == "12m"

    def test_exactly_one_hour(self):
        assert format_time_spent(3600) == "1h"

    def test_one_hour_ten_minutes(self):
        assert format_time_spent(4200) == "1h 10m"

    def test_zero(self):
        assert format_time_spent(0) == "0m"

    def test_59_minutes(self):
        assert format_time_spent(3540) == "59m"


# ── Unit tests: _streak ───────────────────────────────────────────────────────

class TestStreak:
    def test_empty(self):
        assert _streak([]) == 0

    def test_streak_today(self):
        today = datetime.now(UTC)
        assert _streak([today]) == 1

    def test_streak_yesterday(self):
        yesterday = datetime.now(UTC) - timedelta(days=1)
        assert _streak([yesterday]) == 1

    def test_streak_two_days(self):
        today = datetime.now(UTC)
        yesterday = today - timedelta(days=1)
        assert _streak([today, yesterday]) == 2

    def test_broken_streak(self):
        today = datetime.now(UTC)
        two_days_ago = today - timedelta(days=2)
        # Gap on yesterday → streak is today only
        assert _streak([today, two_days_ago]) == 1

    def test_old_streak_returns_zero(self):
        """Last review was 3 days ago — streak should be 0."""
        old = datetime.now(UTC) - timedelta(days=3)
        assert _streak([old]) == 0

    def test_deduplicates_same_day(self):
        """Multiple reviews on the same day count as 1 streak day."""
        today = datetime.now(UTC)
        also_today = today.replace(hour=today.hour - 1)
        assert _streak([today, also_today]) == 1


# ── Integration test: GET /profile ────────────────────────────────────────────

async def test_get_profile_empty(client):
    ac, _ = client
    resp = await ac.get("/profile")
    assert resp.status_code == 200
    body = resp.json()
    assert body["cases_reviewed"] == 0
    assert body["accuracy"] is None
    assert body["over_trust_index"] is None
    assert body["skills"] == []
    assert body["patterns"] == []
    assert body["history"] == []


async def test_get_profile_with_data(client):
    ac, db_engine = client

    await _seed_scored_review(
        db_engine,
        case_id="001_revenue",
        category="Revenue Recognition",
        criteria_scores={
            "caught_main_issue": 9,
            "over_trusted_ai": 8,
            "escalated_appropriately": 10,
            "explanation_quality": 8,
        },
        total=8.75,
        time_spent=720,
    )
    await _seed_scored_review(
        db_engine,
        case_id="002_variance",
        category="Variance Analysis",
        criteria_scores={
            "caught_main_issue": 5,
            "over_trusted_ai": 4,
            "escalated_appropriately": 6,
            "explanation_quality": 5,
        },
        total=5.0,
        time_spent=4200,
    )

    resp = await ac.get("/profile")
    assert resp.status_code == 200
    body = resp.json()

    assert body["cases_reviewed"] == 2
    assert body["accuracy"] is not None
    assert body["accuracy"] == pytest.approx(68.75, abs=0.5)  # (87.5 + 50) / 2

    # Skills
    skill_names = [s["name"] for s in body["skills"]]
    assert "Revenue Recognition" in skill_names
    assert "Variance Analysis" in skill_names

    # History — 2 rows, newest first
    assert len(body["history"]) == 2
    history_scores = [h["score"] for h in body["history"]]
    assert all(isinstance(s, float) for s in history_scores)

    # OTI — with OTA scores 8 and 4 → mean(10-8, 10-4)/2 = mean(2,6) = 4 → 40%
    assert body["over_trust_index"] == pytest.approx(40.0, abs=0.5)

    # Time formatting
    times = [h["time_spent"] for h in body["history"]]
    assert "12m" in times  # 720s
    assert "1h 10m" in times  # 4200s
