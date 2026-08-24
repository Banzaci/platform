import uuid
from sqlalchemy import String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class TenantFont(Base):
    __tablename__ = "tenant_fonts"

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

    url: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    format: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    public_id: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )