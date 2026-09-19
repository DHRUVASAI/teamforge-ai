from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class RiskCreate(BaseModel):
    risk_code: str
    title: str
    description: str = ""
    probability: int = 2
    impact: int = 2
    severity: str = "Medium"
    trigger: str = ""
    mitigation: str = ""
    contingency: str = ""
    owner_name: str = "Team Lead"

class RiskUpdate(BaseModel):
    status: Optional[str] = None # Open, Monitoring, Mitigated, Closed
    mitigation: Optional[str] = None
    probability: Optional[int] = None
    impact: Optional[int] = None

class RiskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    project_id: str
    risk_code: str
    title: str
    description: str
    probability: int
    impact: int
    score: int
    severity: str
    trigger: str
    mitigation: str
    contingency: str
    owner_name: str
    status: str
    created_at: datetime

class RiskEvaluateResponse(BaseModel):
    risks: List[RiskOut]
