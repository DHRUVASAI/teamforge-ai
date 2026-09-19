import json
import uuid
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_id
from ..models.recommendation import ArchitectureRecommendation, DataArchitectureRecommendation
from ..schemas.recommendation import (
    ArchitectureRecommendationOut, ArchitectureAcceptRequest, ArchitectureOverrideRequest
)
from ..services import arch_engine

router = APIRouter(tags=["Architecture Decision Engine"])

def format_arch_out(r: ArchitectureRecommendation) -> dict:
    return {
        "recommendation_id": r.id,
        "project_id": r.project_id,
        "tier": r.tier,
        "deployment_recommendation": r.deployment_recommendation,
        "reasoning": r.reasoning,
        "rejected_alternatives": r.rejected_alternatives,
        "components": r.components,
        "version": r.version,
        "status": r.status,
        "created_at": r.created_at
    }

@router.post("/projects/{id}/architecture/recommend", response_model=ArchitectureRecommendationOut)
def recommend_architecture_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    rec = arch_engine.recommend_architecture(db, id)
    return format_arch_out(rec)

@router.post("/projects/{id}/architecture/accept")
def accept_architecture_endpoint(
    id: str,
    req: ArchitectureAcceptRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    rec = arch_engine.accept_architecture(db, id, req.recommendation_id)
    return {
        "status": "accepted",
        "recommendation_id": rec.id,
        "recommendation": format_arch_out(rec)
    }

@router.post("/projects/{id}/architecture/override", response_model=ArchitectureRecommendationOut)
def override_architecture_endpoint(
    id: str,
    req: ArchitectureOverrideRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    rec = arch_engine.override_architecture(db, id, req)
    return format_arch_out(rec)

@router.get("/projects/{id}/architecture", response_model=ArchitectureRecommendationOut)
def get_architecture_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    rec = db.query(ArchitectureRecommendation).filter(
        ArchitectureRecommendation.project_id == id,
        ArchitectureRecommendation.status != "overridden"
    ).order_by(ArchitectureRecommendation.version.desc()).first()
    
    if not rec:
        rec = arch_engine.recommend_architecture(db, id)
        
    return format_arch_out(rec)

@router.post("/projects/{id}/data-architecture/recommend")
def recommend_data_architecture_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    arch_rec = db.query(ArchitectureRecommendation).filter(
        ArchitectureRecommendation.project_id == id,
        ArchitectureRecommendation.status == "accepted"
    ).order_by(ArchitectureRecommendation.version.desc()).first()
    
    if not arch_rec:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": {"code": "ARCHITECTURE_NOT_ACCEPTED", "message": "An accepted architecture recommendation is required before recommending data architecture."}}
        )
        
    ownership_map = {}
    for comp in arch_rec.components:
        c_name = comp.get("name", "Component")
        data_own = comp.get("data_ownership", {})
        ownership_map[c_name] = {
            "storage": data_own.get("storage", "PostgreSQL"),
            "tables": data_own.get("schema_tables", [])
        }
        
    storage_choices = [
        {
            "name": "PostgreSQL (Core Relational)",
            "purpose": "ACID transactional tables for users, teams, projects, tasks, and recommendations.",
            "rationale": "Guarantees strong foreign key relational integrity across workstreams and sprint dependencies."
        },
        {
            "name": "JSON Document Attributes",
            "purpose": "Dynamic schema attributes for tool subscriptions and recommendation alternatives.",
            "rationale": "Preserves flexible attribute extensions without rigid database schema migration friction."
        }
    ]
    
    reasoning = (
        "Enforces single-writer data ownership per modular domain service. Direct cross-schema joins are prohibited, "
        "ensuring services can scale and isolate their data independently."
    )
    
    data_rec = db.query(DataArchitectureRecommendation).filter(
        DataArchitectureRecommendation.project_id == id
    ).first()
    
    if not data_rec:
        data_rec = DataArchitectureRecommendation(
            id=str(uuid.uuid4()),
            project_id=id,
            ownership_map_json=json.dumps(ownership_map),
            storage_choices_json=json.dumps(storage_choices),
            reasoning=reasoning
        )
        db.add(data_rec)
    else:
        data_rec.ownership_map_json = json.dumps(ownership_map)
        data_rec.storage_choices_json = json.dumps(storage_choices)
        data_rec.reasoning = reasoning
        
    db.commit()
    db.refresh(data_rec)
    
    return {
        "id": data_rec.id,
        "project_id": id,
        "ownership_map": ownership_map,
        "storage_choices": storage_choices,
        "reasoning": reasoning,
        "created_at": data_rec.created_at
    }

@router.get("/projects/{id}/data-architecture")
def get_data_architecture_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    data_rec = db.query(DataArchitectureRecommendation).filter(
        DataArchitectureRecommendation.project_id == id
    ).first()
    
    if not data_rec:
        return recommend_data_architecture_endpoint(id, user_id=user_id, db=db)
        
    return {
        "id": data_rec.id,
        "project_id": id,
        "ownership_map": data_rec.ownership_map,
        "storage_choices": data_rec.storage_choices,
        "reasoning": data_rec.reasoning,
        "created_at": data_rec.created_at
    }
