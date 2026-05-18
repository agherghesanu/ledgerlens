from __future__ import annotations
from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, ConfigDict

Action = Literal["approve", "reject", "escalate", "ask_evidence", "flag_assumption"]
Tone = Literal["pass", "fail", "partial", "neutral"]
CriterionName = Literal[
    "caught_main_issue", "over_trusted_ai",
    "escalated_appropriately", "explanation_quality",
]


class DataRow(BaseModel):
    account: str
    budget: float
    actual: float
    variance: float
    notes: str | None = None
    flagged: bool = False


# ── Case ─────────────────────────────────────────────────────────────────────

class CaseListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    category: str
    difficulty: str


class CasePublic(BaseModel):
    """Full case — hidden_truth intentionally excluded."""
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    category: str
    difficulty: str
    dataset: list[DataRow]
    ai_narrative: str
    ai_recommendation: str


# ── Review ────────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    case_id: str
    action: Action
    reasoning: str
    time_spent_seconds: int


class ReviewCreated(BaseModel):
    review_id: str


# ── Score ─────────────────────────────────────────────────────────────────────

class CriterionScore(BaseModel):
    name: CriterionName
    score: int          # 0–10
    tone: Tone
    rationale: str


class ScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    review_id: str
    criteria: list[CriterionScore]
    total: float
    feedback_summary: str
    expert_would_do: str
    over_trust_delta: float


class ScorePending(BaseModel):
    status: Literal["pending"] = "pending"
