import anthropic

_client = anthropic.Anthropic()
MODEL = "claude-sonnet-4-6"


def complete(system: str, user: str, *, max_tokens: int = 2048) -> str:
    """Single-turn completion. All LLM calls route through here."""
    message = _client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    return message.content[0].text
