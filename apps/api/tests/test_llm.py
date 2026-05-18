import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from pydantic import BaseModel
from app.services.llm import complete_json


class _Demo(BaseModel):
    value: int
    label: str


def _mock_response(text: str) -> MagicMock:
    usage = MagicMock()
    usage.input_tokens = 100
    usage.output_tokens = 50
    usage.cache_read_input_tokens = 80
    usage.cache_creation_input_tokens = 20
    content = MagicMock()
    content.text = text
    msg = MagicMock()
    msg.content = [content]
    msg.usage = usage
    return msg


async def test_complete_json_success():
    with patch("app.services.llm._client") as mock_client:
        mock_client.messages.create = AsyncMock(
            return_value=_mock_response('{"value": 42, "label": "hello"}')
        )
        result = await complete_json(
            model="claude-haiku-4-5-20251001",
            system=[{"type": "text", "text": "You grade stuff."}],
            user=[{"type": "text", "text": "Grade this."}],
            schema=_Demo,
        )
    assert result.value == 42
    assert result.label == "hello"


async def test_complete_json_retries_on_bad_json():
    with patch("app.services.llm._client") as mock_client:
        mock_client.messages.create = AsyncMock(side_effect=[
            _mock_response("not json at all"),
            _mock_response('{"value": 7, "label": "retry"}'),
        ])
        result = await complete_json(
            model="claude-haiku-4-5-20251001",
            system=[{"type": "text", "text": "system"}],
            user=[{"type": "text", "text": "user"}],
            schema=_Demo,
        )
    assert result.value == 7
    assert mock_client.messages.create.call_count == 2


async def test_complete_json_raises_after_two_failures():
    with patch("app.services.llm._client") as mock_client:
        mock_client.messages.create = AsyncMock(
            return_value=_mock_response("still bad json {{{")
        )
        with pytest.raises(ValueError, match="unparseable"):
            await complete_json(
                model="claude-haiku-4-5-20251001",
                system=[{"type": "text", "text": "system"}],
                user=[{"type": "text", "text": "user"}],
                schema=_Demo,
            )
    assert mock_client.messages.create.call_count == 2


async def test_complete_json_passes_cache_blocks():
    """Verify cache_control blocks are forwarded to the API call unchanged."""
    captured = {}

    async def _capture(**kwargs):
        captured.update(kwargs)
        return _mock_response('{"value": 1, "label": "x"}')

    with patch("app.services.llm._client") as mock_client:
        mock_client.messages.create = _capture
        await complete_json(
            model="claude-haiku-4-5-20251001",
            system=[{"type": "text", "text": "rubric", "cache_control": {"type": "ephemeral"}}],
            user=[{"type": "text", "text": "question"}],
            schema=_Demo,
        )
    assert captured["system"][0]["cache_control"] == {"type": "ephemeral"}
