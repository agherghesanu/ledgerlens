from fastapi import FastAPI
from app.routes.cases import router as cases_router
from app.routes.reviews import router as reviews_router
from app.routes.scores import router as scores_router

app = FastAPI()
app.include_router(cases_router)
app.include_router(reviews_router)
app.include_router(scores_router)
engine = None

async def seed_if_empty():
    pass
