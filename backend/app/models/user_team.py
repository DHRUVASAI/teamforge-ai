import uuid
import random
import string
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def generate_team_code() -> str:
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=4))
    return f"TEAM-{suffix}"

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now)
    
    memberships = relationship("TeamMember", back_populates="user", cascade="all, delete-orphan")

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    team_code = Column(String(20), unique=True, index=True, default=generate_team_code)
    created_at = Column(DateTime, default=utc_now)
    
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="team", cascade="all, delete-orphan")

class TeamMember(Base):
    __tablename__ = "team_members"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    team_id = Column(String(36), ForeignKey("teams.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    role = Column(String(50), default="developer", nullable=False) # team_leader, developer, early_career, ai_assisted
    created_at = Column(DateTime, default=utc_now)
    
    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="memberships")
    skills = relationship("MemberSkill", back_populates="member", cascade="all, delete-orphan")
    subscriptions = relationship("MemberSubscription", back_populates="member", cascade="all, delete-orphan")
    assignments = relationship("TaskAssignment", back_populates="member")

class MemberSkill(Base):
    __tablename__ = "member_skills"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    member_id = Column(String(36), ForeignKey("team_members.id"), nullable=False)
    name = Column(String(100), nullable=False)
    level = Column(String(50), default="Intermediate", nullable=False) # Beginner, Intermediate, Advanced
    
    member = relationship("TeamMember", back_populates="skills")

class MemberSubscription(Base):
    __tablename__ = "member_subscriptions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    member_id = Column(String(36), ForeignKey("team_members.id"), nullable=False)
    tool_name = Column(String(100), nullable=False) # e.g. Cursor Pro, Claude Pro, AWS Credits
    tier = Column(String(50), default="Pro", nullable=False) # Free, Pro, Team, Credits
    credits = Column(String(255), nullable=True) # e.g. "free tier", "$50 Credits"
    
    member = relationship("TeamMember", back_populates="subscriptions")
