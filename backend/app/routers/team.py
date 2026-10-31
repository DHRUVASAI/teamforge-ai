from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..core.database import get_db
from ..models.user_team import User
from .auth_team import get_current_user
from ..schemas.user_team import (
    TeamCreate, TeamJoinRequest, TeamMemberCreate, TeamMemberUpdate,
    TeamOut, TeamMemberOut, TeamHubOut
)
from ..services import auth_team_service

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_team_endpoint(req: TeamCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    team = auth_team_service.create_team(db, req, current_user.id)
    return auth_team_service.get_team_with_members(db, team.id)

@router.post("/join", response_model=Dict[str, Any])
def join_team_endpoint(req: TeamJoinRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    member = auth_team_service.join_team_by_code(db, req, current_user.id)
    return {
        "member_id": member.id,
        "team_id": member.team_id,
        "user_id": member.user_id,
        "role": member.role
    }

@router.post("/{team_id}/members", status_code=status.HTTP_201_CREATED)
def add_member_endpoint(team_id: str, req: TeamMemberCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    member = auth_team_service.add_team_member(db, team_id, req)
    return {
        "member_id": member.id,
        "team_id": member.team_id,
        "user_id": member.user_id,
        "role": member.role,
        "skills": [{"name": s.name, "level": s.level} for s in member.skills],
        "subscriptions": [{"tool_name": sub.tool_name, "tier": sub.tier, "credits": sub.credits} for sub in member.subscriptions]
    }

@router.patch("/{team_id}/members/{member_id}")
def update_member_endpoint(team_id: str, member_id: str, req: TeamMemberUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    member = auth_team_service.update_team_member(db, team_id, member_id, req)
    return {
        "member_id": member.id,
        "team_id": member.team_id,
        "user_id": member.user_id,
        "role": member.role,
        "skills": [{"name": s.name, "level": s.level} for s in member.skills],
        "subscriptions": [{"tool_name": sub.tool_name, "tier": sub.tier, "credits": sub.credits} for sub in member.subscriptions]
    }

@router.get("/{team_id}")
def get_team_endpoint(team_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return auth_team_service.get_team_with_members(db, team_id)
