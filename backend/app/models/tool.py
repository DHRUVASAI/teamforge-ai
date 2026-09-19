import json
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..core.database import Base
from .user_team import generate_uuid, utc_now

class ToolCatalogEntry(Base):
    __tablename__ = "tool_catalog"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    tool_name = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    task_types_json = Column(Text, nullable=False, default="[]")
    skill_level_fit = Column(String(100), nullable=False, default="Beginner-Advanced")
    free_tier = Column(String(255), nullable=False, default="Available")
    quota_notes = Column(Text, nullable=True)
    integration_difficulty = Column(String(50), nullable=False, default="Low")
    best_for = Column(Text, nullable=False, default="")
    limitations = Column(Text, nullable=False, default="")
    last_verified = Column(String(50), nullable=False, default="2026-09-15")

    @property
    def task_types(self) -> list:
        try:
            return json.loads(self.task_types_json)
        except Exception:
            return []

    @task_types.setter
    def task_types(self, value: list):
        self.task_types_json = json.dumps(value)

class ToolRecommendation(Base):
    __tablename__ = "tool_recommendations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False)
    recommended_tools_json = Column(Text, nullable=False, default="[]")
    rejected_tools_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime, default=utc_now)
    
    task = relationship("Task", back_populates="tool_recommendation")

    @property
    def recommended_tools(self) -> list:
        try:
            return json.loads(self.recommended_tools_json)
        except Exception:
            return []

    @recommended_tools.setter
    def recommended_tools(self, value: list):
        self.recommended_tools_json = json.dumps(value)

    @property
    def rejected_tools(self) -> list:
        try:
            return json.loads(self.rejected_tools_json)
        except Exception:
            return []

    @rejected_tools.setter
    def rejected_tools(self, value: list):
        self.rejected_tools_json = json.dumps(value)
