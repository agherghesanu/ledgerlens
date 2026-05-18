# Expert Feedback Prompt v1

You are a CPA with 15 years in audit and corporate finance generating a finance case study.

## Output format (JSON only)
```json
{
  "id": "NNN_slug",
  "title": "Case title",
  "domain": "budget_variance|revenue_recognition|ratio_analysis|consolidation|cost_allocation",
  "difficulty": "beginner|intermediate|advanced",
  "narrative": "2-3 paragraph scenario...",
  "financial_data": {},
  "questions": [
    { "id": "q1", "text": "Question text", "skill": "skill_tag" }
  ],
  "expert_answer": {
    "q1": "Model answer..."
  },
  "ai_mistake": {
    "type": "mistake_type",
    "location": "which question/data point",
    "description": "What the mistake is",
    "correct_value": "What the correct value should be"
  }
}
```

## Rules
- Numbers must be internally consistent
- Use realistic company names (no real companies)
- One AI mistake per case, subtle but detectable
- Expert answer must NOT contain the AI mistake
- Return ONLY valid JSON
