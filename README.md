# LedgerLens

AI-powered finance case study platform. Students analyze accounting scenarios, submit reviews, and receive detailed rubric-based feedback scored by Claude.

## Quick start

```bash
docker compose up
# web → http://localhost:3000
# api → http://localhost:8000/docs
```

## Project structure

```
apps/web/     Next.js 15 frontend
apps/api/     FastAPI backend + LLM scoring
packages/     Shared JSON Schema types
```
