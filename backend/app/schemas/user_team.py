from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    user_id: str
    token: str
    name: str
    email: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    name: str
    email: str
    created_at: datetime

class MemberSkillSchema(BaseModel):
    name: str
    level: str = "Intermediate" # Beginner, Intermediate, Advanced

class MemberSubscriptionSchema(BaseModel):
    tool_name: str
    tier: str = "Pro" # Free, Pro, Team, Credits
    credits: Optional[str] = None

class TeamMemberCreate(BaseModel):
    user_id: str
    role: str = "developer" # team_leader, developer, early_career, ai_assisted
    skills: List[MemberSkillSchema] = Field(default_factory=list)
    subscriptions: List[MemberSubscriptionSchema] = Field(default_factory=list)

class TeamMemberUpdate(BaseModel):
    role: Optional[str] = None
    skills: Optional[List[MemberSkillSchema]] = None
    subscriptions: Optional[List[MemberSubscriptionSchema]] = None

class TeamMemberOut(BaseModel):
    member_id: str
    team_id: str
    user_id: str
    name: str
    email: str
    role: str
    skills: List[MemberSkillSchema]
    subscriptions: List[MemberSubscriptionSchema]

class TeamCreate(BaseModel):
    name: str

class TeamJoinRequest(BaseModel):
    team_code: str
    role: str = "developer"
    skills: List[MemberSkillSchema] = Field(default_factory=list)
    subscriptions: List[MemberSubscriptionSchema] = Field(default_factory=list)

class TeamOut(BaseModel):
    team_id: str
    name: str
    team_code: str = "TEAM-0000"
    created_at: datetime
    members: List[TeamMemberOut]

class TeamHubMemberStatus(BaseModel):
    member_id: str
    user_id: str
    name: str
    role: str
    active_subscriptions: List[str]
    current_tasks_count: int
    tasks_done_count: int
    is_blocked: bool
    blocked_by_task: Optional[str] = None

class TeamHubOut(BaseModel):
    team_id: str
    team_name: str
    team_code: str
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    total_members: int
    total_tasks: int
    completed_tasks: int
    active_bottlenecks_count: int
    members_status: List[TeamHubMemberStatus]
