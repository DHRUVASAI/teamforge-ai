from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_id
from ..models.risk import Risk
from ..schemas.risk import RiskOut, RiskUpdate, RiskEvaluateResponse
from ..services import risk_engine

router = APIRouter(tags=["Risk Management Service"])

@router.post("/projects/{id}/risks/evaluate", response_model=List[RiskOut])
def evaluate_risks_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return risk_engine.evaluate_project_risks(db, id)

@router.get("/projects/{id}/risks", response_model=List[RiskOut])
def get_risks_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    risks = db.query(Risk).filter(Risk.project_id == id).all()
    if not risks:
        risks = risk_engine.evaluate_project_risks(db, id)
    return risks

@router.patch("/projects/{id}/risks/{risk_id}", response_model=RiskOut)
def update_risk_endpoint(
    id: str,
    risk_id: str,
    req: RiskUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return risk_engine.update_risk(
        db=db,
        project_id=id,
        risk_id=risk_id,
        status_val=req.status,
        mitigation_val=req.mitigation
    )
