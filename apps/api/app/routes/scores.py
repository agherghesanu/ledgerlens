from typing import Union

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.score import Score
from app.schemas import ScorePending, ScoreResponse

router = APIRouter(prefix="/reviews", tags=["scores"])


@router.get("/{review_id}/score", response_model=Union[ScoreResponse, ScorePending])
async def get_score(review_id: str, session: AsyncSession = Depends(get_session)):
    score = await session.scalar(select(Score).where(Score.review_id == review_id))
    if not score:
        return ScorePending()
    return score
