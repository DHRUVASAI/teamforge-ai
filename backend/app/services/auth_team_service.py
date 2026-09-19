from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.user_team import User, Team, TeamMember, MemberSkill, MemberSubscription, generate_team_code
from ..models.project import Project
from ..models.task import Task
from ..schemas.user_team import (
    UserRegister, UserLogin, TeamCreate, TeamMemberCreate, TeamMemberUpdate,
    TeamJoinRequest, TeamHubOut, TeamHubMemberStatus
)
from ..core.security import hash_password, verify_password, create_access_token

def register_user(db: Session, data: UserRegister) -> User:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "EMAIL_EXISTS", "message": "Email already registered"}}
        )
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, data: UserLogin) -> dict:
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_CREDENTIALS", "message": "Invalid email or password"}}
        )
    token = create_access_token(subject=user.id)
    return {
        "user_id": user.id,
        "token": token,
        "name": user.name,
        "email": user.email
    }

def create_team(db: Session, data: TeamCreate, creator_user_id: str) -> Team:
    code = generate_team_code()
    team = Team(name=data.name, team_code=code)
    db.add(team)
    db.commit()
    db.refresh(team)
    
    # Auto-add creator as team_leader
    leader = TeamMember(
        team_id=team.id,
        user_id=creator_user_id,
        role="team_leader"
    )
    db.add(leader)
    db.commit()
    db.refresh(team)
    return team

def join_team_by_code(db: Session, req: TeamJoinRequest, user_id: str) -> TeamMember:
    team = db.query(Team).filter(Team.team_code == req.team_code.strip().upper()).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "INVALID_TEAM_CODE", "message": f"No team found with invite code '{req.team_code}'"}}
        )
        
    existing = db.query(TeamMember).filter(TeamMember.team_id == team.id, TeamMember.user_id == user_id).first()
    if existing:
        return existing
        
    member = TeamMember(
        team_id=team.id,
        user_id=user_id,
        role=req.role
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    
    for s in req.skills:
        db.add(MemberSkill(member_id=member.id, name=s.name, level=s.level))
    for sub in req.subscriptions:
        db.add(MemberSubscription(member_id=member.id, tool_name=sub.tool_name, tier=sub.tier, credits=sub.credits))
        
    db.commit()
    db.refresh(member)
    return member

def add_team_member(db: Session, team_id: str, data: TeamMemberCreate) -> TeamMember:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "TEAM_NOT_FOUND", "message": "Team does not exist"}}
        )
    
    existing = db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == data.user_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "MEMBER_EXISTS", "message": "User is already a member of this team"}}
        )
    
    member = TeamMember(
        team_id=team_id,
        user_id=data.user_id,
        role=data.role
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    
    for s in data.skills:
        skill = MemberSkill(member_id=member.id, name=s.name, level=s.level)
        db.add(skill)
        
    for sub in data.subscriptions:
        subscription = MemberSubscription(
            member_id=member.id,
            tool_name=sub.tool_name,
            tier=sub.tier,
            credits=sub.credits
        )
        db.add(subscription)
        
    db.commit()
    db.refresh(member)
    return member

def update_team_member(db: Session, team_id: str, member_id: str, data: TeamMemberUpdate) -> TeamMember:
    member = db.query(TeamMember).filter(TeamMember.id == member_id, TeamMember.team_id == team_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "MEMBER_NOT_FOUND", "message": "Member does not exist in team"}}
        )
    
    if data.role:
        member.role = data.role
        
    if data.skills is not None:
        db.query(MemberSkill).filter(MemberSkill.member_id == member_id).delete()
        for s in data.skills:
            db.add(MemberSkill(member_id=member_id, name=s.name, level=s.level))
            
    if data.subscriptions is not None:
        db.query(MemberSubscription).filter(MemberSubscription.member_id == member_id).delete()
        for sub in data.subscriptions:
            db.add(MemberSubscription(
                member_id=member_id,
                tool_name=sub.tool_name,
                tier=sub.tier,
                credits=sub.credits
            ))
            
    db.commit()
    db.refresh(member)
    return member

def get_team_with_members(db: Session, team_id: str) -> dict:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "TEAM_NOT_FOUND", "message": "Team not found"}}
        )
    
    members_out = []
    for m in team.members:
        user = db.query(User).filter(User.id == m.user_id).first()
        members_out.append({
            "member_id": m.id,
            "team_id": m.team_id,
            "user_id": m.user_id,
            "name": user.name if user else "Unknown",
            "email": user.email if user else "",
            "role": m.role,
            "skills": [{"name": s.name, "level": s.level} for s in m.skills],
            "subscriptions": [{"tool_name": sub.tool_name, "tier": sub.tier, "credits": sub.credits} for sub in m.subscriptions]
        })
    
    return {
        "team_id": team.id,
        "name": team.name,
        "team_code": team.team_code or "TEAM-0000",
        "created_at": team.created_at,
        "members": members_out
    }

def get_team_hub_status(db: Session, project_id: str) -> TeamHubOut:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "PROJECT_NOT_FOUND", "message": "Project not found"}}
        )
        
    team = db.query(Team).filter(Team.id == project.team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "TEAM_NOT_FOUND", "message": "Team not found"}}
        )
        
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    total_tasks = len(tasks)
    done_tasks = len([t for t in tasks if t.status == "done"])
    
    members_status = []
    for m in team.members:
        user = m.user
        member_tasks = [t for t in tasks if t.assignment and t.assignment.member_id == m.id]
        m_done = len([t for t in member_tasks if t.status == "done"])
        
        # Check if any task assigned to this member has incomplete dependencies
        is_blocked = False
        blocked_by = None
        for t in member_tasks:
            if t.status in ["todo", "in_progress"] and t.depends_on:
                incomplete_deps = db.query(Task).filter(Task.id.in_(t.depends_on), Task.status != "done").all()
                if incomplete_deps:
                    is_blocked = True
                    dep_task = incomplete_deps[0]
                    assignee_name = "Unassigned"
                    if dep_task.assignment:
                        assignee_member = db.query(TeamMember).filter(TeamMember.id == dep_task.assignment.member_id).first()
                        if assignee_member and assignee_member.user:
                            assignee_name = assignee_member.user.name
                    blocked_by = f"Waiting on {assignee_name} to finish '{dep_task.title}'"
                    break
                    
        active_subs = [s.tool_name for s in m.subscriptions]
        
        members_status.append(TeamHubMemberStatus(
            member_id=m.id,
            user_id=m.user_id,
            name=user.name if user else "Teammate",
            role=m.role,
            active_subscriptions=active_subs,
            current_tasks_count=len(member_tasks),
            tasks_done_count=m_done,
            is_blocked=is_blocked,
            blocked_by_task=blocked_by
        ))
        
    return TeamHubOut(
        team_id=team.id,
        team_name=team.name,
        team_code=team.team_code or "TEAM-0000",
        project_id=project.id,
        project_name=project.name,
        total_members=len(team.members),
        total_tasks=total_tasks,
        completed_tasks=done_tasks,
        active_bottlenecks_count=len([ms for ms in members_status if ms.is_blocked]),
        members_status=members_status
    )
