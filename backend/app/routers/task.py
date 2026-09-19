from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user_id
from ..models.task import Task, TaskAssignment
from ..schemas.task import (
    TaskDecomposeResponse, TaskOut, TaskStatusUpdate, BottleneckFlagSchema, AssignmentGenerateResponse
)
from ..services import task_engine

router = APIRouter(tags=["Task & Assignment Service"])

@router.post("/projects/{id}/tasks/decompose", response_model=TaskDecomposeResponse)
def decompose_tasks_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return task_engine.decompose_tasks(db, id)

@router.get("/projects/{id}/tasks", response_model=TaskDecomposeResponse)
def get_tasks_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return task_engine.get_project_tasks_and_bottlenecks(db, id)

@router.patch("/tasks/{task_id}")
def update_task_status_endpoint(
    task_id: str,
    req: TaskStatusUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    task = task_engine.update_task_status(db, task_id, req.status)
    return {
        "id": task.id,
        "project_id": task.project_id,
        "title": task.title,
        "status": task.status,
        "updated": True
    }

@router.get("/projects/{id}/tasks/bottlenecks", response_model=List[BottleneckFlagSchema])
def get_bottlenecks_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    res = task_engine.get_project_tasks_and_bottlenecks(db, id)
    return res.bottlenecks

@router.post("/projects/{id}/assignments/generate")
def generate_assignments_endpoint(
    id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    task_engine.auto_assign_tasks_by_skills(db, id)
    tasks = db.query(Task).filter(Task.project_id == id).all()
    
    assignments_out = []
    for t in tasks:
        if t.assignment and t.assignment.member:
            member = t.assignment.member
            user = member.user
            assignments_out.append({
                "assignment_id": t.assignment.id,
                "task_id": t.id,
                "task_title": t.title,
                "component": t.component_name,
                "member_id": member.id,
                "member_name": user.name if user else "Developer",
                "member_role": member.role,
                "reasoning": t.assignment.reasoning,
                "match_score": 95 if member.role in ["team_leader", "ai_assisted"] else 85
            })
            
    return {
        "project_id": id,
        "total_assigned": len(assignments_out),
        "assignments": assignments_out
    }

@router.patch("/assignments/{assignment_id}")
def reassign_task_endpoint(
    assignment_id: str,
    member_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    assignment = db.query(TaskAssignment).filter(TaskAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "ASSIGNMENT_NOT_FOUND", "message": "Task assignment not found"}}
        )
    assignment.member_id = member_id
    assignment.reasoning = "Manual reassignment by Project Lead"
    db.commit()
    db.refresh(assignment)
    return {
        "assignment_id": assignment.id,
        "task_id": assignment.task_id,
        "member_id": assignment.member_id,
        "reasoning": assignment.reasoning,
        "updated": True
    }
