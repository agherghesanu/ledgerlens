import asyncio
import uuid

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.score import Score

_STUB_CRITERIA = [
    {"name": "caught_main_issue",      "score": 7, "tone": "pass",    "rationale": "Stub — real scoring ships in Phase 5."},
    {"name": "over_trusted_ai",        "score": 6, "tone": "partial", "rationale": "Stub — real scoring ships in Phase 5."},
    {"name": "escalated_appropriately","score": 8, "tone": "pass",    "rationale": "Stub — real scoring ships in Phase 5."},
    {"name": "explanation_quality",    "score": 7, "tone": "pass",    "rationale": "Stub — real scoring ships in Phase 5."},
]

# Captured at import time so tests can monkeypatch asyncio.sleep without
# triggering infinite recursion when the lambda calls asyncio.sleep(0).
_sleep = asyncio.sleep


async def score_review(review_id: str) -> None:
    """Stub scoring service. Sleeps 1 s then writes a fixed Score.
    Replace body with real LLM evaluation in Phase 5."""
    await _sleep(1)

    async with AsyncSessionLocal() as session:
        existing = await session.scalar(
            select(Score).where(Score.review_id == review_id)
        )
        if existing:
            return

        session.add(Score(
            id=str(uuid.uuid4()),
            review_id=review_id,
            criteria=_STUB_CRITERIA,
            total=70.0,
            feedback_summary="Stub feedback — real scoring ships in Phase 5.",
            expert_would_do="Stub expert paragraph — real scoring ships in Phase 5.",
            over_trust_delta=0.1,
        ))
        await session.commit()
