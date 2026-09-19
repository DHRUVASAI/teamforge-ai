from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_id
from ..models.recommendation import SDLCRecommendation
from ..schemas.recommendation import SDLCRecommendationOut
from ..services import sdlc_engine

router = APIRouter(tags=["SDLC Decision Engine"])

def format_sdlc_out(r: SDLCRecommendation) -> dict:
    return {
        "recommendation_id": r.id,
        "project_id": r.project_id,
        "recommended_model": r.recommended_model,
        "reasoning": r.reasoning,
        "rejected_alternatives": r.rejected_alternatives,
        "workflow_impact": r.workflow_impact,
        "version": r.version,
        "status": r.status,
        "created_at": r.created_at
    }

@router.post("/projects/{id}/sdlc/recommend", response_model=SDLCRecommendationOut)
def recommend_sdlc_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    rec = sdlc_engine.recommend_sdlc_model(db, id)
    return format_sdlc_out(rec)

@router.get("/projects/{id}/sdlc", response_model=SDLCRecommendationOut)
def get_sdlc_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    rec = db.query(SDLCRecommendation).filter(
        SDLCRecommendation.project_id == id
    ).order_by(SDLCRecommendation.version.desc()).first()
    
    if not rec:
        # Generate automatically if none exists yet
        rec = sdlc_engine.recommend_sdlc_model(db, id)
        
    return format_sdlc_out(rec)
