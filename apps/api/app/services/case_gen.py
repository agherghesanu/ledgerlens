import json
from pathlib import Path

from app.services.llm import complete

_PROMPT = Path(__file__).parent.parent / "prompts" / "expert_feedback_v1.md"


def generate_case(domain: str) -> dict:
    """Generate a new finance case JSON. Used by seed script and admin endpoint."""
    system = _PROMPT.read_text()
    user = f"Generate a finance case study for domain: {domain}"
    raw = complete(system, user, max_tokens=4096)
    return json.loads(raw)
