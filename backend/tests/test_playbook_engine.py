import pytest
from unittest.mock import patch
from app.core.database import SessionLocal, Base, engine
from app.models import playbook
from app.models.user_team import User, Team, TeamMember, MemberSubscription
from app.models.project import Project
from app.services import playbook_engine
from uuid import uuid4

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()
    
def setup_test_data(db):
    db.query(MemberSubscription).delete()
    db.query(TeamMember).delete()
    db.query(Project).delete()
    db.query(Team).delete()
    db.query(User).delete()
    db.query(playbook.ProjectPlaybook).delete()
    db.commit()
    
    uid = str(uuid4())
    user = User(id=uid, email="test@demo.com", hashed_password="hash", name="Test Dev")
    db.add(user)
    
    tid = str(uuid4())
    team = Team(id=tid, name="Test Team", team_code="TEST-1")
    db.add(team)
    
    mid = str(uuid4())
    member = TeamMember(id=mid, user_id=uid, team_id=tid, role="team_leader")
    db.add(member)
    
    pid = str(uuid4())
    project = Project(id=pid, team_id=tid, name="Test App", problem_statement="Audio", idea="App")
    db.add(project)
    db.commit()
    
    return pid

def mock_generate_json_success(system_prompt, user_prompt, **kwargs):
    if "Evaluate tools for the capability" in user_prompt:
        return {
            "winning_tool": "Mock Winning Tool",
            "winning_category": "Mock Category",
            "rationale": "Mock Rationale",
            "options_matrix": []
        }
    else:
        return {
            "stages": [
                {
                    "name": "Mock Frontend Stage",
                    "description": "Building frontend",
                    "steps": [
                        {
                            "instruction": "Do something",
                            "ai_prompt": "Mock prompt",
                            "context_files": ["Mock file"]
                        }
                    ]
                }
            ]
        }

@patch('app.core.llm_client.generate_json', side_effect=mock_generate_json_success)
def test_playbook_generation_success(mock_llm, db):
    pid = setup_test_data(db)
    pb = playbook_engine.generate_playbook(db, pid)
    
    assert len(pb.evaluations) == 3
    for eval in pb.evaluations:
        assert eval.is_fallback == False
        assert eval.winning_tool == "Mock Winning Tool"
        
    assert len(pb.stages) == 1
    assert pb.stages[0].name == "Mock Frontend Stage"

@patch('app.core.llm_client.generate_json', side_effect=Exception("Mock LLM Failure"))
def test_playbook_generation_fallback(mock_llm, db):
    pid = setup_test_data(db)
    pb = playbook_engine.generate_playbook(db, pid)
    
    assert len(pb.evaluations) == 3
    for eval in pb.evaluations:
        assert eval.is_fallback == True
        assert eval.winning_tool == "Standard Default Framework"
        
    assert len(pb.stages) == 1
    assert pb.stages[0].name == "Fallback Playbook"
