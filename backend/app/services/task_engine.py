import json
from collections import defaultdict
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.project import Project
from ..models.recommendation import ArchitectureRecommendation
from ..models.task import Task, TaskAssignment
from ..models.user_team import TeamMember, User
from ..schemas.task import TaskOut, BottleneckFlagSchema, TaskDecomposeResponse, TaskAssigneeSchema

def decompose_tasks(db: Session, project_id: str) -> TaskDecomposeResponse:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "PROJECT_NOT_FOUND", "message": "Project not found"}}
        )
        
    arch_rec = db.query(ArchitectureRecommendation).filter(
        ArchitectureRecommendation.project_id == project_id,
        ArchitectureRecommendation.status == "accepted"
    ).order_by(ArchitectureRecommendation.version.desc()).first()
    
    if not arch_rec:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": {"code": "ARCHITECTURE_NOT_ACCEPTED", "message": "An architecture recommendation must be accepted before task decomposition can run."}}
        )
        
    # Delete existing unstarted tasks if regenerating
    db.query(Task).filter(Task.project_id == project_id).delete()
    
    generated_tasks_data = [
        {
            "component_name": "User & Team Service",
            "title": "Set up Database Schemas & Member Subscription Model",
            "description": "Create PostgreSQL tables for users, teams, skills, and member tool subscriptions.",
            "estimated_hours": 3,
            "depends_on_idx": []
        },
        {
            "component_name": "User & Team Service",
            "title": "Implement JWT Auth & Team Scoping Middleware",
            "description": "Implement register/login endpoints and X-Team-Id header authorization check.",
            "estimated_hours": 4,
            "depends_on_idx": [0]
        },
        {
            "component_name": "Project & Feasibility Service",
            "title": "Build Requirements Extraction & Feasibility Calculator",
            "description": "Implement problem statement parsing, capability extraction, and capacity hour checks.",
            "estimated_hours": 4,
            "depends_on_idx": [0, 1]
        },
        {
            "component_name": "SDLC & Architecture Engine",
            "title": "Implement Two-Layer Decision Engines",
            "description": "Build rule-based candidate filtering and explainable reasoning generators for SDLC and Architecture.",
            "estimated_hours": 5,
            "depends_on_idx": [2]
        },
        {
            "component_name": "Task & Workstream Service",
            "title": "Implement Task Decomposition DAG & Bottleneck Detector",
            "description": "Build graph analysis logic to detect blocking dependency paths and suggest mitigations.",
            "estimated_hours": 5,
            "depends_on_idx": [3]
        },
        {
            "component_name": "Tool & Subscription Service",
            "title": "Build Tool Recommendation Engine with Subscription Priority",
            "description": "Implement catalog lookup prioritizing tools where the team holds active subscriptions/licenses.",
            "estimated_hours": 4,
            "depends_on_idx": [0, 4]
        },
        {
            "component_name": "Risk & Mitigation Service",
            "title": "Implement Risk Matrix & Trigger Evaluation",
            "description": "Create risk scoring (P x I), automatic trigger monitors, and status update endpoints.",
            "estimated_hours": 4,
            "depends_on_idx": [4]
        },
        {
            "component_name": "Mentor & Explainability Layer",
            "title": "Build Mentor Q&A and 'Why?' Explainer",
            "description": "Implement contextual project question answering and explainability endpoints citing ADRs.",
            "estimated_hours": 5,
            "depends_on_idx": [3, 4, 6]
        },
        {
            "component_name": "DevOps & Delivery Service",
            "title": "Implement GitHub Sync & README Generator",
            "description": "Build simulated GitHub issue creation and automated architecture markdown generation.",
            "estimated_hours": 4,
            "depends_on_idx": [4]
        }
    ]
    
    created_tasks = []
    for item in generated_tasks_data:
        task = Task(
            project_id=project_id,
            component_name=item["component_name"],
            title=item["title"],
            description=item["description"],
            estimated_hours=item["estimated_hours"],
            status="todo",
            depends_on_json="[]"
        )
        db.add(task)
        created_tasks.append(task)
        
    db.commit()
    for t in created_tasks:
        db.refresh(t)
        
    # Map index dependencies to real task UUIDs
    for i, item in enumerate(generated_tasks_data):
        dep_ids = [created_tasks[dep_idx].id for dep_idx in item["depends_on_idx"]]
        created_tasks[i].depends_on_json = json.dumps(dep_ids)
        
    db.commit()
    
    # Auto-assign initial tasks
    auto_assign_tasks_by_skills(db, project_id)
    
    return get_project_tasks_and_bottlenecks(db, project_id)

