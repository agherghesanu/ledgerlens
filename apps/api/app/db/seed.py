import json
import logging
from pathlib import Path

import jsonschema
from sqlalchemy import func, select

from app.db.session import AsyncSessionLocal
from app.models.case import Case  # noqa: F401
import app.models.review  # noqa: F401 — ensures Review is registered before mapper config
import app.models.score   # noqa: F401 — ensures Score is registered before mapper config

logger = logging.getLogger(__name__)

_CASES_DIR = Path(__file__).parents[2] / "seed" / "cases"
_parents = Path(__file__).parents
_SCHEMA_PATH = (_parents[4] / "packages" / "types" / "case.schema.json") if len(_parents) > 4 else None


def _load_schema() -> dict | None:
    if _SCHEMA_PATH is None or not _SCHEMA_PATH.exists():
        return None
    return json.loads(_SCHEMA_PATH.read_text())


def _map_case(raw: dict) -> Case:
    """Map camelCase JSON Schema keys → snake_case ORM columns."""
    return Case(
        id=raw["id"],
        title=raw["title"],
        category=raw["category"],
        difficulty=raw["difficulty"],
        dataset=raw["dataset"],
        ai_narrative=raw["aiNarrative"],
        ai_recommendation=raw["aiRecommendation"],
        hidden_truth=raw["hiddenTruth"],
    )


async def seed_if_empty() -> None:
    """Load seed cases if the cases table is empty. Validates each file against the schema."""
    async with AsyncSessionLocal() as session:
        count = await session.scalar(select(func.count()).select_from(Case))
        if count and count > 0:
            return

        schema = _load_schema()
        inserted = 0
        for path in sorted(_CASES_DIR.glob("*.json")):
            raw = json.loads(path.read_text(encoding='utf-8'))
            if schema is not None:
                try:
                    jsonschema.validate(raw, schema)
                except jsonschema.ValidationError as exc:
                    logger.warning("Skipping %s — schema validation failed: %s", path.name, exc.message)
                    continue
            session.add(_map_case(raw))
            inserted += 1

        await session.commit()
        logger.info("Seeded %d cases", inserted)
