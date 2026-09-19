import json
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..core.database import Base
from .user_team import generate_uuid, utc_now

class MentorConversation(Base):
    __tablename__ = "mentor_conversations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    member_id = Column(String(36), ForeignKey("team_members.id"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sources_json = Column(Text, nullable=False, default="[]")
    rejected_alternatives_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime, default=utc_now)
    
    project = relationship("Project", back_populates="mentor_conversations")

    @property
    def sources(self) -> list:
        try:
            return json.loads(self.sources_json)
        except Exception:
            return []

    @sources.setter
    def sources(self, value: list):
        self.sources_json = json.dumps(value)

    @property
    def rejected_alternatives(self) -> list:
        try:
            return json.loads(self.rejected_alternatives_json)
        except Exception:
            return []

    @rejected_alternatives.setter
    def rejected_alternatives(self, value: list):
        self.rejected_alternatives_json = json.dumps(value)
