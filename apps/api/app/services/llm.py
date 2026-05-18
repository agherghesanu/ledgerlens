import json
import logging
import os
from typing import TypeVar, Type

from google import genai
from google.genai import types
from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        key = os.getenv("GEMINI_API_KEY", "")
        if not key:
            raise RuntimeError("GEMINI_API_KEY not set — add it to apps/api/.env")
        _client = genai.Client(api_key=key)
    return _client


async def complete_json(
    model: str,
    system: list[dict],
    user: list[dict],
    schema: Type[T],
) -> T:
    """Call Gemini with system/user content blocks, parse JSON as Pydantic model.
    Retries once on parse failure."""
    system_text = "\n\n".join(b["text"] for b in system if b.get("type") == "text")
    user_text = "\n\n".join(b["text"] for b in user if b.get("type") == "text")

    client = _get_client()
    last_exc: Exception | None = None
    for attempt in range(2):
        response = await client.aio.models.generate_content(
            model=model,
            contents=user_text,
            config=types.GenerateContentConfig(
                system_instruction=system_text,
                response_mime_type="application/json",
            ),
        )
        raw = response.text
        logger.info("gemini model=%s attempt=%d chars=%d", model, attempt, len(raw))
        try:
            return schema.model_validate_json(raw)
        except (ValidationError, json.JSONDecodeError) as exc:
            last_exc = exc
            if attempt == 0:
                logger.warning("LLM parse failed attempt 0: %s — retrying", exc)

    raise ValueError(
        f"LLM returned unparseable response after 2 attempts: {last_exc}"
    ) from last_exc
