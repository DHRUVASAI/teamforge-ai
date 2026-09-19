from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ToolCatalogEntryOut(BaseModel):
    id: str
    tool_name: str
    category: str
    task_types: List[str]
    skill_level_fit: str
    free_tier: str
    quota_notes: Optional[str]
    integration_difficulty: str
    best_for: str
    limitations: str
    last_verified: str

class RecommendedToolItem(BaseModel):
    name: str
    category: str
    reasoning: str
    is_active_subscription: bool = False
    details: Optional[str] = None

class RejectedToolItem(BaseModel):
    tool: str
    reason_rejected: str

class ToolRecommendationResponse(BaseModel):
    task_id: str
    recommended_tools: List[RecommendedToolItem]
    rejected_tools: List[RejectedToolItem]
