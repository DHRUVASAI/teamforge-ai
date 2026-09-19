from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from ..core.database import Base
from ..models.user_team import utc_now, generate_uuid

class ProjectPlaybook(Base):
    __tablename__ = "project_playbooks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), unique=True, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    project = relationship("Project")
    stages = relationship("PlaybookStage", back_populates="playbook", cascade="all, delete-orphan")
    evaluations = relationship("ToolEvaluation", back_populates="playbook", cascade="all, delete-orphan")

class PlaybookStage(Base):
    __tablename__ = "playbook_stages"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    playbook_id = Column(String(36), ForeignKey("project_playbooks.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    
    playbook = relationship("ProjectPlaybook", back_populates="stages")
    steps = relationship("PlaybookStep", back_populates="stage", cascade="all, delete-orphan", order_by="PlaybookStep.order_index")

class PlaybookStep(Base):
    __tablename__ = "playbook_steps"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    stage_id = Column(String(36), ForeignKey("playbook_stages.id"), nullable=False)
    order_index = Column(Integer, default=0)
    instruction = Column(Text, nullable=False)
    ai_prompt = Column(Text, nullable=True)
    context_files = Column(JSON, nullable=True)
    
    stage = relationship("PlaybookStage", back_populates="steps")

class ToolEvaluation(Base):
    __tablename__ = "tool_evaluations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    playbook_id = Column(String(36), ForeignKey("project_playbooks.id"), nullable=False)
    capability = Column(String(255), nullable=False)
    winning_tool = Column(String(255), nullable=False)
    winning_category = Column(String(255), nullable=False)
    rationale = Column(Text, nullable=False)
    evaluation_matrix_json = Column(JSON, nullable=False)
    is_fallback = Column(Boolean, default=False, nullable=False)
    
    playbook = relationship("ProjectPlaybook", back_populates="evaluations")
