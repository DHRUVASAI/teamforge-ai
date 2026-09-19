from sqlalchemy.orm import Session
from ..models.project import Project
from ..core import llm_client
from ..prompts.architect_prompt import LAZY_ARCHITECT_SYSTEM_PROMPT, PS_ANALYZER_JSON_PROMPT
import json
import logging

logger = logging.getLogger(__name__)

def analyze_problem_statement(db: Session, project_id: str) -> dict:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError("Project not found")

    user_prompt = f"""
    Evaluate this project idea:
    - Idea: {project.idea}
    - Problem Statement: {project.problem_statement}
    - Time Budget: {project.time_budget_value} {project.time_budget_unit}
    
    {PS_ANALYZER_JSON_PROMPT}
    """
    
    try:
        result = llm_client.generate_json(system_prompt=LAZY_ARCHITECT_SYSTEM_PROMPT, user_prompt=user_prompt)
        
        project.feasibility_verdict = result.get("verdict", "approved")
        project.feasibility_reasoning = result.get("reasoning", "Analyzed successfully.")
        db.commit()
        db.refresh(project)
        
        return {
            "verdict": project.feasibility_verdict,
            "reasoning": project.feasibility_reasoning,
            "is_fallback": False
        }
    except Exception:
        logger.exception("LLM generation failed for problem statement analysis")
        project.feasibility_verdict = "analysis_unavailable"
        project.feasibility_reasoning = "AI analysis is currently unavailable. Please proceed or try again later."
        db.commit()
        
        return {
            "verdict": project.feasibility_verdict,
            "reasoning": project.feasibility_reasoning,
            "is_fallback": True
        }
