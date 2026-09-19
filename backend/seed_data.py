import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.models import (
    user_team, project, recommendation, task, risk, tool, mentor, delivery
)
from app.schemas.user_team import UserRegister, TeamCreate, TeamMemberCreate, MemberSkillSchema, MemberSubscriptionSchema
from app.schemas.project import ProjectCreate, TimeBudgetSchema
from app.schemas.recommendation import ArchitectureAcceptRequest
from app.services import (
    auth_team_service, project_service, sdlc_engine, arch_engine,
    task_engine, tool_engine, risk_engine, delivery_engine, friendly_service
)

def seed():
    print("[+] Initializing database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("[+] Creating seed users...")
        lead = auth_team_service.register_user(db, UserRegister(
            name="Sarah Connor",
            email="sarah@teamforge.demo",
            password="password123"
        ))
        
        dev_ai = auth_team_service.register_user(db, UserRegister(
            name="Alex Rivera",
            email="alex@teamforge.demo",
            password="password123"
        ))
        
        dev_junior = auth_team_service.register_user(db, UserRegister(
            name="Jordan Lee",
            email="jordan@teamforge.demo",
            password="password123"
        ))
        
        print("[+] Creating team 'Apex Innovators'...")
        team = auth_team_service.create_team(db, TeamCreate(name="Apex Innovators"), creator_user_id=lead.id)
        
        # Add Alex with AI subscriptions
        auth_team_service.add_team_member(db, team.id, TeamMemberCreate(
            user_id=dev_ai.id,
            role="ai_assisted",
            skills=[
                MemberSkillSchema(name="Python / FastAPI", level="Advanced"),
                MemberSkillSchema(name="React / TypeScript", level="Intermediate"),
                MemberSkillSchema(name="LLM Prompt Engineering", level="Advanced")
            ],
            subscriptions=[
                MemberSubscriptionSchema(tool_name="Cursor Pro", tier="Pro", credits="Unlimited"),
                MemberSubscriptionSchema(tool_name="Claude 3.7 Sonnet (Anthropic API)", tier="Pro", credits="$50 Credits")
            ]
        ))
        
        # Add Jordan (Junior developer)
        auth_team_service.add_team_member(db, team.id, TeamMemberCreate(
            user_id=dev_junior.id,
            role="early_career",
            skills=[
                MemberSkillSchema(name="Python", level="Intermediate"),
                MemberSkillSchema(name="SQL & Schemas", level="Beginner"),
                MemberSkillSchema(name="Documentation & Testing", level="Intermediate")
            ],
            subscriptions=[
                MemberSubscriptionSchema(tool_name="GitHub Copilot", tier="Free", credits=None)
            ]
        ))
        
        print("[+] Creating project 'Autonomous Incident Response & Triaging Engine'...")
        proj = project_service.create_project(db, ProjectCreate(
            team_id=team.id,
            name="Autonomous Incident Response & Triaging Engine",
            problem_statement="Engineering on-call teams are overwhelmed with duplicate alerts, lack of immediate root-cause context, and manual task assignment during production outages.",
            idea="An autonomous agentic platform that aggregates alert streams, pinpoints affected microservices, auto-generates root-cause hypotheses, and assigns remediation workstreams to the on-call engineer.",
            time_budget=TimeBudgetSchema(value=48, unit="hours"),
            deliverable_type="prototype",
            constraints=["PostgreSQL relational storage", "FastAPI async REST endpoints", "Zero-ops single package deployment"],
            mandatory_platforms=["Vercel Edge", "Twilio Alerts"]
        ))
        
        print("[+] Running Problem Statement & Feasibility Analysis...")
        feasibility = project_service.analyze_project_feasibility(db, proj.id)
        print(f"    Verdict: {feasibility.feasibility.verdict} (Score: {feasibility.feasibility.score}/10)")
        
        print("[+] Running SDLC Decision Engine...")
        sdlc = sdlc_engine.recommend_sdlc_model(db, proj.id)
        print(f"    Recommended Model: {sdlc.recommended_model}")
        
        print("[+] Running Architecture Decision Engine...")
        arch = arch_engine.recommend_architecture(db, proj.id)
        print(f"    Recommended Tier: {arch.tier}")
        
        print("[+] Project Lead Accepting Architecture Recommendation...")
        arch_engine.accept_architecture(db, proj.id, arch.id)
        
        print("[+] Decomposing Architecture into Task DAG...")
        task_res = task_engine.decompose_tasks(db, proj.id)
        print(f"    Decomposed {len(task_res.tasks)} tasks. Bottlenecks identified: {len(task_res.bottlenecks)}")
        
        print("[+] Initializing Tool Catalog and Recommendations...")
        tool_engine.initialize_default_catalog(db)
        if task_res.tasks:
            sample_task = task_res.tasks[0]
            tool_rec = tool_engine.recommend_tools_for_task(db, sample_task.id)
            print(f"    Recommended tools for '{sample_task.title}': {[t.name for t in tool_rec.recommended_tools]}")
            
        print("[+] Evaluating Risk Matrix...")
        risks = risk_engine.evaluate_project_risks(db, proj.id)
        print(f"    Identified {len(risks)} project risks.")
        
        print("[+] Generating Delivery Artifacts (Architecture README & Pitch Deck)...")
        readme = delivery_engine.generate_architecture_readme(db, proj.id)
        pitch = delivery_engine.generate_pitch_deck_outline(db, proj.id)
        gh = delivery_engine.sync_tasks_to_github(db, proj.id)
        print(f"    Synced {len(gh['synced_issues'])} tasks to GitHub repo: {gh['repo_url']}")
        print(f"    Generated README: {readme.title}")
        print(f"    Generated Pitch Deck: {pitch.title}")
        
        friendly_plan = friendly_service.generate_friendly_game_plan(db, proj.id)
        print(f"[+] Generated Friendly Game Plan with {len(friendly_plan.team_cards)} Teammate Role Cards.")
        
        print("\n========================================================")
        print(" SUCCESS! TeamForge AI Database Seeded Successfully.")
        print(" Seed Project ID:", proj.id)
        print(" Seed Team ID:", team.id)
        print(" Seed Team Invite Code:", team.team_code)
        print(" Login Credentials:")
        print("   - Sarah (Lead): sarah@teamforge.demo / password123")
        print("   - Alex (AI Dev): alex@teamforge.demo / password123")
        print("   - Jordan (Junior Dev): jordan@teamforge.demo / password123")
        print("========================================================")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed()
