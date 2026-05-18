from datetime import date
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr

from app.db.session import get_session
from app.models.user import User
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.services.email import send_welcome_email

router = APIRouter(prefix="/auth", tags=["Auth"])


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    date_of_birth: Optional[date] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    subscription_status: str
    account_type: str = "individual"
    organization_id: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


@router.post("/register", response_model=UserResponse)
async def register(
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_session),
):
    stmt = select(User).where(User.email == user_in.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        date_of_birth=user_in.date_of_birth,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    background_tasks.add_task(send_welcome_email, user_in.email)
    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_session),
):
    stmt = select(User).where(User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_me(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    if body.full_name is not None:
        current_user.full_name = body.full_name

    if body.date_of_birth is not None:
        current_user.date_of_birth = body.date_of_birth

    if body.email is not None and body.email != current_user.email:
        stmt = select(User).where(User.email == body.email)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = body.email

    if body.new_password:
        if not body.current_password:
            raise HTTPException(status_code=400, detail="current_password required to set new password")
        if not verify_password(body.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password incorrect")
        current_user.hashed_password = get_password_hash(body.new_password)

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user