def get_project_tasks_and_bottlenecks(db: Session, project_id: str) -> TaskDecomposeResponse:
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    
    # Build reverse dependency graph to detect bottlenecks
    blocked_counts = defaultdict(int)
    for t in tasks:
        for dep_id in t.depends_on:
            blocked_counts[dep_id] += 1
            
    bottlenecks = []
    tasks_out = []
    
    for t in tasks:
        assignee_out = None
        if t.assignment:
            member = t.assignment.member
            user = member.user if member else None
            assignee_out = TaskAssigneeSchema(
                user_id=member.user_id if member else "",
                member_id=member.id if member else "",
                name=user.name if user else "Assignee",
                experience_level=member.role if member else "developer",
                reasoning=t.assignment.reasoning
            )
            
        task_out = TaskOut(
            id=t.id,
            project_id=t.project_id,
            component_name=t.component_name,
            title=t.title,
            description=t.description,
            status=t.status,
            estimated_hours=t.estimated_hours,
            depends_on=t.depends_on,
            assignee=assignee_out,
            created_at=t.created_at
        )
        tasks_out.append(task_out)
        
        # Check bottleneck severity
        count = blocked_counts[t.id]
        if count >= 2:
            severity = "high" if count >= 3 else "medium"
            bottlenecks.append(BottleneckFlagSchema(
                task_id=t.id,
                task_title=t.title,
                blocked_tasks_count=count,
                severity=severity,
                suggestion=f"Task '{t.title}' is on the critical path blocking {count} downstream task(s). Consider pair programming, interface mocking, or prioritizing early completion."
            ))
            
    return TaskDecomposeResponse(tasks=tasks_out, bottlenecks=bottlenecks)

def update_task_status(db: Session, task_id: str, new_status: str) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "TASK_NOT_FOUND", "message": "Task not found"}}
        )
    task.status = new_status
    db.commit()
    db.refresh(task)
    return task

def auto_assign_tasks_by_skills(db: Session, project_id: str):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return
        
    members = db.query(TeamMember).filter(TeamMember.team_id == project.team_id).all()
    if not members:
        return
        
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    
    # Sort members by experience/skills
    leader = next((m for m in members if m.role == "team_leader"), members[0])
    ai_assisted = [m for m in members if m.role == "ai_assisted"]
    early_career = [m for m in members if m.role == "early_career"]
    general_devs = [m for m in members if m.role == "developer"]
    
    for i, t in enumerate(tasks):
        # Delete old assignment
        db.query(TaskAssignment).filter(TaskAssignment.task_id == t.id).delete()
        
        # Assignment matching heuristic (03_USE_CASES.md & FR-025-027)
        if "Schema" in t.title or "Decision" in t.title:
            assigned_member = leader
            reason = f"{assigned_member.user.name} (Team Lead) assigned to foundational architecture/decision logic."
        elif "Mentor" in t.title or "Tool" in t.title:
            assigned_member = ai_assisted[0] if ai_assisted else members[i % len(members)]
            reason = f"{assigned_member.user.name} assigned due to AI-assisted workflow persona and active tool subscriptions."
        elif "README" in t.title or "Feasibility" in t.title:
            assigned_member = early_career[0] if early_career else members[i % len(members)]
            reason = f"{assigned_member.user.name} assigned to scoped documentation/analytical tasks with clear guidelines."
        else:
            assigned_member = general_devs[i % len(general_devs)] if general_devs else members[i % len(members)]
            reason = f"{assigned_member.user.name} assigned based on matching technical skill stack."
            
        assignment = TaskAssignment(
            task_id=t.id,
            member_id=assigned_member.id,
            reasoning=reason
        )
        db.add(assignment)
        
    db.commit()
