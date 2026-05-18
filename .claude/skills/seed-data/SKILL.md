---
name: seed-data
description: Add N seed cases to the database for dev/testing
type: workflow
---

# Seed Data Skill

## Goal
Populate `apps/api/seed/cases/` with N valid case JSON files, then load into DB.

## Steps

1. **Count existing** — check current max case number in `seed/cases/`
2. **Generate cases** — use `new-case` skill N times with varied domains
3. **Validate** — run `python -c "import json, jsonschema; ..."` against `case.schema.json`
4. **Load** — run `python apps/api/app/db/seed.py` to upsert into DB
5. **Verify** — hit `GET /cases` and confirm count increased

## Domain spread (for N cases)
Aim for variety: budget variance, revenue recognition, cost allocation, consolidation, ratio analysis, disclosure review

## File naming
`NNN_short_slug.json` — three-digit zero-padded number, lowercase, underscores
