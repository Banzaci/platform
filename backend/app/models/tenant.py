import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Float, ForeignKey, func, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class Tenant(Base):
    """One company / customer. Every other tenant-scoped table has a
    tenant_id FK back to this table."""

    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    subdomain: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    custom_domain: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)

    # Shown on the central hub site (google.com/booking.com-style listing)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    location: Mapped[str | None] = mapped_column(String, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    short_description: Mapped[str | None] = mapped_column(String, nullable=True)

    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    theme: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )
    properties: Mapped[list["Property"]] = relationship(
        back_populates="tenant",
        cascade="all, delete-orphan",
    )

    latitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    longitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )
    country_id: Mapped[str | None] = mapped_column(
        String,
        ForeignKey("countries.id"),
        nullable=True,
    )

    city_id: Mapped[str | None] = mapped_column(
        String,
        ForeignKey("cities.id"),
        nullable=True,
    )

    country_rel: Mapped["Country | None"] = relationship(
        "Country",
        lazy="joined",
    )

    city_rel: Mapped["City | None"] = relationship(
        "City",
        lazy="joined",
    )

    pages: Mapped[list["Page"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    tenant_features: Mapped[list["TenantFeature"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    memberships: Mapped[list["TenantMembership"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")

    bookings: Mapped[list["Booking"]] = relationship(
        "Booking",
        back_populates="tenant",
        cascade="all, delete-orphan",
    )

    theme_history: Mapped[list["ThemeHistory"]] = relationship(
        "ThemeHistory",
        cascade="all, delete-orphan",
    )

    deleted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    cancellation_policy: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=lambda: {
            "free_cancellation_days": 14,
            "partial_refund_hours": 48,
            "partial_refund_percent": 50,
        },
    )
