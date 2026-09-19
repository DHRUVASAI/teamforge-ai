import json
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..core.database import Base
from .user_team import generate_uuid, utc_now

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    component_name = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False, default="")
    status = Column(String(50), nullable=False, default="todo") # todo, in_progress, review, done
    estimated_hours = Column(Integer, nullable=False, default=4)
    depends_on_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime, default=utc_now)
    
    project = relationship("Project", back_populates="tasks")
    assignment = relationship("TaskAssignment", back_populates="task", uselist=False, cascade="all, delete-orphan")
    tool_recommendation = relationship("ToolRecommendation", back_populates="task", uselist=False, cascade="all, delete-orphan")

    @property
    def depends_on(self) -> list:
        try:
            return json.loads(self.depends_on_json)
        except Exception:
            return []

    @depends_on.setter
    def depends_on(self, value: list):
        self.depends_on_json = json.dumps(value)

class TaskAssignment(Base):
    __tablename__ = "task_assignments"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False)
    member_id = Column(String(36), ForeignKey("team_members.id"), nullable=False)
    reasoning = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    
    task = relationship("Task", back_populates="assignment")
    member = relationship("TeamMember", back_populates="assignments")
