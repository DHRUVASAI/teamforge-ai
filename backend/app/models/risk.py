from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..core.database import Base
from .user_team import generate_uuid, utc_now

class Risk(Base):
    __tablename__ = "risks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    risk_code = Column(String(20), nullable=False) # e.g. R-001
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False, default="")
    probability = Column(Integer, nullable=False, default=2) # 1, 2, 3
    impact = Column(Integer, nullable=False, default=2) # 1, 2, 3
    score = Column(Integer, nullable=False, default=4) # probability * impact
    severity = Column(String(50), nullable=False, default="Medium") # Low, Medium, High
    trigger = Column(Text, nullable=False, default="")
    mitigation = Column(Text, nullable=False, default="")
    contingency = Column(Text, nullable=False, default="")
    owner_name = Column(String(100), nullable=False, default="Team Lead")
    status = Column(String(50), nullable=False, default="Open") # Open, Monitoring, Mitigated, Closed
    created_at = Column(DateTime, default=utc_now)
    
    project = relationship("Project", back_populates="risks")
