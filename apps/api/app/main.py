import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.db.seed import seed_if_empty
from app.db.session import Base, engine
from app.routes.auth import router as auth_router
from app.routes.cases import router as cases_router
from app.routes.organizations import router as organizations_router
from app.routes.profile import router as profile_router
from app.routes.reviews import router as reviews_router
from app.routes.scores import router as scores_router
from app.routes.stripe import router as stripe_router
from app.middleware.rate_limit import RateLimitMiddleware

from app.models.user import User  # Import to ensure it's loaded for Base.metadata.create_all
from app.models.organization import Organization
from app.models.custom_case import CustomCase

_MIGRATIONS = [
    "ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT 1",
    "ALTER TABLE users ADD COLUMN verification_code TEXT",
    "ALTER TABLE cases ADD COLUMN created_at DATETIME",
]


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    for stmt in _MIGRATIONS:
        try:
            async with engine.begin() as conn:
                await conn.execute(text(stmt))
        except Exception:
            pass  # column already exists
    await seed_if_empty()
    yield


app = FastAPI(title="LedgerLens API", version="0.1.0", lifespan=lifespan)

app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/_version")
async def version():
    return {"version": "b57d70c", "cors": "open"}

app.include_router(auth_router)
app.include_router(cases_router)
app.include_router(organizations_router)
app.include_router(profile_router)
app.include_router(reviews_router)
app.include_router(scores_router)
app.include_router(stripe_router)
