import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from pydantic import BaseModel
from app.services.llm import complete_json


class _Demo(BaseModel):
    value: int
    label: str


def _mock_response(text: str) -> MagicMock:
    msg = MagicMock()
    msg.text = text
    return msg


async def test_complete_json_success():
    with patch("app.services.llm._client") as mock_client:
        mock_client.aio.models.generate_content = AsyncMock(
            return_value=_mock_response('{"value": 42, "label": "hello"}')
        )
        result = await complete_json(
            model="gemini-2.5-flash",
            system=[{"type": "text", "text": "You grade stuff."}],
            user=[{"type": "text", "text": "Grade this."}],
            schema=_Demo,
        )
    assert result.value == 42
    assert result.label == "hello"


async def test_complete_json_retries_on_bad_json():
    with patch("app.services.llm._client") as mock_client:
        mock_client.aio.models.generate_content = AsyncMock(side_effect=[
            _mock_response("not json at all"),
            _mock_response('{"value": 7, "label": "retry"}'),
        ])
        result = await complete_json(
            model="gemini-2.5-flash",
            system=[{"type": "text", "text": "system"}],
            user=[{"type": "text", "text": "user"}],
            schema=_Demo,
        )
    assert result.value == 7
    assert mock_client.aio.models.generate_content.call_count == 2


async def test_complete_json_raises_after_two_failures():
    with patch("app.services.llm._client") as mock_client:
        mock_client.aio.models.generate_content = AsyncMock(
            return_value=_mock_response("still bad json {{{")
        )
        with pytest.raises(ValueError, match="unparseable"):
            await complete_json(
                model="gemini-2.5-flash",
                system=[{"type": "text", "text": "system"}],
                user=[{"type": "text", "text": "user"}],
                schema=_Demo,
            )
    assert mock_client.aio.models.generate_content.call_count == 2


async def test_complete_json_passes_model_and_contents():
    """Verify model and user content are forwarded to Gemini call."""
    captured = {}

    async def _capture(**kwargs):
        captured.update(kwargs)
        return _mock_response('{"value": 1, "label": "x"}')

    with patch("app.services.llm._client") as mock_client:
        mock_client.aio.models.generate_content = _capture
        await complete_json(
            model="gemini-2.5-flash",
            system=[{"type": "text", "text": "rubric"}],
            user=[{"type": "text", "text": "question"}],
            schema=_Demo,
        )
    assert captured["model"] == "gemini-2.5-flash"
    assert "question" in captured["contents"]
