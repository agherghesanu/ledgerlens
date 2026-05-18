# Scoring Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Phase 4 stub in `scoring.py` with a real LLM-backed scoring engine that grades each review against 4 criteria, generates narrative feedback, and writes a `Score` row.

**Architecture:** Two async Claude calls per review — one haiku call grades CMI+OTA+EQ from a versioned system-prompt rubric loaded from `scoring_v1.md`; one sonnet call generates the two narrative paragraphs. EA is rule-based (no LLM). Both calls go through a thin `complete_json` wrapper in `llm.py` that validates the response against a Pydantic model and retries once on parse failure. The `over_trust_delta` is derived from the OTA score: `(ota - 5) / 5`, yielding a value in `[-1, 1]` where positive = appropriately skeptical.

**Tech Stack:** Python 3.12, `anthropic.AsyncAnthropic`, Pydantic v2, `functools.lru_cache` for rubric loading, `unittest.mock.AsyncMock` for tests. No new dependencies — `anthropic>=0.40` already in `pyproject.toml`.

**Note on review_id type:** The spec says `int` but the codebase uses string UUIDs throughout. `score_review` signature stays `(review_id: str) -> Score | None`.

---

## File Map

```
apps/api/
├── app/
│   ├── prompts/
│   │   └── scoring_v1.md          Task 1 — rubric system prompt rewrite (XML sections)
│   └── services/
│       ├── llm.py                  Task 2 — async complete_json wrapper with retry + cache logging
│       └── scoring.py              Task 3 — real scoring engine replacing the Phase 4 stub
└── tests/
    ├── test_llm.py                 Task 2 — complete_json unit tests
    └── test_scoring.py             Task 3 — 3 scenario tests (perfect / over-trust / wrong action)
```

---

### Task 1: Scoring Prompt Template

**Files:**
- Modify: `apps/api/app/prompts/scoring_v1.md`

The existing file has the wrong schema (old 5-dimension scoring). Rewrite with XML-tagged sections for the new 3-criterion haiku grading call. This file is loaded at runtime by `scoring.py`.

- [ ] **Step 1: Replace scoring_v1.md**

```markdown
You are a rigorous accounting educator evaluating a junior analyst's review of an AI-generated finance analysis. Return ONLY valid JSON — no markdown, no preamble.

<rubric>
Grade the analyst on 3 criteria, each scored 0–10:

**caught_main_issue** — Did the analyst explicitly identify the core accounting error described in `<truth>`?
- 9–10: Names the exact issue with a verbatim data reference or quote from their reasoning
- 6–8: Identifies the issue but without citing specific evidence
- 3–5: Vaguely gestures at the issue without naming it clearly
- 0–2: Does not identify the issue, or accepts the AI's conclusion uncritically

**over_trusted_ai** — Did the analyst critically evaluate the AI's recommendation, or accept it unchallenged?
- 9–10: Directly challenged the key AI assumption with specific counter-evidence
- 6–8: Expressed meaningful skepticism about some aspect of the AI's analysis
- 3–5: Partially questioned the AI but mostly accepted its framing
- 0–2: Accepted the AI recommendation wholesale with no independent analysis

**explanation_quality** — Is the analyst's reasoning specific, evidence-based, and finance-relevant?
- 9–10: Cites specific account names, dollar amounts, or variance figures; finance terminology correct; logical flow clear
- 6–8: Good specificity in most areas, minor vagueness in one
- 3–5: Some concrete references but reasoning is mostly generic
- 0–2: Vague, no data references, or finance concepts misapplied

For each criterion output:
- `score`: integer 0–10
- `tone`: `"pass"` if score ≥ 7, `"partial"` if score 4–6, `"fail"` if score ≤ 3
- `rationale`: 1–2 sentences citing specific text from the analyst's reasoning
</rubric>
```

- [ ] **Step 2: Verify file exists and is readable**

```bash
cd apps/api && python -c "from pathlib import Path; print(Path('app/prompts/scoring_v1.md').read_text()[:80])"
```

Expected: first line of the template.

- [ ] **Step 3: Commit**

```bash
git add apps/api/app/prompts/scoring_v1.md
git commit -m "feat(scoring): rewrite scoring_v1.md with XML-tagged rubric"
```

---

### Task 2: LLM Wrapper

**Files:**
- Modify: `apps/api/app/services/llm.py`
- Create: `apps/api/tests/test_llm.py`

Replace the sync stub `complete()` with an async `complete_json()` that accepts content blocks (supporting cache_control), validates against a Pydantic schema, and retries once on parse failure.

- [ ] **Step 1: Write failing tests in `tests/test_llm.py`**

