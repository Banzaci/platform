import enum
import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
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

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "properties.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    reason: Mapped[BlockedReason | None] = mapped_column(
        Enum(BlockedReason, name="blocked_reason_enum"),
        nullable=True,
    )

    note: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    ical_source_id: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
        index=True,
    )

    package_id: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
        index=True,
    )

    external_uid: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    property = relationship(
        "Property",
        back_populates="blocked_periods",
    )