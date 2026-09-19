from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_id
from ..schemas.mentor import MentorAskRequest, MentorResponse, WhyQueryResponse, ProactiveGuidanceResponse
from ..services import mentor_engine

router = APIRouter(tags=["AI Engineering Mentor Service"])

@router.post("/projects/{id}/mentor/ask", response_model=MentorResponse)
def ask_mentor_endpoint(
    id: str,
    req: MentorAskRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return mentor_engine.ask_mentor(
        db=db,
        project_id=id,
        member_id=req.member_id,
        question=req.question
    )

@router.get("/recommendations/{id}/why", response_model=WhyQueryResponse)
def explain_why_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return mentor_engine.explain_recommendation_why(db, id)

@router.get("/projects/{id}/mentor/guidance", response_model=ProactiveGuidanceResponse)
def get_guidance_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return mentor_engine.get_proactive_guidance(db, id)
