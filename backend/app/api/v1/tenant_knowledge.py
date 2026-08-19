import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.knowledge.template import KNOWLEDGE_TEMPLATES
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError

from app.api.deps import require_tenant_access
from app.api.get_current_user import get_current_user
from app.db.session import get_db
from app.models.tenant_knowledge import TenantKnowledge
from app.schemas.tenant_knowledge import (
    TenantKnowledgeCreate,
    TenantKnowledgeUpdate,
    TenantKnowledgeOut,
)

router = APIRouter(
    prefix="/tenants/{tenant_id}/knowledge",
    tags=["tenant-knowledge"],
)

@router.get("", response_model=list[TenantKnowledgeOut])
async def get_tenant_knowledge(
    tenant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    result = await db.execute(
        select(TenantKnowledge)
        .where(
            TenantKnowledge.tenant_id == tenant_id
        )
        .order_by(
            TenantKnowledge.priority.desc(),
            TenantKnowledge.created_at,
        )
    )

    return result.scalars().all()


@router.post("", response_model=TenantKnowledgeOut)
async def create_tenant_knowledge(
    tenant_id: uuid.UUID,
    payload: TenantKnowledgeCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    try:
        item = TenantKnowledge(
            tenant_id=tenant_id,
            **payload.model_dump(),
        )

        db.add(item)

        await db.commit()
        await db.refresh(item)

        return item

    except SQLAlchemyError as error:
        await db.rollback()

        print(
            "DATABASE ERROR create_tenant_knowledge:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

    except Exception as error:
        await db.rollback()

        print(
            "ERROR create_tenant_knowledge:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

@router.put(
    "/{knowledge_id}",
    response_model=TenantKnowledgeOut,
)
async def update_tenant_knowledge(
    tenant_id: uuid.UUID,
    knowledge_id: uuid.UUID,
    payload: TenantKnowledgeUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    result = await db.execute(
        select(TenantKnowledge).where(
            TenantKnowledge.id == knowledge_id,
            TenantKnowledge.tenant_id == tenant_id,
        )
    )

    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Knowledge item not found",
        )

    for key, value in payload.model_dump(
        exclude_unset=True
    ).items():
        setattr(item, key, value)

    await db.commit()
    await db.refresh(item)

    return item

@router.delete(
    "/{knowledge_id}",
    status_code=204,
)
async def delete_tenant_knowledge(
    tenant_id: uuid.UUID,
    knowledge_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    result = await db.execute(
        select(TenantKnowledge).where(
            TenantKnowledge.id == knowledge_id,
            TenantKnowledge.tenant_id == tenant_id,
        )
    )

    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Knowledge item not found",
        )

    await db.delete(item)
    await db.commit()

@router.get("/templates")
async def get_knowledge_templates(
    tenant_id: uuid.UUID,
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    return KNOWLEDGE_TEMPLATES