from __future__ import annotations
import uuid
from datetime import datetime, UTC
from sqlalchemy import String, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    
    # Stripe billing fields
    stripe_customer_id: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    subscription_status: Mapped[str] = mapped_column(String, nullable=False, default="free")

    # Account type and org membership
    account_type: Mapped[str] = mapped_column(String, nullable=False, default="individual")
    # "individual" | "institutional_admin" | "institutional_member"
    organization_id: Mapped[str | None] = mapped_column(String, nullable=True, default=None)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
