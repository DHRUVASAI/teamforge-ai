from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_id
from ..models.tool import ToolCatalogEntry
from ..schemas.tool import ToolCatalogEntryOut, ToolRecommendationResponse
from ..services import tool_engine

router = APIRouter(tags=["Tool Recommendation & Catalog Service"])

@router.post("/tasks/{task_id}/tools/recommend", response_model=ToolRecommendationResponse)
def recommend_tools_endpoint(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return tool_engine.recommend_tools_for_task(db, task_id)

@router.get("/tool-catalog", response_model=List[ToolCatalogEntryOut])
def list_tool_catalog_endpoint(
    category: Optional[str] = Query(None),
    skill_level: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    tool_engine.initialize_default_catalog(db)
    query = db.query(ToolCatalogEntry)
    if category:
        query = query.filter(ToolCatalogEntry.category.ilike(f"%{category}%"))
    if skill_level:
        query = query.filter(ToolCatalogEntry.skill_level_fit.ilike(f"%{skill_level}%"))
        
    entries = query.all()
    results = []
    for e in entries:
        results.append(ToolCatalogEntryOut(
            id=e.id,
            tool_name=e.tool_name,
            category=e.category,
            task_types=e.task_types,
            skill_level_fit=e.skill_level_fit,
            free_tier=e.free_tier,
            quota_notes=e.quota_notes,
            integration_difficulty=e.integration_difficulty,
            best_for=e.best_for,
            limitations=e.limitations,
            last_verified=e.last_verified
        ))
    return results