```python
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from pydantic import BaseModel
from app.services.llm import complete_json


class _Demo(BaseModel):
    value: int
    label: str


def _mock_response(text: str) -> MagicMock:
    usage = MagicMock()
    usage.input_tokens = 100
    usage.output_tokens = 50
    usage.cache_read_input_tokens = 80
    usage.cache_creation_input_tokens = 20
    content = MagicMock()
    content.text = text
    msg = MagicMock()
    msg.content = [content]
    msg.usage = usage
    return msg


async def test_complete_json_success():
    with patch("app.services.llm._client") as mock_client:
        mock_client.messages.create = AsyncMock(
            return_value=_mock_response('{"value": 42, "label": "hello"}')
        )
        result = await complete_json(
            model="claude-haiku-4-5-20251001",
            system=[{"type": "text", "text": "You grade stuff."}],
            user=[{"type": "text", "text": "Grade this."}],
            schema=_Demo,
        )
    assert result.value == 42
    assert result.label == "hello"


async def test_complete_json_retries_on_bad_json():
    with patch("app.services.llm._client") as mock_client:
        mock_client.messages.create = AsyncMock(side_effect=[
            _mock_response("not json at all"),
            _mock_response('{"value": 7, "label": "retry"}'),
        ])
        result = await complete_json(
            model="claude-haiku-4-5-20251001",
            system=[{"type": "text", "text": "system"}],
            user=[{"type": "text", "text": "user"}],
            schema=_Demo,
        )
    assert result.value == 7
    assert mock_client.messages.create.call_count == 2


async def test_complete_json_raises_after_two_failures():
    with patch("app.services.llm._client") as mock_client:
        mock_client.messages.create = AsyncMock(
            return_value=_mock_response("still bad json {{{")
        )
        with pytest.raises(ValueError, match="unparseable"):
            await complete_json(
                model="claude-haiku-4-5-20251001",
                system=[{"type": "text", "text": "system"}],
                user=[{"type": "text", "text": "user"}],
                schema=_Demo,
            )
    assert mock_client.messages.create.call_count == 2


async def test_complete_json_passes_cache_blocks():
    """Verify cache_control blocks are forwarded to the API call unchanged."""
    captured = {}
    async def _capture(**kwargs):
        captured.update(kwargs)
        return _mock_response('{"value": 1, "label": "x"}')

    with patch("app.services.llm._client") as mock_client:
        mock_client.messages.create = _capture
        await complete_json(
            model="claude-haiku-4-5-20251001",
            system=[{"type": "text", "text": "rubric", "cache_control": {"type": "ephemeral"}}],
            user=[{"type": "text", "text": "question"}],
            schema=_Demo,
        )
    assert captured["system"][0]["cache_control"] == {"type": "ephemeral"}
```

- [ ] **Step 2: Run — expect ImportError**

```bash
cd apps/api && uv run pytest tests/test_llm.py -v 2>&1 | head -15
```

Expected: `ImportError: cannot import name 'complete_json'`

- [ ] **Step 3: Rewrite `app/services/llm.py`**

```python
import json
import logging
from typing import TypeVar, Type

import anthropic
from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)

_client = anthropic.AsyncAnthropic()


async def complete_json(
    model: str,
    system: list[dict],
    user: list[dict],
    schema: Type[T],
) -> T:
    """Call Claude with content-block system/user, parse JSON as Pydantic model.
    Retries once on parse failure. Logs cache token counts."""
    last_exc: Exception | None = None
    for attempt in range(2):
        response = await _client.messages.create(
            model=model,
            max_tokens=1024,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        raw = response.content[0].text
        usage = response.usage
        logger.info(
            "llm model=%s attempt=%d cache_read=%d cache_write=%d input=%d output=%d",
            model,
            attempt,
            getattr(usage, "cache_read_input_tokens", 0),
            getattr(usage, "cache_creation_input_tokens", 0),
            usage.input_tokens,
            usage.output_tokens,
        )
        try:
            return schema.model_validate_json(raw)
        except (ValidationError, json.JSONDecodeError) as exc:
            last_exc = exc
            if attempt == 0:
                logger.warning("LLM parse failed on attempt 0: %s — retrying", exc)
    raise ValueError(
        f"LLM returned unparseable response after 2 attempts: {last_exc}"
    ) from last_exc
```

- [ ] **Step 4: Run tests — expect all 4 PASS**

```bash
cd apps/api && uv run pytest tests/test_llm.py -v
```

Expected: `4 passed`

- [ ] **Step 5: Commit**

