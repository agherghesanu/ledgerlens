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
