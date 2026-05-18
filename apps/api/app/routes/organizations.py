from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional

from app.db.session import get_session
from app.models.user import User
from app.models.organization import Organization
from app.models.custom_case import CustomCase
from app.models.review import Review
from app.models.score import Score
from app.core.security import get_current_user
from app.services.email import send_invitation_email

router = APIRouter(prefix="/organizations", tags=["organizations"])


class OrgCreate(BaseModel):
    name: str

class OrgResponse(BaseModel):
    id: str
    name: str
    admin_user_id: str
    subscription_status: str
    max_members: int

class CustomCaseCreate(BaseModel):
    title: str
    category: str = "Custom"
    difficulty: str = "medium"
    scenario_text: str
    dataset: list = []
    correct_decision: str = "escalate"
    correct_issue_summary: str = ""

class CustomCaseResponse(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str
    scenario_text: str
    dataset: list
    organization_id: str
    created_by: str

class InviteMember(BaseModel):
    email: str


class MemberScore(BaseModel):
    user_id: str
    email: str
    full_name: Optional[str]
    cases_reviewed: int
    average_score: Optional[float]


@router.post("", response_model=OrgResponse)
async def create_organization(
    body: OrgCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    if current_user.subscription_status not in ("teams",):
        raise HTTPException(status_code=403, detail="Teams subscription required to create an organization")

    org = Organization(name=body.name, admin_user_id=current_user.id)
    db.add(org)
    await db.flush()

    current_user.account_type = "institutional_admin"
    current_user.organization_id = org.id
    db.add(current_user)
    await db.commit()
    await db.refresh(org)
    return org


class OrgMemberInfo(BaseModel):
    id: str
    name: str
    admin_user_id: str
    subscription_status: str
    max_members: int
    member_count: int
    your_role: str  # "admin" | "member"


@router.get("/{org_id}", response_model=OrgResponse)
async def get_organization(
    org_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    if current_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    stmt = select(Organization).where(Organization.id == org_id)
    result = await db.execute(stmt)
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.get("/{org_id}/my-info", response_model=OrgMemberInfo)
async def get_my_org_info(
    org_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    if current_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    org = (await db.execute(select(Organization).where(Organization.id == org_id))).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    member_count = len((await db.execute(select(User).where(User.organization_id == org_id))).scalars().all())
    role = "admin" if current_user.account_type == "institutional_admin" else "member"
    return OrgMemberInfo(
        id=org.id,
        name=org.name,
        admin_user_id=org.admin_user_id,
        subscription_status=org.subscription_status,
        max_members=org.max_members,
        member_count=member_count,
        your_role=role,
    )


@router.post("/{org_id}/cases", response_model=CustomCaseResponse)
async def create_custom_case(
    org_id: str,
    body: CustomCaseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    if current_user.account_type != "institutional_admin" or current_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Only org admins can create cases")

    case = CustomCase(
        organization_id=org_id,
        created_by=current_user.id,
        title=body.title,
        category=body.category,
        difficulty=body.difficulty,
        scenario_text=body.scenario_text,
        dataset=body.dataset,
        correct_decision=body.correct_decision,
        correct_issue_summary=body.correct_issue_summary,
    )
    db.add(case)
    await db.commit()
    await db.refresh(case)
    return case


@router.get("/{org_id}/cases", response_model=list[CustomCaseResponse])
async def list_custom_cases(
    org_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    if current_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    stmt = select(CustomCase).where(
        CustomCase.organization_id == org_id,
        CustomCase.is_active == True,
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{org_id}/members/scores", response_model=list[MemberScore])
async def get_member_scores(
    org_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    if current_user.account_type != "institutional_admin" or current_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Only org admins can view member scores")

    members = (await db.execute(select(User).where(User.organization_id == org_id))).scalars().all()

    result = []
    for member in members:
        score_rows = (await db.execute(
            select(Score.total)
            .join(Review, Review.id == Score.review_id)
            .where(Review.user_id == member.id)
        )).all()
        totals = [r.total for r in score_rows]
        result.append(MemberScore(
            user_id=member.id,
            email=member.email,
            full_name=member.full_name,
            cases_reviewed=len(totals),
            average_score=round(sum(totals) / len(totals), 1) if totals else None,
        ))
    return result


@router.post("/{org_id}/invite")
async def invite_member(
    org_id: str,
    body: InviteMember,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    if current_user.account_type != "institutional_admin" or current_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Only org admins can invite members")

    stmt = select(User).where(User.email == body.email)
    result = await db.execute(stmt)
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="User not found — they must register first")

    stmt_count = select(User).where(User.organization_id == org_id)
    count_result = await db.execute(stmt_count)
    current_count = len(count_result.scalars().all())

    org_stmt = select(Organization).where(Organization.id == org_id)
    org_result = await db.execute(org_stmt)
    org = org_result.scalar_one_or_none()
    if org and current_count >= org.max_members:
        raise HTTPException(status_code=400, detail="Organization member limit reached")

    member.account_type = "institutional_member"
    member.organization_id = org_id
    db.add(member)
    await db.commit()

    org_name = org.name if org else "your organization"
    background_tasks.add_task(send_invitation_email, body.email, org_name)

    return {"status": "ok", "member_id": member.id}
