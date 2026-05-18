from __future__ import annotations
import uuid
from datetime import datetime, UTC
from sqlalchemy import String, DateTime, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base

class CustomCase(Base):
    __tablename__ = "custom_cases"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    created_by: Mapped[str] = mapped_column(String, nullable=False)  # user_id
    title: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False, default="Custom")
    difficulty: Mapped[str] = mapped_column(String, nullable=False, default="medium")
    scenario_text: Mapped[str] = mapped_column(Text, nullable=False)  # The problem statement
    dataset: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    correct_decision: Mapped[str] = mapped_column(String, nullable=False, default="escalate")
    correct_issue_summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
