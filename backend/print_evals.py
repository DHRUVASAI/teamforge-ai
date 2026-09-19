import os
import sys
import json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.models.project import Project
from app.models.user_team import MemberSubscription, TeamMember, MemberSkill
from app.services.tool_evaluator_engine import evaluate_tool_for_capability

def print_outputs():
    db = SessionLocal()
    project = db.query(Project).first()
    if not project:
        print("No project found")
        return
        
    print("=== SCENARIO 1: ZERO BUDGET ===")
    project.constraints = ["Strict zero budget only"]
    db.commit()
    print(f"Backend: {evaluate_tool_for_capability(db, project.id, 'Backend API')['winning_tool']}")
    print(f"Frontend: {evaluate_tool_for_capability(db, project.id, 'Frontend UI')['winning_tool']}")
    
    print("\n=== SCENARIO 2: GENEROUS BUDGET + AWS ===")
    project.constraints = []
    member = db.query(TeamMember).first()
    sub = MemberSubscription(member_id=member.id, tool_name="AWS Free Tier", tier="Free")
    db.add(sub)
    db.commit()
    print(f"Backend: {evaluate_tool_for_capability(db, project.id, 'Backend API')['winning_tool']}")
    print(f"Frontend: {evaluate_tool_for_capability(db, project.id, 'Frontend UI')['winning_tool']}")
    
    print("\n=== SCENARIO 3: JS ONLY TEAM, NO AWS ===")
    db.query(MemberSubscription).delete()
    skill = MemberSkill(member_id=member.id, name="JavaScript", level="Pro")
    db.add(skill)
    db.commit()
    print(f"Backend: {evaluate_tool_for_capability(db, project.id, 'Backend API')['winning_tool']}")
    
print_outputs()
