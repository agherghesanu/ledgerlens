from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.case import Case
from app.schemas import CaseListItem, CasePublic

router = APIRouter(prefix="/cases", tags=["cases"])


@router.get("", response_model=list[CaseListItem])
async def list_cases(
    category: str | None = Query(None),
    difficulty: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
):
    stmt = select(Case)
    if category:
        stmt = stmt.where(Case.category == category)
    if difficulty:
        stmt = stmt.where(Case.difficulty == difficulty)
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/{case_id}", response_model=CasePublic)
async def get_case(case_id: str, session: AsyncSession = Depends(get_session)):
    case = await session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case
