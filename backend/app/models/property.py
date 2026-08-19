from datetime import datetime
import uuid

from sqlalchemy import Boolean, DateTime, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    max_guests: Mapped[int] = mapped_column(
        Integer,
        default=2,
    )

    bedrooms: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    beds: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    bathrooms: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    units: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    amenities: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    is_open: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    calendar_token: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )

    tenant = relationship(
        "Tenant",
        back_populates="properties",
    )

    base_price = relationship(
        "BasePrice",
        back_populates="property",
        uselist=False,
        cascade="all, delete-orphan",
    )

    price_periods = relationship(
        "PricePeriod",
        back_populates="property",
        cascade="all, delete-orphan",
    )

    images: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    base_price: Mapped["BasePrice | None"] = relationship(
        "BasePrice",
        back_populates="property",
        uselist=False,
        cascade="all, delete-orphan",
    )

    blocked_periods: Mapped[list["BlockedPeriod"]] = relationship(
        "BlockedPeriod",
        back_populates="property",
        cascade="all, delete-orphan",
    )

    bookings: Mapped[list["Booking"]] = relationship(
        "Booking",
        back_populates="property",
        cascade="all, delete-orphan",
    )