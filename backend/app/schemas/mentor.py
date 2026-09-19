from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class MentorAskRequest(BaseModel):
    member_id: Optional[str] = None
    question: str

class MentorResponse(BaseModel):
    answer: str
    sources: List[str]
    rejected_alternatives: List[Dict[str, Any]]
    created_at: datetime

class WhyQueryResponse(BaseModel):
    recommendation_type: str
    recommendation_id: str
    reasoning: str
    inputs_used: List[str]
    rejected_alternatives: List[Dict[str, Any]]

class GuidanceFlag(BaseModel):
    type: str # warning, bottleneck, risk, opportunity
    message: str
    action: str

class ProactiveGuidanceResponse(BaseModel):
    project_id: str
    flags: List[GuidanceFlag]
