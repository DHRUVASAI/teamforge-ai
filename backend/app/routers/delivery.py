from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_id
from ..models.delivery import GeneratedArtifact
from ..schemas.delivery import GitHubLinkRequest, GitHubSyncResponse, ArtifactGenerateResponse
from ..services import delivery_engine

router = APIRouter(tags=["DevOps & Artifact Delivery Service"])

@router.post("/projects/{id}/github/link")
def link_github_endpoint(
    id: str,
    req: GitHubLinkRequest = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    repo_url = req.repo_url if req else None
    link = delivery_engine.link_github_repo(db, id, repo_url=repo_url)
    return {
        "project_id": id,
        "repo_url": link.repo_url,
        "status": link.status
    }

@router.post("/projects/{id}/github/sync-tasks", response_model=GitHubSyncResponse)
def sync_tasks_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return delivery_engine.sync_tasks_to_github(db, id)

@router.get("/projects/{id}/github/status")
def get_github_status_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return delivery_engine.get_github_status(db, id)

@router.post("/projects/{id}/artifacts/readme", response_model=ArtifactGenerateResponse)
def generate_readme_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    artifact = delivery_engine.generate_architecture_readme(db, id)
    return ArtifactGenerateResponse(
        artifact_id=artifact.id,
        project_id=artifact.project_id,
        artifact_type=artifact.artifact_type,
        title=artifact.title,
        content=artifact.content,
        created_at=artifact.created_at
    )

@router.post("/projects/{id}/artifacts/pitch", response_model=ArtifactGenerateResponse)
def generate_pitch_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    artifact = delivery_engine.generate_pitch_deck_outline(db, id)
    return ArtifactGenerateResponse(
        artifact_id=artifact.id,
        project_id=artifact.project_id,
        artifact_type=artifact.artifact_type,
        title=artifact.title,
        content=artifact.content,
        created_at=artifact.created_at
    )

@router.get("/projects/{id}/artifacts", response_model=List[ArtifactGenerateResponse])
def list_artifacts_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    artifacts = db.query(GeneratedArtifact).filter(GeneratedArtifact.project_id == id).order_by(GeneratedArtifact.created_at.desc()).all()
    return [
        ArtifactGenerateResponse(
            artifact_id=a.id,
            project_id=a.project_id,
            artifact_type=a.artifact_type,
            title=a.title,
            content=a.content,
            created_at=a.created_at
        )
        for a in artifacts
    ]
