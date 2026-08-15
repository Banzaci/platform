import uuid

from sqlalchemy.orm import selectinload
from sqlalchemy.orm import selectinload
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.base_price import BasePrice
from app.schemas.base_price import BasePriceUpsert, BasePriceOut
from app.api.deps import require_tenant_access
from app.api.get_current_user import get_current_user
from app.db.session import get_db
from app.models.property import Property
from app.schemas.property import PropertyOut, PropertyUpdate


router = APIRouter(
    prefix="/tenants/{tenant_id}/properties",
    tags=["properties"],
)


class PropertyBulkCreate(BaseModel):
    count: int = Field(ge=1, le=100)


@router.get("", response_model=list[PropertyOut])
async def get_properties(
    tenant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    result = await db.execute(
        select(Property)
        .where(Property.tenant_id == tenant_id)
        .options(
            selectinload(Property.base_price)
        )
        .order_by(Property.created_at)
    )

    return result.scalars().all()

@router.post("/bulk", response_model=list[PropertyOut])
async def create_properties_bulk(
    tenant_id: uuid.UUID,
    payload: PropertyBulkCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    try:
        properties = [
            Property(
                tenant_id=tenant_id,
                name=f"Property {i}",
                description=None,
                max_guests=2,
                bedrooms=1,
                beds=1,
                bathrooms=1,
                units=1,
                amenities=[],
                is_open=True,
            )
            for i in range(1, payload.count + 1)
        ]

        db.add_all(properties)

        await db.commit()

        for property in properties:
            await db.refresh(property)

        return properties

    except Exception as e:
        await db.rollback()

        print("CREATE PROPERTIES ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Failed to create properties",
        )

@router.put("/{property_id}", response_model=PropertyOut)
async def update_property(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    payload: PropertyUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    try:
        result = await db.execute(
            select(Property)
            .where(
                Property.id == property_id,
                Property.tenant_id == tenant_id,
            )
            .options(
                selectinload(Property.base_price)
            )
        )

        property = result.scalar_one_or_none()

        if not property:
            raise HTTPException(
                status_code=404,
                detail="Property not found",
            )

        updates = payload.model_dump(exclude_unset=True)

        for key, value in updates.items():
            setattr(property, key, value)

        await db.commit()
        
        result = await db.execute(
            select(Property)
            .where(
                Property.id == property_id,
                Property.tenant_id == tenant_id,
            )
            .options(
                selectinload(Property.base_price)
            )
        )

        property = result.scalar_one()

        return property

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()

        print("UPDATE PROPERTY ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Failed to update property",
        )


@router.put(
    "/{property_id}/base-price",
    response_model=BasePriceOut,
)
async def upsert_base_price(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    payload: BasePriceUpsert,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    try:
        property_result = await db.execute(
            select(Property).where(
                Property.id == property_id,
                Property.tenant_id == tenant_id,
            )
        )

        property = property_result.scalar_one_or_none()

        if not property:
            raise HTTPException(
                status_code=404,
                detail="Property not found",
            )

        result = await db.execute(
            select(BasePrice).where(
                BasePrice.property_id == property_id
            )
        )

        base_price = result.scalar_one_or_none()

        if not base_price:
            base_price = BasePrice(
                property_id=property_id,
                daily_price=payload.daily_price,
                weekly_price=payload.weekly_price,
                monthly_price=payload.monthly_price,
            )

            db.add(base_price)

        else:
            base_price.daily_price = payload.daily_price
            base_price.weekly_price = payload.weekly_price
            base_price.monthly_price = payload.monthly_price

        await db.commit()
        await db.refresh(base_price)

        return base_price

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()

        print("BASE PRICE ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Failed to update base price",
        )


@router.get(
    "/{property_id}/base-price",
    response_model=BasePriceOut | None,
)
async def get_base_price(
    tenant_id: uuid.UUID,
    property_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
    _access=Depends(require_tenant_access),
):
    # Kontrollera att property tillhör rätt tenant
    property_result = await db.execute(
        select(Property).where(
            Property.id == property_id,
            Property.tenant_id == tenant_id,
        )
    )

    property = property_result.scalar_one_or_none()

    if not property:
        raise HTTPException(
            status_code=404,
            detail="Property not found",
        )

    result = await db.execute(
        select(BasePrice).where(
            BasePrice.property_id == property_id
        )
    )

    return result.scalar_one_or_none()


