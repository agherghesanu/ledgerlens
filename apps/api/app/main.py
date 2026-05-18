from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.seed import seed_if_empty
from app.db.session import Base, engine
from app.routes.auth import router as auth_router
from app.routes.cases import router as cases_router
from app.routes.organizations import router as organizations_router
from app.routes.profile import router as profile_router
from app.routes.reviews import router as reviews_router
from app.routes.scores import router as scores_router
from app.routes.stripe import router as stripe_router

from app.models.user import User  # Import to ensure it's loaded for Base.metadata.create_all
from app.models.organization import Organization
from app.models.custom_case import CustomCase

@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_if_empty()
    yield


app = FastAPI(title="LedgerLens API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(cases_router)
app.include_router(organizations_router)
app.include_router(profile_router)
app.include_router(reviews_router)
app.include_router(scores_router)
app.include_router(stripe_router)
