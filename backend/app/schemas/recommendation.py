from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class RejectedAlternativeSchema(BaseModel):
    option: Optional[str] = None
    model: Optional[str] = None
    tier: Optional[str] = None
    approach: Optional[str] = None
    reason_rejected: str

class SDLCRecommendationOut(BaseModel):
    recommendation_id: str
    project_id: str
    recommended_model: str
    reasoning: str
    rejected_alternatives: List[Dict[str, Any]]
    workflow_impact: Dict[str, Any]
    version: int
    status: str
    created_at: datetime

class ComponentDataOwnershipSchema(BaseModel):
    storage: str
    schema_tables: List[str]

class ArchitectureComponentSchema(BaseModel):
    id: str
    name: str
    responsibility: str
    data_ownership: ComponentDataOwnershipSchema

class AiAcceleratorToolSchema(BaseModel):
    name: str
    why: str

class AiAcceleratorPhaseSchema(BaseModel):
    phase: str
    tools: List[AiAcceleratorToolSchema]

class ArchitectureRecommendationOut(BaseModel):
    recommendation_id: str
    project_id: str
    tier: str
    bespoke_rationale: Optional[str] = None
    deployment_recommendation: str
    reasoning: str
    rejected_alternatives: List[Dict[str, Any]]
    components: List[ArchitectureComponentSchema]
    ai_accelerators: Optional[List[Dict[str, Any]]] = []
    diagram_mermaid: Optional[str] = None
    version: int
    status: str
    created_at: datetime

class ArchitectureAcceptRequest(BaseModel):
    recommendation_id: str

class ArchitectureOverrideRequest(BaseModel):
    tier: str
    components: List[ArchitectureComponentSchema]