```bash
git add apps/api/app/services/llm.py apps/api/tests/test_llm.py
git commit -m "feat(api): async complete_json LLM wrapper with retry and cache logging"
```

---

### Task 3: Scoring Service + Tests

**Files:**
- Modify: `apps/api/app/services/scoring.py`
- Create: `apps/api/tests/test_scoring.py`

Replace the Phase 4 stub with the real scoring engine. Write the three test scenarios first, watch them fail against the stub, then implement, then watch them pass.

- [ ] **Step 1: Write `tests/test_scoring.py` — all three scenarios**

```python
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
    """Caught issue, escalated correctly, detailed reasoning. total ≥ 85."""
    # EA = 10 (escalate exact match), CMI=9, OTA=9, EQ=9
    # total = ((9+9+10+9)/4) * 10 = 92.5
    review_id = await _seed(
        db,
        action="escalate",
        reasoning=(
            "The $240,000 FinanceConnect sponsorship is a one-time annual event — it appears "
            "nowhere in prior-year GL. The AI treated it as recurring quarterly spend, inflating "
            "the full-year projection by ~$720K. I am escalating because this classification "
            "requires finance manager sign-off before we can approve the variance report."
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
    assert result.over_trust_delta > 0  # appropriately skeptical


async def test_over_trust_review(db):
    """Approved despite the issue. OTA score ≤ 3, total ≤ 40."""
    # EA = 0 (approve vs escalate — wrong direction)
    # CMI=2, OTA=1, EQ=3 → total = ((2+1+0+3)/4)*10 = 15
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
    assert result.over_trust_delta < 0  # over-trusted AI


async def test_wrong_action_near_match(db):
    """Rejected when correct was Escalate. EA = 6 (near match), total in 50–70."""
    # EA = 6 (reject and escalate both in _CONCERNED set)
    # CMI=6, OTA=6, EQ=5 → total = ((6+6+6+5)/4)*10 = 57.5
    review_id = await _seed(
        db,
        action="reject",
        reasoning=(
            "The variance is too large. The AI missed the one-off conference sponsorship. "
            "I am rejecting this variance report."
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
```

- [ ] **Step 2: Run — expect ImportError (GradingResult not yet defined)**

```bash
cd apps/api && uv run pytest tests/test_scoring.py -v 2>&1 | head -15
```

Expected: `ImportError: cannot import name 'GradingResult' from 'app.services.scoring'`

- [ ] **Step 3: Rewrite `app/services/scoring.py`**

```python
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

# Actions that show concern/skepticism — used for near-match EA scoring.
_CONCERNED = {"reject", "escalate", "ask_evidence", "flag_assumption"}

_NARRATIVE_SYSTEM = (
    "You are a finance educator writing personalized feedback for a junior analyst. "
    "Be specific, constructive, and grounded in the case details. "
    "Return ONLY valid JSON with keys 'feedback_summary' and 'expert_would_do'. "
    "No markdown, no preamble."
)


# ── Internal Pydantic shapes for LLM output parsing ──────────────────────────

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
    """Rule-based EA scoring. Returns (score, tone, rationale)."""
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
        "1. feedback_summary: Personal feedback to this analyst (2–4 sentences, second person)\n"
        "2. expert_would_do: What a senior analyst would have noticed and done (2–3 sentences)\n\n"
        'Return ONLY JSON: {"feedback_summary": "...", "expert_would_do": "..."}'
    )


# ── Public API ────────────────────────────────────────────────────────────────

async def score_review(review_id: str) -> Score | None:
    """Score a review via LLM + rule-based criteria. Idempotent — returns existing score if found."""
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

        # ── Grading call (haiku) — rubric cached, case+truth cached per-case ──
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

        # ── EA rule-based (no LLM) ─────────────────────────────────────────
        ea_score, ea_tone, ea_rationale = _score_escalation(
            review.action, case.hidden_truth["correctDecision"]
        )

        # ── Aggregate ──────────────────────────────────────────────────────
        cmi_s = grading.caught_main_issue.score
        ota_s = grading.over_trusted_ai.score
        eq_s = grading.explanation_quality.score
        total = ((cmi_s + ota_s + ea_score + eq_s) / 4) * 10
        # Positive = appropriately skeptical; negative = over-trusted AI
        over_trust_delta = max(-1.0, min(1.0, (ota_s - 5) / 5))

        # ── Narrative call (sonnet) ────────────────────────────────────────
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
```

- [ ] **Step 4: Run scoring tests — expect all 3 PASS**

```bash
cd apps/api && uv run pytest tests/test_scoring.py -v
```

