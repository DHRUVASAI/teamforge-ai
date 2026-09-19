from sqlalchemy.orm import Session
from ..models.project import Project
from ..models.recommendation import ArchitectureRecommendation
from ..core import llm_client
from ..prompts.architect_prompt import FRIENDLY_ELI5_PROMPT
import json
import logging

logger = logging.getLogger(__name__)

def generate_eli5_guide(db: Session, project_id: str) -> str:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError("Project not found")
        
    arch_recs = db.query(ArchitectureRecommendation).filter(ArchitectureRecommendation.project_id == project_id).all()
    
    arch_data = [
        {"component": rec.component_name, "tool": rec.recommended_tool, "reason": rec.reasoning}
        for rec in arch_recs
    ]
    
    user_prompt = f"""
    Translate this architecture JSON into a highly engaging, non-technical ELI5 markdown document for a Gen-Z builder.
    
    Architecture JSON:
    {json.dumps(arch_data, indent=2)}
    
    Focus on making it fun to read. Use emojis.
    """
    
    try:
        markdown_guide = llm_client.generate_text(system_prompt=FRIENDLY_ELI5_PROMPT, user_prompt=user_prompt)
        return markdown_guide
    except Exception:
        logger.exception("LLM text generation failed for ELI5 guide")
        return "# Oops! 😅\n\nLooks like the AI engine had a hiccup and is currently unavailable. Check back later!"
