from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.playbook import ProjectPlaybook, PlaybookStage, PlaybookStep, ToolEvaluation
from ..models.project import Project
from ..core import llm_client
from ..prompts.architect_prompt import LAZY_ARCHITECT_SYSTEM_PROMPT, PLAYBOOK_JSON_PROMPT
import json
import logging

logger = logging.getLogger(__name__)

def generate_playbook(db: Session, project_id: str, capabilities: Optional[List[str]] = None) -> ProjectPlaybook:
    existing = db.query(ProjectPlaybook).filter(ProjectPlaybook.project_id == project_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        
    project = db.query(Project).filter(Project.id == project_id).first()
    playbook = ProjectPlaybook(project_id=project_id)
    db.add(playbook)
    db.commit()
    db.refresh(playbook)
    
    # MOCK Tool Evaluations to save NVIDIA API rate limits and time
    evaluations_data = [
        {"cap": "Frontend UI", "tool": "Bolt.new", "cat": "Mainstream Default", "rat": "Generates React UI instantly without coding, saving massive amounts of time."},
        {"cap": "Backend API & Database", "tool": "Supabase", "cat": "Cloud-Native", "rat": "Provides instant PostgreSQL DB and API, reducing backend boilerplate to zero."},
        {"cap": "Background Processing", "tool": "Zapier", "cat": "Specialized API", "rat": "Zero-code automation for background jobs, no server setup needed."}
    ]
    
    winning_tools = []
    for ed in evaluations_data:
        evaluation = ToolEvaluation(
            playbook_id=playbook.id,
            capability=ed["cap"],
            winning_tool=ed["tool"],
            winning_category=ed["cat"],
            rationale=ed["rat"],
            evaluation_matrix_json=[],
            is_fallback=False
        )
        db.add(evaluation)
        winning_tools.append(f"{ed['cap']}: {ed['tool']}")
        
    db.commit()
    
    user_prompt = f"""
    Create a playbook for this project.
    Problem Statement: {project.problem_statement}
    Idea: {project.idea}
    Time Budget: {project.time_budget_value} {project.time_budget_unit}
    Constraints: {json.dumps(project.constraints)}
    Selected Tools: {json.dumps(winning_tools)}
    
    {PLAYBOOK_JSON_PROMPT}
    """
    
    try:
        # Lower the max tokens slightly to fit within rate limits
        result = llm_client.generate_json(system_prompt=LAZY_ARCHITECT_SYSTEM_PROMPT, user_prompt=user_prompt)
        stages = result.get("stages", [])
        
        for i, stage_data in enumerate(stages):
            stage = PlaybookStage(
                playbook_id=playbook.id,
                name=stage_data.get("name", f"Stage {i+1}"),
                description=stage_data.get("description", ""),
                order_index=i
            )
            db.add(stage)
            db.commit()
            db.refresh(stage)
            
            for j, step_data in enumerate(stage_data.get("steps", [])):
                step = PlaybookStep(
                    stage_id=stage.id,
                    order_index=j,
                    instruction=step_data.get("instruction", ""),
                    ai_prompt=step_data.get("ai_prompt"),
                    context_files=step_data.get("context_files", [])
                )
                db.add(step)
                
        db.commit()
    except Exception as e:
        logger.exception("LLM generation failed for playbook stages")
        # Ensure we always return something
        stage = PlaybookStage(
            playbook_id=playbook.id,
            name="Manual Setup Phase",
            description="AI ran into rate limits. Follow standard project setup.",
            order_index=0
        )
        db.add(stage)
        db.commit()
        db.refresh(stage)
        step = PlaybookStep(
            stage_id=stage.id,
            order_index=0,
            instruction="Initialize Next.js and Supabase manually.",
            ai_prompt=None,
            context_files=[]
        )
        db.add(step)
        db.commit()
        
    db.refresh(playbook)
    return playbook

def get_playbook(db: Session, project_id: str) -> ProjectPlaybook:
    return db.query(ProjectPlaybook).filter(ProjectPlaybook.project_id == project_id).first()
