import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.project import Project
from ..models.user_team import TeamMember
from ..models.recommendation import ArchitectureRecommendation
from ..schemas.recommendation import ArchitectureOverrideRequest
from .condition_layer import extract_mandatory_platform_rules

def recommend_architecture(db: Session, project_id: str) -> ArchitectureRecommendation:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "PROJECT_NOT_FOUND", "message": "Project not found"}}
        )
        
    team_members = db.query(TeamMember).filter(TeamMember.team_id == project.team_id).all()
    team_size = max(1, len(team_members))
    
    # -------------------------------------------------------------
    # Layer 1: Deterministic Rule-Based Filter (05_ARCHITECTURE.md & ADR-007)
    # -------------------------------------------------------------
    # Rule 1: Small team (<= 5 devs) or early stage -> Modular Monolith
    tier = "Modular Monolith"
    deployment_recommendation = (
        "Single containerized deployable package with strict internal module API boundaries "
        "and isolated database schemas per service."
    )
    reasoning = (
        f"For a team of {team_size} developer(s) and current project scale, a Modular Monolith enforces clear service "
        "boundaries and data ownership without incurring the networking overhead, complex orchestration, "
        "and distributed failure modes of 10+ separate microservices."
    )
    
    rejected_alternatives = [
        {
            "tier": "Full Distributed Microservices",
            "reason_rejected": "Premature microservices introduce operational complexity (Kubernetes, service mesh, distributed tracing) that exceeds current team size and timeline."
        },
        {
            "tier": "Unstructured Monolith",
            "reason_rejected": "Lacks enforced module boundaries, leading to tightly coupled code, shared database joins, and single-developer bottlenecks."
        }
    ]
    
    # Generate Component Breakdown with Data Ownership (06_DATA_ARCHITECTURE.md)
    components = [
        {
            "id": "comp-user-team",
            "name": "User & Team Service",
            "responsibility": "Authentication, user profiles, member skill tracking, and active tool/cloud subscription records.",
            "data_ownership": {
                "storage": "PostgreSQL",
                "schema_tables": ["users", "teams", "team_members", "member_skills", "member_subscriptions"]
            }
        },
        {
            "id": "comp-project-feasibility",
            "name": "Project & Feasibility Service",
            "responsibility": "Problem statement capture, capability extraction, constraint verification, and capacity calculations.",
            "data_ownership": {
                "storage": "PostgreSQL",
                "schema_tables": ["projects"]
            }
        },
        {
            "id": "comp-decision-engine",
            "name": "SDLC & Architecture Engine",
            "responsibility": "Two-layer decision logic, candidate filtering, and explainable rationale generation.",
            "data_ownership": {
                "storage": "PostgreSQL",
                "schema_tables": ["sdlc_recommendations", "architecture_recommendations"]
            }
        },
        {
            "id": "comp-task-assignment",
            "name": "Task & Workstream Service",
            "responsibility": "Task decomposition DAG, bottleneck detection, and skill-level task assignment.",
            "data_ownership": {
                "storage": "PostgreSQL",
                "schema_tables": ["tasks", "task_assignments"]
            }
        },
        {
            "id": "comp-tool-recommender",
            "name": "Tool & Subscription Service",
            "responsibility": "Task-specific tool recommendation matching task types with active developer subscriptions.",
            "data_ownership": {
                "storage": "PostgreSQL",
                "schema_tables": ["tool_catalog", "tool_recommendations"]
            }
        },
        {
            "id": "comp-risk-manager",
            "name": "Risk & Mitigation Service",
            "responsibility": "Project risk register, probability x impact matrix, and mitigation status tracking.",
            "data_ownership": {
                "storage": "PostgreSQL",
                "schema_tables": ["risks"]
            }
        },
        {
            "id": "comp-mentor-orchestration",
            "name": "Mentor & Explainability Layer",
            "responsibility": "Cross-cutting Q&A, contextual 'Why?' query resolution, and proactive developer alerts.",
            "data_ownership": {
                "storage": "PostgreSQL",
                "schema_tables": ["mentor_conversations"]
            }
        },
        {
            "id": "comp-devops-delivery",
            "name": "DevOps & Delivery Service",
            "responsibility": "GitHub task synchronization, architecture README generation, and pitch deck outline synthesis.",
            "data_ownership": {
                "storage": "PostgreSQL & Object Store",
                "schema_tables": ["github_links", "generated_artifacts"]
            }
        }
    ]
    
    # Condition Layer Injection: Inject Mandatory Hackathon Platforms
    platform_rules = extract_mandatory_platform_rules(project)
    for rule in platform_rules:
        bp = rule["blueprint"]
        comp_id = f"comp-{rule['platform_name'].lower().replace(' ', '-')}"
        if not any(c["id"] == comp_id for c in components):
            components.append({
                "id": comp_id,
                "name": bp["component_name"],
                "responsibility": bp["responsibility"],
                "data_ownership": {
                    "storage": "PostgreSQL",
                    "schema_tables": bp["schema_tables"]
                }
            })
    
    rec = db.query(ArchitectureRecommendation).filter(
        ArchitectureRecommendation.project_id == project_id,
        ArchitectureRecommendation.status != "overridden"
    ).order_by(ArchitectureRecommendation.version.desc()).first()
    
    if rec and rec.status == "recommended":
        rec.tier = tier
        rec.deployment_recommendation = deployment_recommendation
        rec.reasoning = reasoning
        rec.rejected_alternatives = rejected_alternatives
        rec.components = components
    else:
        rec = ArchitectureRecommendation(
            project_id=project_id,
            tier=tier,
            deployment_recommendation=deployment_recommendation,
            reasoning=reasoning,
            rejected_alternatives_json=json.dumps(rejected_alternatives),
            components_json=json.dumps(components),
            version=1 if not rec else rec.version + 1,
            status="recommended"
        )
        db.add(rec)
        
    db.commit()
    db.refresh(rec)
    return rec

def accept_architecture(db: Session, project_id: str, recommendation_id: str) -> ArchitectureRecommendation:
    rec = db.query(ArchitectureRecommendation).filter(
        ArchitectureRecommendation.id == recommendation_id,
        ArchitectureRecommendation.project_id == project_id
    ).first()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "RECOMMENDATION_NOT_FOUND", "message": "Architecture recommendation not found"}}
        )
    rec.status = "accepted"
    
    # Update project status
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        project.status = "planned"
        
    db.commit()
    db.refresh(rec)
    return rec

def override_architecture(db: Session, project_id: str, data: ArchitectureOverrideRequest) -> ArchitectureRecommendation:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "PROJECT_NOT_FOUND", "message": "Project not found"}}
        )
        
    # Mark old recommendations as superseded
    db.query(ArchitectureRecommendation).filter(
        ArchitectureRecommendation.project_id == project_id
    ).update({"status": "overridden"})
    
    components_dict = [c.model_dump() for c in data.components]
    
    new_rec = ArchitectureRecommendation(
        project_id=project_id,
        tier=data.tier,
        deployment_recommendation="User customized architectural layout with defined module boundaries.",
        reasoning="Custom architecture configuration provided by Project Lead override.",
        rejected_alternatives_json=json.dumps([{
            "tier": "Original System Recommendation",
            "reason_rejected": "Project Lead exercised manual override authority per FR-019."
        }]),
        components_json=json.dumps(components_dict),
        version=2,
        status="accepted"
    )
    db.add(new_rec)
    project.status = "planned"
    db.commit()
    db.refresh(new_rec)
    return new_rec
