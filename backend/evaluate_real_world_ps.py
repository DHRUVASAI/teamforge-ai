import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import json
from sqlalchemy.orm import Session
from app.core.database import engine, Base, SessionLocal
from app.models.user_team import User, Team, TeamMember, MemberSkill
from app.schemas.ps_analyzer import CandidatePSInput, PSEvaluateRequest
from app.services.ps_analyzer_engine import evaluate_multiple_problem_statements

# 1. Setup Database
Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Clean up existing data for clean run
db.query(MemberSkill).delete()
db.query(TeamMember).delete()
db.query(Team).delete()
db.query(User).delete()
db.commit()

# 2. Create a standard team with NO paid subscriptions
lead = User(name="Alice", email="alice_free@test.com", hashed_password="hash")
dev1 = User(name="Bob", email="bob_free@test.com", hashed_password="hash")
dev2 = User(name="Charlie", email="charlie_free@test.com", hashed_password="hash")
db.add_all([lead, dev1, dev2])
db.commit()

team = Team(name="Free Tier Innovators", team_code="FREE-123")
db.add(team)
db.commit()

# Add members with standard skills, but no subscriptions
m_lead = TeamMember(user_id=lead.id, team_id=team.id, role="team_leader")
m_dev1 = TeamMember(user_id=dev1.id, team_id=team.id, role="developer")
m_dev2 = TeamMember(user_id=dev2.id, team_id=team.id, role="developer")
db.add_all([m_lead, m_dev1, m_dev2])
db.commit()

# Add skills (Frontend, Backend, Database)
skills = [
    MemberSkill(member_id=m_lead.id, name="Python", level="Advanced"),
    MemberSkill(member_id=m_lead.id, name="FastAPI", level="Advanced"),
    MemberSkill(member_id=m_dev1.id, name="React", level="Intermediate"),
    MemberSkill(member_id=m_dev1.id, name="Tailwind", level="Intermediate"),
    MemberSkill(member_id=m_dev2.id, name="SQL", level="Advanced"),
    MemberSkill(member_id=m_dev2.id, name="Node", level="Intermediate"),
]
db.add_all(skills)
db.commit()

# 3. Define 6 Real-World Problem Statements
ps1 = CandidatePSInput(
    id="ps-common-1",
    title="Campus Event Booking Platform",
    problem_statement="Students struggle to find and book campus events.",
    proposed_idea="A centralized React frontend and FastAPI backend where students can browse events and book tickets with QR codes.",
    target_sponsor_track="Stripe"
)

ps2 = CandidatePSInput(
    id="ps-common-2",
    title="AI Syllabus Chatbot",
    problem_statement="Students spend too much time reading long PDF syllabuses.",
    proposed_idea="Upload PDF syllabuses and use a basic AI chatbot to answer questions.",
    target_sponsor_track="Gemini"
)

ps3 = CandidatePSInput(
    id="ps-common-3",
    title="Student Task Manager Dashboard",
    problem_statement="Students need a way to organize their homework assignments.",
    proposed_idea="A simple full-stack task manager with basic authentication and a clean UI.",
    target_sponsor_track=None
)

ps4 = CandidatePSInput(
    id="ps-complex-1",
    title="Custom Layer-1 Blockchain Network",
    problem_statement="Current blockchains are too slow for micro-transactions.",
    proposed_idea="Build a custom decentralized blockchain network from scratch using a novel consensus algorithm in C++.",
    target_sponsor_track=None
)

ps5 = CandidatePSInput(
    id="ps-complex-2",
    title="Autonomous Drone Delivery Controller",
    problem_statement="Packages take too long to arrive on campus.",
    proposed_idea="Develop real-time hardware control software for an IoT autonomous drone swarm with custom machine vision models.",
    target_sponsor_track=None
)

ps6 = CandidatePSInput(
    id="ps-complex-3",
    title="Custom Zero-Knowledge Proof Identity Protocol",
    problem_statement="Digital identities lack total cryptographic privacy.",
    proposed_idea="Invent and implement a novel zero-knowledge cryptography protocol for decentralized identity verification.",
    target_sponsor_track="Web3"
)

# 4. Evaluate using the engine
request = PSEvaluateRequest(
    team_id=team.id,
    time_budget_hours=48,
    candidate_problem_statements=[ps1, ps2, ps3, ps4, ps5, ps6]
)

response = evaluate_multiple_problem_statements(db, request)

# 5. Format Output
output_lines = [
    "# Real-World Problem Statement Evaluation Results\n",
    "> **Scenario Profile:** 3 Developers (Frontend, Backend, DB skills). **Zero Paid Tool Subscriptions.**",
    f"> **Time Budget:** {response.time_budget_hours} hours.\n",
    "## Engine Summary Recommendation",
    f"> {response.summary_recommendation}\n",
    "## Full Ranking Breakdown\n"
]

for item in response.ranked_evaluations:
    scores = item.scores
    output_lines.extend([
        f"### Rank #{item.rank}: {item.title} [{item.verdict}]",
        f"**Selection Status:** {item.selection_status.upper()}",
        f"**Overall Score:** {scores.overall_score}/10",
        f"**Formula:** {scores.overall_score_calculation}\n",
        f"**Why Pick / Rationale:** {item.why_pick_reason}\n",
        "**Score Breakdown:**",
        f"- **Skill Fit (30%):** {scores.skill_fit_score}/10 -> {scores.skill_fit_explanation}",
        f"- **Time Feasibility (35%):** {scores.time_feasibility_score}/10 -> {scores.time_feasibility_explanation}",
        f"- **Demo Impact (25%):** {scores.demo_impact_score}/10 -> {scores.demo_impact_explanation}",
        f"- **Sponsor Fit (10%):** {scores.sponsor_fit_score}/10 -> {scores.sponsor_fit_explanation}\n",
        "**Risks & Drawbacks:**"
    ])
    if item.risks_and_drawbacks:
        for risk in item.risks_and_drawbacks:
            output_lines.append(f"- {risk}")
    else:
        output_lines.append("- None")
    output_lines.append("\n---\n")

output_file_path = "C:/Users/dhruv/.gemini/antigravity/brain/0d67913c-7f70-4972-8aac-ad238bf4bd01/real_world_ps_evaluation_results.md"
with open(output_file_path, "w", encoding="utf-8") as f:
    f.write("\n".join(output_lines))

print(f"Evaluation complete! Results saved to {output_file_path}")
db.close()
