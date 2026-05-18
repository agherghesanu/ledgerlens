from __future__ import annotations
from typing import Any
from sqlalchemy import String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    difficulty: Mapped[str] = mapped_column(String, nullable=False)
    dataset: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False)
    ai_narrative: Mapped[str] = mapped_column(Text, nullable=False)
    ai_recommendation: Mapped[str] = mapped_column(String, nullable=False)
    hidden_truth: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)

    reviews: Mapped[list[Review]] = relationship("Review", back_populates="case")
