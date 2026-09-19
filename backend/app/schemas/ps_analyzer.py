from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CandidatePSInput(BaseModel):
    id: str
    title: str
    problem_statement: str
    proposed_idea: str
    target_sponsor_track: Optional[str] = None

class PSEvaluateRequest(BaseModel):
    team_id: str
    time_budget_hours: int = 48
    candidate_problem_statements: List[CandidatePSInput] = Field(..., min_length=1)

class PSScores(BaseModel):
    skill_fit_score: float # 0 - 10
    skill_fit_explanation: str
    time_feasibility_score: float # 0 - 10
    time_feasibility_explanation: str
    demo_impact_score: float # 0 - 10
    demo_impact_explanation: str
    sponsor_fit_score: float # 0 - 10
    sponsor_fit_explanation: str
    overall_score: float # 0 - 10
    overall_score_calculation: str # Detailed formula breakdown

class PSEvaluationItem(BaseModel):
    id: str
    title: str
    rank: int
    verdict: str # WINNER, VIABLE_ALTERNATIVE, REJECTED
    scores: PSScores
    selection_status: str # top_pick, alternative, not_recommended
    why_pick_reason: str
    risks_and_drawbacks: List[str]

class PSEvaluateResponse(BaseModel):
    team_id: str
    time_budget_hours: int
    top_recommended_ps: PSEvaluationItem
    ranked_evaluations: List[PSEvaluationItem]
    summary_recommendation: str
