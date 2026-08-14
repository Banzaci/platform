import uuid
import enum
from datetime import datetime
from sqlalchemy import String, ForeignKey, Date, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class BlockedReason(str, enum.Enum):
    renovation = "renovation"
    maintenance = "maintenance"
    walk_in = "walk_in"
    owner_use = "owner_use"
    other = "other"


class BlockedPeriod(Base):
    __tablename__ = "blocked_periods"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id: Mapped[str] = mapped_column(String, ForeignKey("rooms.id"), nullable=False, index=True)
    start_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    end_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    reason: Mapped[str] = mapped_column(Enum(BlockedReason), nullable=True)
    note: Mapped[str] = mapped_column(String, nullable=True)
    ical_source_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("room_ical_sources.id"), nullable=True, index=True
    )
    package_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("packages.id"), nullable=True, index=True
    )
    external_uid: Mapped[str | None] = mapped_column(String, nullable=True)
    room = relationship("Room", back_populates="blocked_periods")