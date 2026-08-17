import uuid
from datetime import datetime

from pydantic import BaseModel


LocalizedText = dict[str, str]


class TenantKnowledgeCreate(BaseModel):
    category: str
    intent: str | None = None
    question: LocalizedText
    answer: LocalizedText
    is_active: bool = True
    priority: int = 0
    source: str = "manual"


class TenantKnowledgeUpdate(BaseModel):
    category: str | None = None
    intent: str | None = None
    question: LocalizedText | None = None
    answer: LocalizedText | None = None
    is_active: bool | None = None
    priority: int | None = None


class TenantKnowledgeOut(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    category: str
    intent: str | None
    question: LocalizedText
    answer: LocalizedText
    is_active: bool
    priority: int
    source: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True