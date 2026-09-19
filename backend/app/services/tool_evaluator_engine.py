from sqlalchemy.orm import Session
from ..models.user_team import TeamMember, MemberSubscription, MemberSkill
from ..models.project import Project
from ..core import llm_client
from ..prompts.architect_prompt import LAZY_ARCHITECT_SYSTEM_PROMPT, TOOL_EVALUATOR_JSON_PROMPT
import json
import logging

logger = logging.getLogger(__name__)

def evaluate_tool_for_capability(db: Session, project_id: str, capability: str) -> dict:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError("Project not found")
        
    team_members = db.query(TeamMember).filter(TeamMember.team_id == project.team_id).all()
    member_ids = [m.id for m in team_members]
    
    subscriptions = db.query(MemberSubscription).filter(MemberSubscription.member_id.in_(member_ids)).all()
    cloud_accounts = [sub.tool_name for sub in subscriptions]
    
    skills = db.query(MemberSkill).filter(MemberSkill.member_id.in_(member_ids)).all()
    team_skills = [f"{s.name} ({s.level})" for s in skills]
    
    constraints = project.constraints

    user_prompt = f"""
    Evaluate tools for the capability: '{capability}'.
    
    Project Context:
    - Problem Statement: {project.problem_statement}
    - Idea: {project.idea}
    - Time Budget: {project.time_budget_value} {project.time_budget_unit}
    - Constraints: {json.dumps(constraints)}
    
    Team Context:
    - Cloud Accounts/Free Tiers: {json.dumps(cloud_accounts)}
    - Developer Skills: {json.dumps(team_skills)}
    
    {TOOL_EVALUATOR_JSON_PROMPT}
    """
    
    try:
        result = llm_client.generate_json(system_prompt=LAZY_ARCHITECT_SYSTEM_PROMPT, user_prompt=user_prompt)
        result["is_fallback"] = False
        return result
    except Exception:
        logger.exception(f"LLM tool evaluation failed for capability: {capability}")
        return {
            "capability": capability,
            "options_matrix": [],
            "winning_tool": "Standard Default Framework",
            "winning_category": "Mainstream Default",
            "rationale": "AI tool evaluation is currently unavailable. Displaying standard fallback recommendation.",
            "is_fallback": True
        }
