from fastapi import FastAPI
from app.routes.cases import router as cases_router

app = FastAPI()
app.include_router(cases_router)
engine = None

async def seed_if_empty():
    pass
