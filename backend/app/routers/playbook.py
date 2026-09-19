from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..schemas.playbook_schema import ProjectPlaybookSchema, GeneratePlaybookRequest
from ..services import playbook_engine

router = APIRouter(prefix="/projects", tags=["playbook"])

@router.post("/{project_id}/playbook/generate", response_model=ProjectPlaybookSchema)
def generate_project_playbook(project_id: str, request: GeneratePlaybookRequest, db: Session = Depends(get_db)):
    try:
        playbook = playbook_engine.generate_playbook(db, project_id, capabilities=request.capabilities if request.capabilities else None)
        return playbook
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/{project_id}/playbook", response_model=ProjectPlaybookSchema)
def get_project_playbook(project_id: str, db: Session = Depends(get_db)):
    playbook = playbook_engine.get_playbook(db, project_id)
    if not playbook:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playbook not found for this project.")
    return playbook
