import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_superadmin
from app.core.redis import delete_tenant_features_cache, get_tenant_features_cache, add_tenant_features_cache
from app.db.session import get_db
from app.models.feature import Feature, TenantFeature
from app.schemas.entities import FeatureOut, TenantFeatureToggle

router = APIRouter(tags=["features"])


@router.get("/features", response_model=list[FeatureOut])
async def list_features(db: AsyncSession = Depends(get_db)):
    """The full sellable-features catalog. Public read so pricing/feature
    pages can list what's available."""
    result = await db.execute(select(Feature))
    return result.scalars().all()


@router.get("/tenants/{tenant_id}/features", response_model=list[str])
async def get_tenant_features(tenant_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Returns the list of feature keys this tenant currently has enabled.
    Both the admin UI and any feature-gated API endpoint should check this
    (or the cached version) before showing/allowing anything."""

    cached = await get_tenant_features_cache(
        str(tenant_id)
    )
    if cached:
        return json.loads(cached)

    result = await db.execute(
        select(Feature.key)
        .join(TenantFeature, TenantFeature.feature_id == Feature.id)
        .where(TenantFeature.tenant_id == tenant_id, TenantFeature.enabled == True)  # noqa: E712
    )
    keys = [row[0] for row in result.all()]
    await add_tenant_features_cache(str(tenant_id), json.dumps(keys), 300)
    return keys


@router.put("/tenants/{tenant_id}/features", status_code=status.HTTP_204_NO_CONTENT)
async def toggle_tenant_feature(
    tenant_id: uuid.UUID,
    payload: TenantFeatureToggle,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_superadmin),
):
    """Superadmin only — enabling/disabling a feature is a billing action,
    not something tenant_admins do themselves."""

    result = await db.execute(select(Feature).where(Feature.key == payload.feature_key))
    feature = result.scalar_one_or_none()
    if not feature:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown feature key")

    result = await db.execute(
        select(TenantFeature).where(
            TenantFeature.tenant_id == tenant_id, TenantFeature.feature_id == feature.id
        )
    )
    tf = result.scalar_one_or_none()
    if tf:
        tf.enabled = payload.enabled
    else:
        db.add(TenantFeature(tenant_id=tenant_id, feature_id=feature.id, enabled=payload.enabled))

    await db.commit()
    await delete_tenant_features_cache(str(tenant_id))
