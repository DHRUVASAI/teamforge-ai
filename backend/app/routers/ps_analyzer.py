from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_id
from ..schemas.ps_analyzer import PSEvaluateRequest, PSEvaluateResponse
from ..services import ps_analyzer_engine

router = APIRouter(tags=["Multi-PS Evaluator & Ranking Engine"])

@router.post("/evaluate-problem-statements", response_model=PSEvaluateResponse)
def evaluate_ps_endpoint(
    req: PSEvaluateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return ps_analyzer_engine.evaluate_multiple_problem_statements(db, req)
