---
name: ai-mistake
description: Inject a realistic AI mistake into a finance case to test student critical thinking
type: workflow
---

# AI Mistake Injection Skill

## Goal
Plant one subtle but detectable error that a naive LLM would make, for students to identify.

## Mistake types (pick one per case)
- **Off-by-one period** — revenue recognized one quarter early
- **Wrong ratio denominator** — e.g., net income / total assets instead of equity
- **Currency confusion** — mixed USD/EUR without conversion
- **Sign flip** — cost treated as revenue or vice versa
- **Benchmark hallucination** — cited industry average that doesn't match known data
- **Materiality miss** — flagged immaterial variance, ignored material one

## Rules
1. Mistake must be checkable — student can find it with provided data
2. Mistake must be plausible — something an LLM confidently produces
3. Only ONE mistake per case
4. Document the mistake in `case.json` under `ai_mistake` field (hidden from student view)

## Validation
After injecting, verify the expert answer does NOT contain the mistake — expert answer is always correct.
