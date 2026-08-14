import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, func, ForeignKey, Boolean, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Feature(Base):
    """A sellable module, e.g. 'employee_management', 'menu', 'analytics',
    'income_expenses'. This is the catalog — one row per feature, shared
    across all tenants."""

    __tablename__ = "features"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key: Mapped[str] = mapped_column(String, unique=True, nullable=False)  # 'menu', 'analytics'...
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    monthly_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    yearly_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    image_urls: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    video_url: Mapped[str | None] = mapped_column(String, nullable=True)
    tenant_features: Mapped[list["TenantFeature"]] = relationship(back_populates="feature")


class TenantFeature(Base):
    """Which features a given tenant has enabled. This is the single
    source of truth both backend and frontend check before showing/allowing
    anything feature-gated."""

    __tablename__ = "tenant_features"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), primary_key=True
    )
    feature_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("features.id"), primary_key=True
    )
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    activated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    tenant: Mapped["Tenant"] = relationship(back_populates="tenant_features")
    feature: Mapped["Feature"] = relationship(back_populates="tenant_features")
