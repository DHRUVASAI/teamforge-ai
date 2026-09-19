import json
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..core.database import Base
from .user_team import generate_uuid, utc_now

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    team_id = Column(String(36), ForeignKey("teams.id"), nullable=False)
    name = Column(String(255), nullable=False)
    problem_statement = Column(Text, nullable=False)
    idea = Column(Text, nullable=False)
    time_budget_value = Column(Integer, nullable=False, default=48)
    time_budget_unit = Column(String(50), nullable=False, default="hours") # hours, days, weeks, months
    deliverable_type = Column(String(50), nullable=False, default="prototype") # prototype, production, capstone
    constraints_json = Column(Text, nullable=False, default="[]")
    mandatory_platforms_json = Column(Text, nullable=False, default="[]")
    status = Column(String(50), nullable=False, default="draft") # draft, analyzed, planned, in_progress, completed
    feasibility_verdict = Column(String(50), nullable=True)
    feasibility_reasoning = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    team = relationship("Team", back_populates="projects")
    sdlc_recommendations = relationship("SDLCRecommendation", back_populates="project", cascade="all, delete-orphan")
    arch_recommendations = relationship("ArchitectureRecommendation", back_populates="project", cascade="all, delete-orphan")
    data_arch_recommendations = relationship("DataArchitectureRecommendation", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    risks = relationship("Risk", back_populates="project", cascade="all, delete-orphan")
    mentor_conversations = relationship("MentorConversation", back_populates="project", cascade="all, delete-orphan")
    github_links = relationship("GitHubLink", back_populates="project", cascade="all, delete-orphan")
    artifacts = relationship("GeneratedArtifact", back_populates="project", cascade="all, delete-orphan")

    @property
    def title(self) -> str:
        return self.name

    @title.setter
    def title(self, value: str):
        self.name = value

    @property
    def constraints(self) -> list:
        try:
            return json.loads(self.constraints_json)
        except Exception:
            return []

    @constraints.setter
    def constraints(self, value: list):
        self.constraints_json = json.dumps(value)

    @property
    def mandatory_platforms(self) -> list:
        try:
            return json.loads(self.mandatory_platforms_json)
        except Exception:
            return []

    @mandatory_platforms.setter
    def mandatory_platforms(self, value: list):
        self.mandatory_platforms_json = json.dumps(value)
