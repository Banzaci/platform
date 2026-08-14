import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, func, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Page(Base):
    """One page (e.g. 'contact', 'home') for one tenant.

    `fields` holds the dynamic content blocks for that page — text fields,
    textareas, images, galleries. Text field values are dicts keyed by
    language code, e.g. {"sv": "...", "en": "..."} for multilingual support.

    `theme` holds design tokens (colors, logo, font, layout_variant) so the
    same component tree renders a different look per tenant.
    """

    __tablename__ = "pages"
    __table_args__ = (UniqueConstraint("tenant_id", "slug", name="uq_tenant_slug"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )

    slug: Mapped[str] = mapped_column(String, nullable=False)  # 'contact', 'home', 'about'
    layout_variant: Mapped[str] = mapped_column(String, default="default")

    fields: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    theme: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    schema_version: Mapped[int] = mapped_column(default=1)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    tenant: Mapped["Tenant"] = relationship(back_populates="pages")
