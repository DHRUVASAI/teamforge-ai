import json
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..core.database import Base
from .user_team import generate_uuid, utc_now

class GitHubLink(Base):
    __tablename__ = "github_links"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    repo_url = Column(String(255), nullable=False)
    synced_issues_json = Column(Text, nullable=False, default="[]")
    status = Column(String(50), nullable=False, default="connected")
    created_at = Column(DateTime, default=utc_now)
    
    project = relationship("Project", back_populates="github_links")

    @property
    def synced_issues(self) -> list:
        try:
            return json.loads(self.synced_issues_json)
        except Exception:
            return []

    @synced_issues.setter
    def synced_issues(self, value: list):
        self.synced_issues_json = json.dumps(value)

class GeneratedArtifact(Base):
    __tablename__ = "generated_artifacts"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    artifact_type = Column(String(100), nullable=False) # architecture_readme, pitch_deck
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    
    project = relationship("Project", back_populates="artifacts")
