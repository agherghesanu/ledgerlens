---
name: new-case
description: Generate a new finance case study with AI mistake injected, save to seed/cases/
type: workflow
---

# Generate New Finance Case

## Goal
Produce a realistic accounting/finance case JSON matching the schema in `packages/types/case.schema.json`.

## Steps

1. **Pick domain** — ask user: budget variance, revenue recognition, ratio analysis, consolidation, etc.
2. **Draft scenario** — 2–3 paragraph narrative with realistic company name, numbers, and context
3. **Write questions** — 3–5 analytical questions testing different skills
4. **Write expert answer** — model answer hitting all rubric dimensions
5. **Inject AI mistake** — use `ai-mistake` skill to plant one plausible error
6. **Validate schema** — ensure output matches `packages/types/case.schema.json`
7. **Save** — write to `apps/api/seed/cases/NNN_slug.json` with next available number

## Output format
Follow `case.schema.json` exactly. All monetary values in USD unless specified.
