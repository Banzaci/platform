import enum
import uuid
from datetime import datetime

from sqlalchemy import String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PriceType(str, enum.Enum):
    daily = "daily"
    monthly = "monthly"


class RoomPrice(Base):
    __tablename__ = "room_prices"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    room_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)

    price_type: Mapped[PriceType] = mapped_column(
        Enum(PriceType, name="price_type_enum"),
        nullable=False,
        default=PriceType.daily,
        index=True,
    )

    room: Mapped["Room"] = relationship(back_populates="prices")