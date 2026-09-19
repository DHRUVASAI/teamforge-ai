from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class ToolOptionSchema(BaseModel):
    category: str
    tool_name: str
    pros: str
    cons: str

class ToolEvaluationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    id: str
    capability: str
    winning_tool: str
    winning_category: str
    rationale: str
    options_matrix: List[ToolOptionSchema] = Field(alias="evaluation_matrix_json")
    is_fallback: bool = False

class PlaybookStepSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    order_index: int
    instruction: str
    ai_prompt: Optional[str] = None
    context_files: List[str] = []

class PlaybookStageSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    description: Optional[str] = None
    order_index: int
    steps: List[PlaybookStepSchema] = []

class ProjectPlaybookSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    project_id: str
    created_at: datetime
    evaluations: List[ToolEvaluationSchema] = []
    stages: List[PlaybookStageSchema] = []

class GeneratePlaybookRequest(BaseModel):
    capabilities: List[str] = Field(default_factory=list, description="List of capabilities, e.g., ['Frontend', 'Backend', 'Speech-to-Text']")
