from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ELI5ToolGuide(BaseModel):
    tool_name: str
    category: str
    why_this_tool: str
    is_active_subscription: bool = False
    step_by_step_instructions: List[str]
    quick_starter_prompt: Optional[str] = None

class FriendlyTeammateCard(BaseModel):
    member_id: str
    user_id: str
    name: str
    friendly_role_title: str # e.g. "The Database & Logic Builder (Backend)"
    role_emoji: str # e.g. "🛠️", "🎨", "⚡", "👑"
    what_you_are_building: str
    days_schedule: Dict[str, str]
    primary_tool_guide: ELI5ToolGuide
    active_subscriptions_used: List[str]

class FriendlyDailyRoadmap(BaseModel):
    day_span: str # e.g. "Days 1-2"
    milestone_goal: str # e.g. "Foundation & Screen Sketches"
    who_is_doing_what: List[str]
    ready_to_demo_check: str

class FriendlyGamePlanResponse(BaseModel):
    project_id: str
    project_name: str
    time_budget_summary: str
    plain_english_summary: str
    team_cards: List[FriendlyTeammateCard]
    daily_roadmap: List[FriendlyDailyRoadmap]
    hackathon_winning_tips: List[str]
