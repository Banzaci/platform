# app/models/price_period.py
import uuid
from datetime import date, datetime
from sqlalchemy import String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class PricePeriod(Base):
    __tablename__ = "price_periods"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id: Mapped[str] = mapped_column(String, ForeignKey("rooms.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    daily_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    monthly_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    room = relationship("Room", back_populates="price_periods")