Expected output:
```
tests/test_scoring.py::test_perfect_review PASSED
tests/test_scoring.py::test_over_trust_review PASSED
tests/test_scoring.py::test_wrong_action_near_match PASSED
3 passed
```

If any fail, check the arithmetic:
- Perfect: `((9+9+10+9)/4)*10 = 92.5` ≥ 85 ✓
- Over-trust: `((2+1+0+3)/4)*10 = 15` ≤ 40 ✓
- Near-match: `((6+6+6+5)/4)*10 = 57.5` in [50,70] ✓

- [ ] **Step 5: Verify `reviews.py` still works (no changes needed — interface is identical)**

`reviews.py` calls `background_tasks.add_task(score_review, review.id)` — the return value is ignored by FastAPI. The new `score_review` has the same `(review_id: str)` signature. No change needed.

- [ ] **Step 6: Commit**

```bash
git add apps/api/app/services/scoring.py apps/api/tests/test_scoring.py
git commit -m "feat(api): real scoring engine — LLM grading + rule-based EA + cache"
```

---

### Task 4: Full Test Suite

- [ ] **Step 1: Run the complete test suite**

```bash
cd apps/api && uv run pytest tests/ -v --tb=short
```

Expected output (14 tests):
```
tests/test_llm.py::test_complete_json_success PASSED
tests/test_llm.py::test_complete_json_retries_on_bad_json PASSED
tests/test_llm.py::test_complete_json_raises_after_two_failures PASSED
tests/test_llm.py::test_complete_json_passes_cache_blocks PASSED
tests/test_scoring.py::test_perfect_review PASSED
tests/test_scoring.py::test_over_trust_review PASSED
tests/test_scoring.py::test_wrong_action_near_match PASSED
tests/test_routes.py::test_list_cases_empty PASSED
tests/test_routes.py::test_list_cases_returns_cases PASSED
tests/test_routes.py::test_list_cases_filter_difficulty PASSED
tests/test_routes.py::test_get_case_not_found PASSED
tests/test_routes.py::test_get_case_strips_hidden_truth PASSED
tests/test_routes.py::test_post_review_success PASSED
tests/test_routes.py::test_post_review_invalid_action PASSED
tests/test_routes.py::test_post_review_unknown_case PASSED
tests/test_routes.py::test_get_score_pending PASSED
tests/test_routes.py::test_get_score_ready PASSED
17 passed
```

(10 route tests + 4 LLM tests + 3 scoring tests = 17)

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "feat(api): Phase 5 scoring engine complete — 17 tests passing"
```

---

## Self-Review

**Spec coverage:**

- `complete_json(model, system, user, schema, cache_blocks=None)` — implemented as `complete_json(model, system, user, schema)` where system/user accept blocks with cache_control inline. Equivalent; cleaner API. ✓
- Validates response against Pydantic model — `schema.model_validate_json(raw)` ✓
- Retries once on parse failure — `for attempt in range(2)` loop ✓
- Returns parsed object — `return schema.model_validate_json(raw)` ✓
- `score_review` loads Review + Case — `session.get(Review, review_id)` + `session.get(Case, review.case_id)` ✓
- Runs 4 criteria — CMI/OTA/EQ via haiku, EA rule-based ✓
- Aggregates — `mean(4 scores) * 10` ✓
- Generates two narrative paragraphs — sonnet call returns `NarrativeResult` ✓
- Writes Score row — `session.add(score); session.commit()` ✓
- Returns Score — `return score` ✓
- Prompt uses XML-tagged sections `<case>`, `<truth>`, `<analyst_reasoning>`, `<rubric>`, `<output_schema>` ✓
- `cache_control` on system prompt and rubric — system block has `cache_control: {type: ephemeral}` ✓
- Cache log line showing `cache_read_input_tokens` — `logger.info("llm model=... cache_read=%d ...")` ✓
- POST /reviews wires real scoring — already wired; same `score_review` call, no change needed ✓
- 3 test scenarios — perfect (≥85), over-trust (≤40), near-match (EA=6, 50–70) ✓

**Placeholder scan:** None found.

**Type consistency:**
- `GradingResult`, `CriterionGrade`, `NarrativeResult` defined in `scoring.py` Task 3, imported in `test_scoring.py` Task 3 ✓
- `complete_json` defined in `llm.py` Task 2, imported in `scoring.py` Task 3 as `from app.services.llm import complete_json` ✓
- `score_review(review_id: str) -> Score | None` used consistently ✓
- `_CONCERNED` set used in `_score_escalation` — reject/escalate/ask_evidence/flag_assumption ✓
- `over_trust_delta = (ota_s - 5) / 5` — matches schema example: OTA=8 → delta=0.6 ✓
