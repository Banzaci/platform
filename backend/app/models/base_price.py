# app/models/base_price.py
import uuid
from datetime import datetime
from sqlalchemy import String, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class BasePrice(Base):
    __tablename__ = "base_prices"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id: Mapped[str] = mapped_column(String, ForeignKey("rooms.id"), nullable=False, unique=True)
    daily_price: Mapped[float] = mapped_column(Float, nullable=False)
    monthly_price: Mapped[float] = mapped_column(Float, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    room = relationship("Room", back_populates="base_price")