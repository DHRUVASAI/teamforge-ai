from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field

class TimeBudgetSchema(BaseModel):
    value: int = 48
    unit: str = "hours" # hours, days, weeks, months

class ProjectCreate(BaseModel):
    team_id: str
    name: str
    problem_statement: str
    idea: str
    time_budget: TimeBudgetSchema
    deliverable_type: str = "prototype" # prototype, production, capstone
    constraints: List[str] = Field(default_factory=list)
    mandatory_platforms: List[str] = Field(default_factory=list) # e.g. ["Stripe", "Vercel", "Twilio", "Gemini API"]

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    problem_statement: Optional[str] = None
    idea: Optional[str] = None
    time_budget: Optional[TimeBudgetSchema] = None
    deliverable_type: Optional[str] = None
    constraints: Optional[List[str]] = None
    mandatory_platforms: Optional[List[str]] = None

class CapabilitySchema(BaseModel):
    id: str
    name: str
    complexity: str # Low, Medium, High

class AmbiguitySchema(BaseModel):
    id: str
    question: str
    suggested_answer: str

class FeasibilityDetails(BaseModel):
    verdict: str # feasible, feasible_with_adjustments, scope_exceeded
    score: float
    total_estimated_hours: int
    available_team_capacity_hours: int
    reasoning: str
    proposed_scope_reduction: List[str] = Field(default_factory=list)

class FeasibilityResponse(BaseModel):
    capabilities: List[CapabilitySchema]
    ambiguities: List[AmbiguitySchema]
    feasibility: FeasibilityDetails

class ProjectOut(BaseModel):
    project_id: str
    team_id: str
    name: str
    problem_statement: str
    idea: str
    time_budget: TimeBudgetSchema
    deliverable_type: str
    constraints: List[str]
    mandatory_platforms: List[str]
    status: str
    created_at: datetime
