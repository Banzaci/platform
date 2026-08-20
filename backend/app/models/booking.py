import enum
import uuid
from datetime import datetime, date

from sqlalchemy import (
    String,
    Date,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    Enum,
    Boolean,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BookingStatus(str, enum.Enum):
    pending_payment = "pending_payment"
    payment_processing = "payment_processing"
    payment_success = "payment_success"
    confirmed = "confirmed"
    cancelled = "cancelled"
    payment_failed = "payment_failed"


class Booking(Base):
    __tablename__ = "bookings"

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

    booking_ref: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Nullable eftersom gästen inte behöver ett konto
    guest_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    check_in: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    check_out: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    guests: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    units: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    total_price: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    status: Mapped[BookingStatus] = mapped_column(
        Enum(
            BookingStatus,
            name="booking_status_enum",
        ),
        default=BookingStatus.pending_payment,
        nullable=False,
    )

    is_walk_in: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    guest_name: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    guest_email: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    guest_phone: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    special_requests: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    provider_payment_intent_id: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    payment_method: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="online",
    )

    external_booking_id: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
        index=True,
    )

    source: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    is_no_show: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    no_show_reason: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
    )

    property = relationship(
        "Property",
        back_populates="bookings",
    )

    tenant = relationship(
        "Tenant",
        back_populates="bookings",
    )

    guest = relationship(
        "User",
        foreign_keys=[guest_id],
    )

    public_token: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=True,
        index=True,
        default=lambda: str(uuid.uuid4()),
    )

    provider_refund_id: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
        index=True,
    )

    refund_status: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    refund_amount: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )