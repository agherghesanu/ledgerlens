import logging
import os
import uuid
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import BaseModel
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.case import Case
from app.models.review import Review
from app.models.score import Score
from app.services.llm import complete_json

logger = logging.getLogger(__name__)

_HAIKU = "claude-haiku-4-5-20251001"
_SONNET = "claude-sonnet-4-6"

_CONCERNED = {"reject", "escalate", "ask_evidence", "flag_assumption"}

_NARRATIVE_SYSTEM = (
    "You are a finance educator writing personalized feedback for a junior analyst. "
    "Be specific, constructive, and grounded in the case details. "
    "Return ONLY valid JSON with keys 'feedback_summary' and 'expert_would_do'. "
    "No markdown, no preamble."
)


# ── Internal Pydantic shapes ──────────────────────────────────────────────────

class CriterionGrade(BaseModel):
    score: int
    tone: Literal["pass", "fail", "partial", "neutral"]
    rationale: str


class GradingResult(BaseModel):
    caught_main_issue: CriterionGrade
    over_trusted_ai: CriterionGrade
    explanation_quality: CriterionGrade


class NarrativeResult(BaseModel):
    feedback_summary: str
    expert_would_do: str


# ── Helpers ───────────────────────────────────────────────────────────────────

@lru_cache(maxsize=None)
def _load_rubric() -> str:
    version = os.getenv("SCORING_PROMPT_VERSION", "v1")
    path = Path(__file__).parents[1] / "prompts" / f"scoring_{version}.md"
    return path.read_text()


def _score_escalation(action: str, correct_decisions: list[str]) -> tuple[int, str, str]:
    if action in correct_decisions:
        return 10, "pass", "Action exactly matches the correct decision."
    correct_set = set(correct_decisions)
    if action in _CONCERNED and correct_set & _CONCERNED:
        return 6, "partial", (
            f"Near match — chose '{action}' but correct was one of {correct_decisions}."
        )
    return 0, "fail", (
        f"Wrong action — chose '{action}' but correct was one of {correct_decisions}."
    )


def _build_case_context(case: Case) -> str:
    truth = case.hidden_truth
    return (
        f"<case>\n"
        f"Title: {case.title}\n"
        f"Category: {case.category}\n"
        f"Difficulty: {case.difficulty}\n"
        f"AI Narrative: {case.ai_narrative}\n"
        f"AI Recommendation: {case.ai_recommendation}\n"
        f"</case>\n\n"
        f"<truth>\n"
        f"Correct Decision: {truth['correctDecision']}\n"
        f"Core Issue: {truth['correctIssueSummary']}\n"
        f"AI Failure Mode: {truth['aiFailureMode']}\n"
        f"Evidence to Request: {truth['evidenceToRequest']}\n"
        f"</truth>"
    )


def _build_analyst_block(review: Review) -> str:
    return (
        f"<analyst_reasoning>\n"
        f"Action chosen: {review.action}\n"
        f"Reasoning: {review.reasoning}\n"
        f"</analyst_reasoning>\n\n"
        "<output_schema>\n"
        "Return ONLY valid JSON (no markdown, no preamble):\n"
        "{\n"
        '  "caught_main_issue": {"score": 0-10, "tone": "pass|partial|fail|neutral", "rationale": "..."},\n'
        '  "over_trusted_ai": {"score": 0-10, "tone": "pass|partial|fail|neutral", "rationale": "..."},\n'
        '  "explanation_quality": {"score": 0-10, "tone": "pass|partial|fail|neutral", "rationale": "..."}\n'
        "}\n"
        "</output_schema>"
    )


def _build_narrative_prompt(
    case: Case,
    review: Review,
    grading: GradingResult,
    ea_score: int,
    total: float,
) -> str:
    truth = case.hidden_truth
    return (
        f"Case: {case.title} ({case.category})\n"
        f"Core issue the AI got wrong: {truth['correctIssueSummary']}\n"
        f"Analyst action: {review.action}\n"
        f"Analyst reasoning: {review.reasoning}\n\n"
        f"Scores — CMI: {grading.caught_main_issue.score}/10  "
        f"OTA: {grading.over_trusted_ai.score}/10  "
        f"EA: {ea_score}/10  "
        f"EQ: {grading.explanation_quality.score}/10  →  Total: {total:.0f}/100\n\n"
        "Write two paragraphs:\n"
        "1. feedback_summary: Personal feedback to this analyst (2-4 sentences, second person)\n"
        "2. expert_would_do: What a senior analyst would have noticed and done (2-3 sentences)\n\n"
        'Return ONLY JSON: {"feedback_summary": "...", "expert_would_do": "..."}'
    )


# ── Public API ────────────────────────────────────────────────────────────────

async def score_review(review_id: str) -> Score | None:
    """Score a review via LLM + rule-based criteria. Idempotent."""
    async with AsyncSessionLocal() as session:
        existing = await session.scalar(
            select(Score).where(Score.review_id == review_id)
        )
        if existing:
            return existing

        review = await session.get(Review, review_id)
        if not review:
            logger.error("Review %s not found — cannot score", review_id)
            return None

        case = await session.get(Case, review.case_id)
        if not case:
            logger.error("Case %s not found for review %s", review.case_id, review_id)
            return None

        rubric = _load_rubric()

        grading: GradingResult = await complete_json(
            model=_HAIKU,
            system=[
                {"type": "text", "text": rubric, "cache_control": {"type": "ephemeral"}}
            ],
            user=[
                {
                    "type": "text",
                    "text": _build_case_context(case),
                    "cache_control": {"type": "ephemeral"},
                },
                {
                    "type": "text",
                    "text": _build_analyst_block(review),
                },
            ],
            schema=GradingResult,
        )

        ea_score, ea_tone, ea_rationale = _score_escalation(
            review.action, case.hidden_truth["correctDecision"]
        )

        cmi_s = grading.caught_main_issue.score
        ota_s = grading.over_trusted_ai.score
        eq_s = grading.explanation_quality.score
        total = ((cmi_s + ota_s + ea_score + eq_s) / 4) * 10
        over_trust_delta = max(-1.0, min(1.0, (ota_s - 5) / 5))

        narrative: NarrativeResult = await complete_json(
            model=_SONNET,
            system=[
                {
                    "type": "text",
                    "text": _NARRATIVE_SYSTEM,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            user=[
                {
                    "type": "text",
                    "text": _build_narrative_prompt(case, review, grading, ea_score, total),
                }
            ],
            schema=NarrativeResult,
        )

        criteria = [
            {
                "name": "caught_main_issue",
                "score": cmi_s,
                "tone": grading.caught_main_issue.tone,
                "rationale": grading.caught_main_issue.rationale,
            },
            {
                "name": "over_trusted_ai",
                "score": ota_s,
                "tone": grading.over_trusted_ai.tone,
                "rationale": grading.over_trusted_ai.rationale,
            },
            {
                "name": "escalated_appropriately",
                "score": ea_score,
                "tone": ea_tone,
                "rationale": ea_rationale,
            },
            {
                "name": "explanation_quality",
                "score": eq_s,
                "tone": grading.explanation_quality.tone,
                "rationale": grading.explanation_quality.rationale,
            },
        ]

        score = Score(
            id=str(uuid.uuid4()),
            review_id=review_id,
            criteria=criteria,
            total=round(total, 1),
            feedback_summary=narrative.feedback_summary,
            expert_would_do=narrative.expert_would_do,
            over_trust_delta=round(over_trust_delta, 3),
        )
        session.add(score)
        await session.commit()
        await session.refresh(score)
        return score
