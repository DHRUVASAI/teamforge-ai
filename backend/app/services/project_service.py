import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.project import Project
from ..models.user_team import Team, TeamMember
from ..schemas.project import ProjectCreate, ProjectUpdate, FeasibilityResponse, CapabilitySchema, AmbiguitySchema, FeasibilityDetails

def create_project(db: Session, data: ProjectCreate) -> Project:
    team = db.query(Team).filter(Team.id == data.team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team does not exist"
        )
    
    project = Project(
        team_id=data.team_id,
        name=data.name,
        problem_statement=data.problem_statement,
        idea=data.idea,
        time_budget_value=data.time_budget.value,
        time_budget_unit=data.time_budget.unit,
        deliverable_type=data.deliverable_type,
        constraints_json=json.dumps(data.constraints),
        mandatory_platforms_json=json.dumps(data.mandatory_platforms),
        status="draft"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

def update_project(db: Session, project_id: str, data: ProjectUpdate) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if data.name is not None:
        project.name = data.name
    if data.problem_statement is not None:
        project.problem_statement = data.problem_statement
    if data.idea is not None:
        project.idea = data.idea
    if data.time_budget is not None:
        project.time_budget_value = data.time_budget.value
        project.time_budget_unit = data.time_budget.unit
    if data.deliverable_type is not None:
        project.deliverable_type = data.deliverable_type
    if data.constraints is not None:
        project.constraints_json = json.dumps(data.constraints)
    if data.mandatory_platforms is not None:
        project.mandatory_platforms_json = json.dumps(data.mandatory_platforms)
    db.commit()
    db.refresh(project)
    return project

def get_project(db: Session, project_id: str) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project

def analyze_project_feasibility(db: Session, project_id: str) -> FeasibilityResponse:
    project = get_project(db, project_id)
    team_members = db.query(TeamMember).filter(TeamMember.team_id == project.team_id).all()
    team_size = max(1, len(team_members))
    
    # Calculate available capacity hours
    unit_multiplier = {
        "hours": 1,
        "days": 8,
        "weeks": 40,
        "months": 160
    }.get(project.time_budget_unit.lower(), 1)
    
    total_time_hours = project.time_budget_value * unit_multiplier
    total_capacity_hours = team_size * total_time_hours
    
    # Extract capabilities based on problem statement and idea
    text_corpus = f"{project.problem_statement} {project.idea}".lower()
    capabilities = [
        CapabilitySchema(id="CAP-01", name="Core User & Team Management", complexity="Low"),
        CapabilitySchema(id="CAP-02", name="Problem Statement Analysis & Feasibility Engine", complexity="Medium"),
        CapabilitySchema(id="CAP-03", name="SDLC & Architecture Decision Engine", complexity="Medium"),
        CapabilitySchema(id="CAP-04", name="Autonomous Task Decomposition & Workstream DAG", complexity="High"),
        CapabilitySchema(id="CAP-05", name="Skill-Aware Task Assignment & Tool Recommender", complexity="Medium"),
        CapabilitySchema(id="CAP-06", name="Risk Register & Real-Time Mitigation System", complexity="Medium"),
        CapabilitySchema(id="CAP-07", name="AI Engineering Mentor & Explainability Layer", complexity="High")
    ]
    
    if "github" in text_corpus or "ci" in text_corpus or "devops" in text_corpus:
        capabilities.append(CapabilitySchema(id="CAP-08", name="DevOps & Source Control Integration", complexity="Medium"))
    if "doc" in text_corpus or "presentation" in text_corpus or "pitch" in text_corpus:
        capabilities.append(CapabilitySchema(id="CAP-09", name="Automated Architecture Documentation & Pitch Generator", complexity="Low"))

    complexity_hours = {
        "Low": 4,
        "Medium": 8,
        "High": 14
    }
    
    total_estimated_work_hours = sum(complexity_hours[c.complexity] for c in capabilities)
    
    # Feasibility evaluation
    if total_estimated_work_hours <= total_capacity_hours * 0.85:
        verdict = "feasible"
        score = 9.0
        reasoning = f"Project scope is well-sized for {team_size} developer(s) within the {project.time_budget_value} {project.time_budget_unit} window."
        reductions = []
    elif total_estimated_work_hours <= total_capacity_hours * 1.2:
        verdict = "feasible_with_adjustments"
        score = 7.2
        reasoning = f"Scope fits available capacity with slight risk. Highly recommended to defer non-essential integrations to a later phase."
        reductions = [
            "Defer third-party CI/CD automation to Phase 3",
            "Focus on core Modular Monolith before multi-cloud deployment"
        ]
    else:
        verdict = "scope_exceeded"
        score = 4.5
        reasoning = f"Estimated workload ({total_estimated_work_hours}h) exceeds realistic capacity ({total_capacity_hours}h) by over 20%."
        reductions = [
            "Cut advanced distributed orchestration in Phase 1",
            "Limit scope to MVP core workflows (Requirements -> Architecture -> Tasks)"
        ]
        
    # Ambiguity check
    ambiguities = []
    if len(project.problem_statement.strip()) < 50:
        ambiguities.append(AmbiguitySchema(
            id="AMB-01",
            question="The problem statement is very concise. What specific user pain point should be prioritized?",
            suggested_answer="Focus on single-developer bottlenecks and clear team workstream separation."
        ))
    if not project.constraints:
        ambiguities.append(AmbiguitySchema(
            id="AMB-02",
            question="No explicit technical constraints were provided. Is a relational PostgreSQL storage model preferred?",
            suggested_answer="Yes, PostgreSQL with standard REST API is recommended."
        ))
        
    project.status = "analyzed"
    db.commit()
    
    return FeasibilityResponse(
        capabilities=capabilities,
        ambiguities=ambiguities,
        feasibility=FeasibilityDetails(
            verdict=verdict,
            score=score,
            total_estimated_hours=total_estimated_work_hours,
            available_team_capacity_hours=total_capacity_hours,
            reasoning=reasoning,
            proposed_scope_reduction=reductions
        )
    )
