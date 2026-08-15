from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.v1 import auth, tenants, pages, features, memberships, transactions, uploads, properties, blocked_periods


app = FastAPI(title="Platform API", version="0.1.0")

API_PREFIX = "/api/v1"

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False if ALLOWED_ORIGINS == ["*"] else True,
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

app.include_router(
    uploads.router,
    prefix="/api/v1",
)
app.include_router(
    blocked_periods.router,
    prefix="/api/v1",
)

@app.get("/health")
async def health():
    return {"status": "ok"}
