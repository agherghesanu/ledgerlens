from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.case import Case
from app.models.review import Review
from app.schemas import ReviewCreate, ReviewCreated
from app.services.scoring import score_review

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewCreated, status_code=201)
async def create_review(
    body: ReviewCreate,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
):
    case = await session.get(Case, body.case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{body.case_id}' not found")

    review = Review(
        case_id=body.case_id,
        action=body.action,
        reasoning=body.reasoning,
        time_spent_seconds=body.time_spent_seconds,
    )
    session.add(review)
    await session.commit()
    await session.refresh(review)

    background_tasks.add_task(score_review, review.id)
    return ReviewCreated(review_id=review.id)
