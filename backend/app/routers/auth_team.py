from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from uuid import uuid4
import logging

from ..core.database import get_db
from ..core.security import hash_password, verify_password, create_access_token, decode_token
from ..models.user_team import User, Team, TeamMember
from ..schemas.auth_schema import RegisterRequest, LoginRequest, TokenResponse, UserOut
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
logger = logging.getLogger(__name__)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

class TeamJoinRequest(BaseModel):
    team_code: str

class TeamMemberOut(BaseModel):
    user_id: str
    name: str
    email: str
    role: str

class TeamOut(BaseModel):
    team_id: str
    name: str
    team_code: str
    members: List[TeamMemberOut]

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    uid = str(uuid4())
    user = User(
        id=uid,
        name=req.name,
        email=req.email,
        hashed_password=hash_password(req.password)
    )
    db.add(user)

    # Auto-create a personal team for the user
    tid = str(uuid4())
    team = Team(id=tid, name=f"{req.name}'s Squad", team_code=f"SQUAD-{uid[:6].upper()}")
    db.add(team)

    mid = str(uuid4())
    member = TeamMember(id=mid, user_id=uid, team_id=tid, role="team_leader")
    db.add(member)
    db.commit()

    token = create_access_token({"sub": uid})
    return TokenResponse(access_token=token, user_id=uid, name=user.name, email=user.email)

@router.post("/join-team", response_model=TeamOut)
def join_team(req: TeamJoinRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.team_code == req.team_code).first()
    if not team:
        raise HTTPException(status_code=404, detail="Invalid Team Code")
        
    existing_member = db.query(TeamMember).filter(TeamMember.user_id == current_user.id, TeamMember.team_id == team.id).first()
    if not existing_member:
        mid = str(uuid4())
        member = TeamMember(id=mid, user_id=current_user.id, team_id=team.id, role="developer")
        db.add(member)
        db.commit()
    
    return get_team(current_user, db)

@router.get("/team", response_model=TeamOut)
def get_team(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    member = db.query(TeamMember).filter(TeamMember.user_id == current_user.id).first()
    if not member:
        raise HTTPException(status_code=404, detail="User is not in any team")
        
    team = db.query(Team).filter(Team.id == member.team_id).first()
    
    members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    member_details = []
    for m in members:
        u = db.query(User).filter(User.id == m.user_id).first()
        if u:
            member_details.append(TeamMemberOut(user_id=u.id, name=u.name, email=u.email, role=m.role))
            
    return TeamOut(team_id=team.id, name=team.name, team_code=team.team_code, members=member_details)

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong email or password. Try again.")

    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user_id=user.id, name=user.name, email=user.email)

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
