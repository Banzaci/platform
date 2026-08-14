import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_tenant_access
from app.db.session import get_db
from app.models.transaction import Transaction
from app.schemas.entities import TransactionCreate, TransactionOut

router = APIRouter(prefix="/tenants/{tenant_id}/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionOut])
async def list_transactions(
    tenant_id: uuid.UUID, db: AsyncSession = Depends(get_db), _user=Depends(require_tenant_access)
):
    result = await db.execute(select(Transaction).where(Transaction.tenant_id == tenant_id))
    return result.scalars().all()


@router.post("", response_model=TransactionOut)
async def create_transaction(
    tenant_id: uuid.UUID,
    payload: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_tenant_access),
):
    txn = Transaction(tenant_id=tenant_id, **payload.model_dump())
    db.add(txn)
    await db.commit()
    await db.refresh(txn)
    return txn
