from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_id
from ..models.project import Project
from ..models.user_team import TeamMember
from ..schemas.project import ProjectCreate, ProjectUpdate, ProjectOut, FeasibilityResponse
from ..services import project_service

router = APIRouter(tags=["Project & Feasibility Service"])

def format_project_out(p: Project) -> dict:
    return {
        "project_id": p.id,
        "team_id": p.team_id,
        "name": p.name,
        "problem_statement": p.problem_statement,
        "idea": p.idea,
        "time_budget": {
            "value": p.time_budget_value,
            "unit": p.time_budget_unit
        },
        "deliverable_type": p.deliverable_type,
        "constraints": p.constraints,
        "mandatory_platforms": p.mandatory_platforms,
        "status": p.status,
        "created_at": p.created_at
    }

@router.post("/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project_endpoint(
    req: ProjectCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # Auto-resolve team_id from user_id if they passed their user_id
    member = db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=400, detail="User does not belong to any team.")
    req.team_id = member.team_id

    project = project_service.create_project(db, req)
    return format_project_out(project)

@router.get("/projects", response_model=List[ProjectOut])
def list_projects_endpoint(
    team_id: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    member = db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
    if not member:
        return []
    
    query = db.query(Project).filter(Project.team_id == member.team_id)
    projects = query.order_by(Project.created_at.desc()).all()
    return [format_project_out(p) for p in projects]

@router.get("/projects/{id}", response_model=ProjectOut)
def get_project_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    project = project_service.get_project(db, id)
    return format_project_out(project)

@router.patch("/projects/{id}", response_model=ProjectOut)
def update_project_endpoint(
    id: str,
    req: ProjectUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    project = project_service.update_project(db, id, req)
    return format_project_out(project)

@router.post("/projects/{id}/analyze", response_model=FeasibilityResponse)
def analyze_project_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return project_service.analyze_project_feasibility(db, id)
