from __future__ import annotations
import uuid
from datetime import datetime, UTC
from sqlalchemy import String, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base

class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    admin_user_id: Mapped[str] = mapped_column(String, nullable=False)
    subscription_status: Mapped[str] = mapped_column(String, nullable=False, default="teams")
    max_members: Mapped[int] = mapped_column(Integer, nullable=False, default=25)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
