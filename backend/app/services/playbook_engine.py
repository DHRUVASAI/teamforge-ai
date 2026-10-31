from sqlalchemy.orm import Session
from typing import List, Optional
import time
import json
import logging

from ..models.playbook import ProjectPlaybook, PlaybookStage, PlaybookStep, ToolEvaluation
from ..models.project import Project
from ..core import llm_client
from ..core.config import settings
from ..prompts.architect_prompt import LAZY_ARCHITECT_SYSTEM_PROMPT, PLAYBOOK_JSON_PROMPT
from .tool_evaluator_engine import evaluate_tool_for_capability

logger = logging.getLogger(__name__)

def generate_playbook(db: Session, project_id: str, capabilities: Optional[List[str]] = None) -> ProjectPlaybook:
    existing = db.query(ProjectPlaybook).filter(ProjectPlaybook.project_id == project_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError("Project not found")

    playbook = ProjectPlaybook(project_id=project_id)
    db.add(playbook)
    db.commit()
    db.refresh(playbook)
    
    # Dynamic Tool Evaluations via tool_evaluator_engine
    target_caps = capabilities if capabilities and len(capabilities) > 0 else [
        "Frontend UI",
        "Backend API & Database",
        "Background Processing"
    ]
    
    winning_tools = []
    has_fallback_eval = False

    for cap in target_caps:
        try:
            eval_data = evaluate_tool_for_capability(db, project_id, cap)
        except Exception as e:
            logger.warning(f"Error evaluating capability {cap}: {e}")
            eval_data = {
                "capability": cap,
                "options_matrix": [],
                "winning_tool": "Standard Default Framework",
                "winning_category": "Mainstream Default",
                "rationale": "Tool evaluation fallback triggered.",
                "is_fallback": True
            }

        is_fallback = eval_data.get("is_fallback", False)
        if is_fallback:
            has_fallback_eval = True

        evaluation = ToolEvaluation(
            playbook_id=playbook.id,
            capability=cap,
            winning_tool=eval_data.get("winning_tool", "Standard Default Framework"),
            winning_category=eval_data.get("winning_category", "Mainstream Default"),
            rationale=eval_data.get("rationale", ""),
            evaluation_matrix_json=eval_data.get("options_matrix", []),
            is_fallback=is_fallback
        )
        db.add(evaluation)
        winning_tools.append(f"{cap}: {eval_data.get('winning_tool', 'Default')}")
        
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
    
    start_time = time.time()
    model_name = settings.LAYER_KEYS.get("playbook_engine", {}).get("model", "unknown")
    
    try:
        result = llm_client.generate_json(
            system_prompt=LAZY_ARCHITECT_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            layer="playbook_engine"
        )
        elapsed_ms = int((time.time() - start_time) * 1000)
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
                
        playbook.generation_status = "PARTIAL_SUCCESS" if has_fallback_eval else "SUCCESS"
        playbook.fallback_reason = None
        playbook.provider_used = model_name
        playbook.latency_ms = elapsed_ms
        db.commit()

    except Exception as e:
        elapsed_ms = int((time.time() - start_time) * 1000)
        logger.exception("LLM generation failed for playbook stages")
        
        # Transparent Fallback Stage
        stage = PlaybookStage(
            playbook_id=playbook.id,
            name="Fallback Playbook",
            description=f"AI ran into provider rate limits: {str(e)[:120]}. Follow standard project setup.",
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
        
        playbook.generation_status = "FALLBACK"
        playbook.fallback_reason = str(e)
        playbook.provider_used = model_name
        playbook.latency_ms = elapsed_ms
        db.commit()
        
    db.refresh(playbook)
    return playbook

def get_playbook(db: Session, project_id: str) -> Optional[ProjectPlaybook]:
    return db.query(ProjectPlaybook).filter(ProjectPlaybook.project_id == project_id).first()
