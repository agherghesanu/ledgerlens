"""Automated case generation using Gemini."""
import uuid
import random
import logging
from typing import Literal

from pydantic import BaseModel

from app.services.llm import complete_json

logger = logging.getLogger(__name__)

_MODEL = "gemini-2.5-flash"

CATEGORIES = [
    "Revenue Recognition",
    "Variance Analysis",
    "Reconciliation",
    "Budget vs Actual",
    "Cost Classification",
    "Cash Flow Analysis",
    "Accounts Receivable",
]


# ── Pydantic shapes for LLM output ───────────────────────────────────────────

class GeneratedDataRow(BaseModel):
    account: str
    budget: float
    actual: float
    variance: float
    notes: str
    flagged: bool


class GeneratedHiddenTruth(BaseModel):
    correctDecision: str         # "approve" | "reject" | "escalate"
    correctIssueSummary: str     # one sentence: what the AI got wrong
    aiFailureMode: str           # e.g. "over-trusted trend extrapolation"
    evidenceToRequest: str       # what a senior analyst would ask for


class GeneratedCase(BaseModel):
    title: str
    category: str
    difficulty: str              # "easy" | "medium" | "hard"
    dataset: list[GeneratedDataRow]
    aiNarrative: str             # what the AI "wrote" (intentionally flawed)
    aiRecommendation: str        # what the AI recommended
    hiddenTruth: GeneratedHiddenTruth


_SYSTEM = """You are a finance education content designer creating realistic case studies
for junior analyst training. You generate financial scenarios where an AI assistant has made
a subtle but material error in its analysis. The analyst must identify the AI's mistake.

Rules:
- The AI narrative must CONTAIN a plausible-sounding but WRONG conclusion
- The hidden truth reveals what the AI got wrong and what the correct decision is
- Dataset must have 5-8 rows with realistic account names, numbers, and at least one flagged anomaly
- aiNarrative should be 2-4 paragraphs, written as if the AI is confident but mistaken
- correctDecision must be exactly one of: approve, reject, escalate
- Return ONLY valid JSON matching the schema exactly — no markdown, no explanation"""


def _user_prompt(category: str, difficulty: str) -> str:
    guidance = {
        "easy": "The AI error is obvious — a clear sign the analyst should reject or escalate.",
        "medium": "The AI error requires domain knowledge to spot.",
        "hard": "The AI error is subtle and requires deep financial analysis expertise.",
    }
    return (
        f"Generate a finance case study in the '{category}' category at '{difficulty}' difficulty.\n"
        f"Difficulty guidance: {guidance.get(difficulty, '')}\n\n"
        "Return JSON with exactly these fields:\n"
        "title (string), category (string), difficulty (string),\n"
        "dataset (array of objects with: account, budget, actual, variance, notes, flagged),\n"
        "aiNarrative (string), aiRecommendation (string),\n"
        "hiddenTruth (object with: correctDecision, correctIssueSummary, aiFailureMode, evidenceToRequest)"
    )


async def generate_case(
    category: str | None = None,
    difficulty: Literal["easy", "medium", "hard"] | None = None,
) -> dict:
    """Generate a new case via Gemini. Returns dict ready to insert as a Case row."""
    chosen_category = category or random.choice(CATEGORIES)
    chosen_difficulty = difficulty or random.choice(["easy", "medium", "hard"])

    result: GeneratedCase = await complete_json(
        model=_MODEL,
        system=[{"type": "text", "text": _SYSTEM}],
        user=[{"type": "text", "text": _user_prompt(chosen_category, chosen_difficulty)}],
        schema=GeneratedCase,
    )

    return {
        "id": str(uuid.uuid4()),
        "title": result.title,
        "category": result.category,
        "difficulty": result.difficulty,
        "dataset": [row.model_dump() for row in result.dataset],
        "ai_narrative": result.aiNarrative,
        "ai_recommendation": result.aiRecommendation,
        "hidden_truth": result.hiddenTruth.model_dump(),
    }
