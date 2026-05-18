from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.seed import seed_if_empty
from app.db.session import Base, engine
from app.routes.cases import router as cases_router
from app.routes.reviews import router as reviews_router
from app.routes.scores import router as scores_router


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

app.include_router(cases_router)
app.include_router(reviews_router)
app.include_router(scores_router)
