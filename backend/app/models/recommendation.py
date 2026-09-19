import json
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..core.database import Base
from .user_team import generate_uuid, utc_now

class SDLCRecommendation(Base):
    __tablename__ = "sdlc_recommendations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    recommended_model = Column(String(100), nullable=False)
    reasoning = Column(Text, nullable=False)
    rejected_alternatives_json = Column(Text, nullable=False, default="[]")
    workflow_impact_json = Column(Text, nullable=False, default="{}")
    version = Column(Integer, default=1)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=utc_now)
    
    project = relationship("Project", back_populates="sdlc_recommendations")

    @property
    def rejected_alternatives(self) -> list:
        try:
            return json.loads(self.rejected_alternatives_json)
        except Exception:
            return []

    @rejected_alternatives.setter
    def rejected_alternatives(self, value: list):
        self.rejected_alternatives_json = json.dumps(value)

    @property
    def workflow_impact(self) -> dict:
        try:
            return json.loads(self.workflow_impact_json)
        except Exception:
            return {}

    @workflow_impact.setter
    def workflow_impact(self, value: dict):
        self.workflow_impact_json = json.dumps(value)

class ArchitectureRecommendation(Base):
    __tablename__ = "architecture_recommendations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    tier = Column(String(100), nullable=False) # e.g. Modular Monolith, Multi-tier, Microservices
    deployment_recommendation = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=False)
    rejected_alternatives_json = Column(Text, nullable=False, default="[]")
    components_json = Column(Text, nullable=False, default="[]")
    version = Column(Integer, default=1)
    status = Column(String(50), default="recommended") # recommended, accepted, overridden
    created_at = Column(DateTime, default=utc_now)
    
    project = relationship("Project", back_populates="arch_recommendations")

    @property
    def rejected_alternatives(self) -> list:
        try:
            return json.loads(self.rejected_alternatives_json)
        except Exception:
            return []

    @rejected_alternatives.setter
    def rejected_alternatives(self, value: list):
        self.rejected_alternatives_json = json.dumps(value)

    @property
    def components(self) -> list:
        try:
            return json.loads(self.components_json)
        except Exception:
            return []

    @components.setter
    def components(self, value: list):
        self.components_json = json.dumps(value)

class DataArchitectureRecommendation(Base):
    __tablename__ = "data_architecture_recommendations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    ownership_map_json = Column(Text, nullable=False, default="{}")
    storage_choices_json = Column(Text, nullable=False, default="[]")
    reasoning = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    
    project = relationship("Project", back_populates="data_arch_recommendations")

    @property
    def ownership_map(self) -> dict:
        try:
            return json.loads(self.ownership_map_json)
        except Exception:
            return {}

    @ownership_map.setter
    def ownership_map(self, value: dict):
        self.ownership_map_json = json.dumps(value)

    @property
    def storage_choices(self) -> list:
        try:
            return json.loads(self.storage_choices_json)
        except Exception:
            return []

    @storage_choices.setter
    def storage_choices(self, value: list):
        self.storage_choices_json = json.dumps(value)
