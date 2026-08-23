from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.v1 import (
    stripe_webhook,
    calendar,
    auth,
    bookings,
    ai_chat,
    tenants,
    pages,
    features,
    memberships,
    transactions,
    uploads,
    properties,
    blocked_periods,
    property_theme,
    tenant_knowledge,
)

from app.db.session import engine
from app.db.base import Base
from app import models


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    await engine.dispose()


app = FastAPI(
    title="Platform API",
    version="0.1.0",
    lifespan=lifespan,
)

API_PREFIX = "/api/v1"

# ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://localhost:3001",
#     "http://localhost:3005",
#     "http://localhost:3006",
#     "https://miche.se",
#     "https://admin.miche.se",
# ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"^(https://([a-z0-9-]+\.)?miche\.se|http://localhost:\d+)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(tenants.router, prefix=API_PREFIX)
app.include_router(pages.router, prefix=API_PREFIX)
app.include_router(features.router, prefix=API_PREFIX)
app.include_router(memberships.router, prefix=API_PREFIX)
app.include_router(transactions.router, prefix=API_PREFIX)
app.include_router(properties.router, prefix=API_PREFIX)
app.include_router(property_theme.router, prefix=API_PREFIX)
app.include_router(uploads.router,prefix=API_PREFIX)
app.include_router(blocked_periods.router, prefix=API_PREFIX)
app.include_router(tenant_knowledge.router, prefix=API_PREFIX)
app.include_router(ai_chat.router, prefix=API_PREFIX)
app.include_router(bookings.router, prefix=API_PREFIX)
app.include_router(stripe_webhook.router, prefix=API_PREFIX)
app.include_router(calendar.router, prefix=API_PREFIX)

@app.get("/health")
async def health():
    return {"status": "ok"}
