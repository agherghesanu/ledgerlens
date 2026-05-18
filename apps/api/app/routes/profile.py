from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("")
def get_profile(db: Session = Depends(get_db)):
    # TODO: auth middleware → user_id from token
    return {"user_id": "placeholder", "skill_aggregates": {}}
