import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TenantKnowledge(Base):
    __tablename__ = "tenant_knowledge"

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

    category: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    intent: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    question: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    answer: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    priority: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    source: Mapped[str] = mapped_column(
        String(30),
        default="manual",
        nullable=False,
    )
    
    template_key: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )