from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user, get_optional_user
from app.db.session import get_session
from app.models.case import Case
from app.models.user import User
from app.schemas import CasePublic
from app.services.case_gen import generate_case

router = APIRouter(prefix="/cases", tags=["cases"])


class GenerateRequest(BaseModel):
    category: str | None = None
    difficulty: Literal["easy", "medium", "hard"] | None = None


@router.get("", response_model=list[CasePublic])
async def list_cases(
    category: str | None = Query(None),
    difficulty: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
    current_user: User | None = Depends(get_optional_user),
):
    stmt = select(Case).order_by(Case.created_at.desc())
    if category:
        stmt = stmt.where(Case.category == category)
    if difficulty:
        stmt = stmt.where(Case.difficulty == difficulty)

    user_org = current_user.organization_id if current_user else None
    if user_org:
        stmt = stmt.where(or_(Case.organization_id.is_(None), Case.organization_id == user_org))
    else:
        stmt = stmt.where(Case.organization_id.is_(None))

    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/{case_id}", response_model=CasePublic)
async def get_case(
    case_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User | None = Depends(get_optional_user),
):
    case = await session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.organization_id:
        user_org = current_user.organization_id if current_user else None
        if user_org != case.organization_id:
            raise HTTPException(status_code=403, detail="Not a member of this organization")
    return case


@router.post("/generate", response_model=CasePublic, status_code=201)
async def generate_new_case(
    body: GenerateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Generate a new finance case via Gemini and persist it."""
    try:
        data = await generate_case(
            category=body.category,
            difficulty=body.difficulty,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Case generation failed: {e}")

    case = Case(**data)
    session.add(case)
    await session.commit()
    await session.refresh(case)
    return case
