from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class TaskStatusUpdate(BaseModel):
    status: str # todo, in_progress, review, done

class TaskAssigneeSchema(BaseModel):
    user_id: str
    member_id: str
    name: str
    experience_level: str
    reasoning: str

class TaskOut(BaseModel):
    id: str
    project_id: str
    component_name: str
    title: str
    description: str
    status: str
    estimated_hours: int
    depends_on: List[str]
    assignee: Optional[TaskAssigneeSchema] = None
    created_at: datetime

class BottleneckFlagSchema(BaseModel):
    task_id: str
    task_title: str
    blocked_tasks_count: int
    severity: str # low, medium, high
    suggestion: str

class TaskDecomposeResponse(BaseModel):
    tasks: List[TaskOut]
    bottlenecks: List[BottleneckFlagSchema]

class AssignmentGenerateResponse(BaseModel):
    assignments: List[Dict[str, Any]]
