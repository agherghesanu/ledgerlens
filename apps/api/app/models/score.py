from __future__ import annotations
import uuid
from typing import Any, TYPE_CHECKING
from sqlalchemy import String, Text, Float, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

if TYPE_CHECKING:
    from app.models.review import Review


class Score(Base):
    __tablename__ = "scores"
    __table_args__ = (UniqueConstraint("review_id"),)

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    review_id: Mapped[str] = mapped_column(
        String, ForeignKey("reviews.id"), nullable=False, unique=True
    )
    criteria: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False)
    total: Mapped[float] = mapped_column(Float, nullable=False)
    feedback_summary: Mapped[str] = mapped_column(Text, nullable=False)
    expert_would_do: Mapped[str] = mapped_column(Text, nullable=False)
    over_trust_delta: Mapped[float] = mapped_column(Float, nullable=False)

    review: Mapped[Review] = relationship("Review", back_populates="score")
