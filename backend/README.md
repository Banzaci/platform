# Platform Backend

FastAPI + PostgreSQL + Redis backend for the multi-tenant site builder.

## Setup

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in real values
```

Create the tables (quick start — swap for Alembic migrations once the schema stabilizes):

```bash
python -c "
import asyncio
from app.db.session import engine
from app.db.base import Base
from app.models import tenant, user, page, feature, employee, menu, transaction

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

asyncio.run(main())
"
```

Run:

```bash
uvicorn app.main:app --reload
```

## Structure

- `app/models/` — SQLAlchemy tables (tenants, users, pages, features, employees, menu, transactions)
- `app/schemas/` — Pydantic request/response models, including the discriminated `FieldSchema` union (text/textarea/image/image_gallery) with multilingual `value: dict[str, str]`
- `app/api/v1/` — routers, one file per resource
- `app/api/deps.py` — auth: `require_superadmin` (you) and `require_tenant_access` (tenant_admin scoped to their own tenant, or superadmin)
- `app/core/redis.py` — cache keys for page config and tenant feature flags

## Roles

- **superadmin** — `tenant_id` is null on their user row. Manages all tenants, the feature catalog, and which features each tenant has enabled.
- **tenant_admin** — scoped to one `tenant_id`. Can edit their own pages, employees, menu, transactions. Blocked from every other tenant's data by `require_tenant_access`.

To create the first superadmin, insert directly (no signup endpoint for this on purpose):

```python
from app.core.security import hash_password
# role="superadmin", tenant_id=None
```

## Still to add before production

1. **Row-Level Security in Postgres** — the API-level `require_tenant_access` check is the first line of defense, but add RLS as a second, DB-enforced layer:
   ```sql
   ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
   CREATE POLICY tenant_isolation ON pages
       USING (tenant_id = current_setting('app.current_tenant')::uuid);
   ```
   This means even a bug in application code can't leak one tenant's data to another.
2. **Alembic migrations** instead of `create_all` once the schema is used by real data.
3. **Tenant provisioning flow** — a `POST /tenants` call today creates a bare tenant with no pages. Add a step that also creates default pages (home, contact) with a starter theme, so new customers aren't dropped into an empty site.
4. **Image uploads** — routes here assume `src`/`image_url` are already-hosted URLs (S3/R2/Supabase Storage). Add a presigned-upload endpoint when you build that piece.
5. **`feature_dependencies`** table if some features should require others to be enabled first (e.g. menu requiring employee management) — not added yet since it wasn't confirmed as needed.
