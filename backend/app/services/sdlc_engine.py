import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.project import Project
from ..models.user_team import TeamMember
from ..models.recommendation import SDLCRecommendation
from ..schemas.recommendation import SDLCRecommendationOut

def recommend_sdlc_model(db: Session, project_id: str) -> SDLCRecommendation:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "PROJECT_NOT_FOUND", "message": "Project not found"}}
        )
    
    team_members = db.query(TeamMember).filter(TeamMember.team_id == project.team_id).all()
    team_size = max(1, len(team_members))
    
    unit_multiplier = {
        "hours": 1,
        "days": 8,
        "weeks": 40,
        "months": 160
    }.get(project.time_budget_unit.lower(), 1)
    
    total_time_hours = project.time_budget_value * unit_multiplier
    deliverable_type = project.deliverable_type.lower()
    
    # -------------------------------------------------------------
    # Layer 1: Deterministic Rule-Based Filter (04_SDLC.md & ADR-004)
    # -------------------------------------------------------------
    candidate_models = []
    rejected_alternatives = []
    
    # Rule 1: Very short time budget (<= 72 hours)
    if total_time_hours <= 72:
        candidate_models.append("Iterative (Lightweight)")
        rejected_alternatives.append({
            "model": "Agile / Full Scrum",
            "reason_rejected": f"Team size ({team_size}) and short timeframe ({project.time_budget_value} {project.time_budget_unit}) do not justify formal sprint planning, daily standups, and ceremony overhead."
        })
        rejected_alternatives.append({
            "model": "Waterfall",
            "reason_rejected": "A single linear pass carries high risk; early testable iterations are required even under short deadlines."
        })
        rejected_alternatives.append({
            "model": "Spiral Model",
            "reason_rejected": "Multiple formal risk-analysis cycles would consume too much of the 72-hour development budget."
        })
    
    # Rule 2: Prototype-driven deliverable
    elif "prototype" in deliverable_type or "demo" in deliverable_type:
        candidate_models.append("Prototyping & Iterative Refinement")
        rejected_alternatives.append({
            "model": "Waterfall",
            "reason_rejected": "Requirements are exploratory; building a working prototype first provides vital early feedback."
        })
        rejected_alternatives.append({
            "model": "Agile Scrum",
            "reason_rejected": "Overhead of multi-sprint backlogs is unnecessary when the primary deliverable is a functional proof-of-concept."
        })
        
    # Rule 3: Long timeframe (> 4 weeks) with capstone / production goals
    elif total_time_hours >= 160 and ("production" in deliverable_type or "capstone" in deliverable_type):
        candidate_models.append("Agile (Scrum / Sprints)")
        rejected_alternatives.append({
            "model": "Waterfall",
            "reason_rejected": "Long project lifecycles face evolving user requirements; strict sequential phases risk late defect discovery."
        })
        rejected_alternatives.append({
            "model": "Unstructured Prototyping",
            "reason_rejected": "Production software requires sustainable engineering cadences, backlog grooming, and regression testing."
        })
        
    # Rule 4: Default middle-ground
    else:
        candidate_models.append("Iterative (Multi-Pass)")
        rejected_alternatives.append({
            "model": "Waterfall",
            "reason_rejected": "Lacks intermediate feedback loops."
        })
        rejected_alternatives.append({
            "model": "Ceremony-Heavy Agile",
            "reason_rejected": "Unnecessary management overhead for small teams."
        })
    
    # -------------------------------------------------------------
    # Layer 2: LLM / Template Ranking & Rationale Generation
    # -------------------------------------------------------------
    recommended_model = candidate_models[0]
    
    if recommended_model == "Iterative (Lightweight)":
        reasoning = (
            f"Recommended '{recommended_model}' based on a time budget of {project.time_budget_value} {project.time_budget_unit} "
            f"and a team of {team_size} developer(s). Work is divided into discrete passes (Foundation -> Core Features -> Polish) "
            "producing a testable build at each stage without ceremony friction."
        )
        workflow_impact = {
            "task_generation_style": "Pass-based iterations (Pass 1: Data & Core API, Pass 2: Engines, Pass 3: Review UI)",
            "progress_tracking": "Iteration completion with demoable state flags"
        }
    elif "Prototyping" in recommended_model:
        reasoning = (
            f"Recommended '{recommended_model}' because the deliverable type is '{project.deliverable_type}'. "
            "An initial fast prototype de-risks key requirements and UX before committing to complete module implementation."
        )
        workflow_impact = {
            "task_generation_style": "Prototype spike tasks followed by refinement passes",
            "progress_tracking": "Prototype milestones vs full feature completion"
        }
    else:
        reasoning = (
            f"Recommended '{recommended_model}' due to extended timeline ({project.time_budget_value} {project.time_budget_unit}) "
            "and production deliverable targets. Enables predictable sprint cadences and continuous integration."
        )
        workflow_impact = {
            "task_generation_style": "Backlog grouped into short 1-2 week cycles",
            "progress_tracking": "Sprint burndown and velocity metrics"
        }
    
    # Check if recommendation exists, else create
    rec = db.query(SDLCRecommendation).filter(
        SDLCRecommendation.project_id == project_id,
        SDLCRecommendation.status == "active"
    ).first()
    
    if rec:
        rec.recommended_model = recommended_model
        rec.reasoning = reasoning
        rec.rejected_alternatives = rejected_alternatives
        rec.workflow_impact = workflow_impact
        rec.version += 1
    else:
        rec = SDLCRecommendation(
            project_id=project_id,
            recommended_model=recommended_model,
            reasoning=reasoning,
            rejected_alternatives_json=json.dumps(rejected_alternatives),
            workflow_impact_json=json.dumps(workflow_impact),
            version=1,
            status="active"
        )
        db.add(rec)
        
    db.commit()
    db.refresh(rec)
    
    return rec
