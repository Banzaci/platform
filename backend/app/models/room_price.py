from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Float, DateTime, Enum, ForeignKey
from datetime import datetime
from app.db.base import Base
import enum


class PriceType(str, enum.Enum):
    daily = "daily"
    monthly = "monthly"


class RoomPrice(Base):
    __tablename__ = "room_prices"

    id: Mapped[str] = mapped_column(String, primary_key=True)

    room_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("rooms.id"),   # 🔥 FIX
        index=True,
        nullable=False
    )

    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)

    price_type: Mapped[PriceType] = mapped_column(
        Enum(PriceType, name="price_type_enum"),
        nullable=False,
        default=PriceType.daily,
        index=True,
    )

    room = relationship("Room", back_populates="prices")  # 🔥 ADD