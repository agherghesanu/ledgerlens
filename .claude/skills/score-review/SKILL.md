---
name: score-review
description: Build, edit, or debug the LedgerLens scoring engine. Use whenever working on rubric logic, the Claude API scoring prompt, or score aggregation.
---

# Scoring rubric (v1)

A Review is scored against 4 criteria, each 0–10:

1. **Caught main issue (CMI)** — Did the reasoning explicitly identify the case's `correctIssueSummary`? Use Claude to grade this with a structured prompt that returns `{score: 0-10, evidence: "verbatim quote from reasoning"}`.
2. **Over-trusted AI (OTA)** — Did the user accept the AI's recommendation without challenging the key assumption? Lower score = more over-trust (this gets *inverted* when aggregating into Over-Trust Index).
3. **Escalation appropriateness (EA)** — Did the chosen action match `correctActions`? Pure rule-based: exact match = 10, near match (e.g., chose Reject when correct was Escalate) = 6, wrong = 0.
4. **Explanation quality (EQ)** — Is the reasoning specific, evidence-based, and finance-relevant? Use Claude with a calibrated prompt.

Final aggregated `total` is the mean of all four, displayed as a percentage.

## Prompt template location

The Claude prompt for criteria CMI and EQ lives in `apps/api/app/prompts/scoring_v1.md`. Versioned because we WILL want to tune this. The active version is set by env var `SCORING_PROMPT_VERSION`.

## Model choice

Use `claude-haiku-4-5` for criteria CMI and EQ (cheap, fast, good enough for graded eval). Use `claude-sonnet-4-6` for generating the `expertFeedback` and `whatExpertWouldDo` narrative paragraphs (these are user-facing prose, quality matters more).

## Prompt caching

Cache the case's truth data + rubric instructions. The only thing that varies per review is the user's reasoning. Use the Anthropic SDK `cache_control: {type: "ephemeral"}` block. Cuts per-review cost by ~80% after the first call.

## Output shape

The service returns a dict matching `score.schema.json`. Always parse Claude's JSON output with Pydantic — never trust the model to produce valid JSON without validation + one retry on parse failure.