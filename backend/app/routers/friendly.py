from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_id
from ..schemas.friendly import FriendlyGamePlanResponse
from ..services import friendly_service

router = APIRouter(tags=["Friendly Transformation Layer"])

@router.get("/projects/{id}/friendly-plan", response_model=FriendlyGamePlanResponse)
def get_friendly_game_plan_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return friendly_service.generate_friendly_game_plan(db, id)
