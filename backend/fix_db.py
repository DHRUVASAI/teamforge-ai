from app.core.database import SessionLocal
from app.models.user_team import User, Team, TeamMember
from uuid import uuid4

def fix_orphan_users():
    db = SessionLocal()
    users = db.query(User).all()
    fixed = 0
    for u in users:
        member = db.query(TeamMember).filter(TeamMember.user_id == u.id).first()
        if not member:
            print(f"Fixing orphan user: {u.email}")
            tid = str(uuid4())
            team = Team(id=tid, name=f"{u.name}'s Squad", team_code=f"SQUAD-{u.id[:6].upper()}")
            db.add(team)
            
            mid = str(uuid4())
            new_member = TeamMember(id=mid, user_id=u.id, team_id=tid, role="team_leader")
            db.add(new_member)
            fixed += 1
    
    db.commit()
    db.close()
    print(f"Fixed {fixed} users.")

if __name__ == "__main__":
    fix_orphan_users()
