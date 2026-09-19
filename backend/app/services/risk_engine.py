from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.project import Project
from ..models.risk import Risk
from ..models.user_team import TeamMember

def evaluate_project_risks(db: Session, project_id: str) -> List[Risk]:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "PROJECT_NOT_FOUND", "message": "Project not found"}}
        )
        
    members = db.query(TeamMember).filter(TeamMember.team_id == project.team_id).all()
    lead_name = "Team Lead"
    for m in members:
        if m.role == "team_leader" and m.user:
            lead_name = m.user.name
            break
            
    # Standard reference risks tailored to project (07_RISK_MANAGEMENT.md)
    reference_risks = [
        {
            "risk_code": "R-001",
            "title": "LLM Hallucination on Architecture Decisions",
            "description": "AI recommendation layer might propose non-existent dependencies or invalid architectural patterns.",
            "probability": 3,
            "impact": 3,
            "severity": "High",
            "trigger": "Complex constraint inputs or underspecified problem statements",
            "mitigation": "Enforce deterministic rule-based filter before LLM ranking; validate all outputs against 08_ADR.md.",
            "contingency": "Manual override interface allows Project Lead to adjust component boundaries.",
            "owner_name": lead_name,
            "status": "Monitoring"
        },
        {
            "risk_code": "R-002",
            "title": "Single-Developer Knowledge Bottleneck",
            "description": "Critical domain logic or execution becomes concentrated on a single developer machine.",
            "probability": 2,
            "impact": 3,
            "severity": "High",
            "trigger": "One developer owns multiple high-dependency tasks without interface contracts",
            "mitigation": "Decompose tasks into clean OpenAPI interfaces and assign parallel workstreams across team members.",
            "contingency": "Generate mock interface data so blocked developers can proceed independently.",
            "owner_name": lead_name,
            "status": "Monitoring"
        },
        {
            "risk_code": "R-003",
            "title": "Third-Party AI Quota & API Limit Exhaustion",
            "description": "A developer runs out of daily/monthly AI coding assistant quota during development.",
            "probability": 2,
            "impact": 2,
            "severity": "Medium",
            "trigger": "Heavy generation iterations on a single AI account",
            "mitigation": "Distribute tool recommendations across team members' registered individual subscriptions.",
            "contingency": "Fall back to free-tier tools or deterministic rule templates.",
            "owner_name": lead_name,
            "status": "Mitigated"
        },
        {
            "risk_code": "R-004",
            "title": "Scope Creep Beyond Project Timeline",
            "description": "Attempting to build optional Phase 3 integrations (Kubernetes, Event Bus) within early deadlines.",
            "probability": 3,
            "impact": 2,
            "severity": "Medium",
            "trigger": "Adding Could-have features before Must-have features pass automated tests",
            "mitigation": "Strict adherence to Phase 1-2 build priorities; gate Phase 3 behind definition-of-done checklist.",
            "contingency": "Cut non-essential endpoints and defer them to future releases.",
            "owner_name": lead_name,
            "status": "Open"
        },
        {
            "risk_code": "R-005",
            "title": "Premature Infrastructure Complexity",
            "description": "Over-engineering deployment pipelines before the application warrants distributed infrastructure.",
            "probability": 2,
            "impact": 2,
            "severity": "Medium",
            "trigger": "Deploying 10+ microservices for a small early-stage project",
            "mitigation": "Enforce Modular Monolith packaging in Phase 1 per ADR-001; split services only when explicit triggers fire.",
            "contingency": "Revert to single-container Docker deployment.",
            "owner_name": lead_name,
            "status": "Mitigated"
        }
    ]
    
    existing_risks = db.query(Risk).filter(Risk.project_id == project_id).all()
    if not existing_risks:
        for r_data in reference_risks:
            r = Risk(
                project_id=project_id,
                risk_code=r_data["risk_code"],
                title=r_data["title"],
                description=r_data["description"],
                probability=r_data["probability"],
                impact=r_data["impact"],
                score=r_data["probability"] * r_data["impact"],
                severity=r_data["severity"],
                trigger=r_data["trigger"],
                mitigation=r_data["mitigation"],
                contingency=r_data["contingency"],
                owner_name=r_data["owner_name"],
                status=r_data["status"]
            )
            db.add(r)
        db.commit()
        
    return db.query(Risk).filter(Risk.project_id == project_id).all()

def update_risk(db: Session, project_id: str, risk_id: str, status_val: str = None, mitigation_val: str = None) -> Risk:
    risk = db.query(Risk).filter(Risk.id == risk_id, Risk.project_id == project_id).first()
    if not risk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "RISK_NOT_FOUND", "message": "Risk item not found"}}
        )
    if status_val:
        risk.status = status_val
    if mitigation_val:
        risk.mitigation = mitigation_val
    db.commit()
    db.refresh(risk)
    return risk
