from sqlalchemy.orm import Session
from ..models.project import Project
from ..models.recommendation import ArchitectureRecommendation
from ..models.user_team import TeamMember, User
from ..schemas.friendly import (
    FriendlyGamePlanResponse, FriendlyTeammateCard, ELI5ToolGuide, FriendlyDailyRoadmap
)
from ..core import llm_client
from ..prompts.architect_prompt import FRIENDLY_ELI5_PROMPT
import json
import logging

logger = logging.getLogger(__name__)

def generate_eli5_guide(db: Session, project_id: str) -> str:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError("Project not found")
        
    arch_recs = db.query(ArchitectureRecommendation).filter(ArchitectureRecommendation.project_id == project_id).all()
    
    arch_data = [
        {"component": rec.component_name, "tool": rec.recommended_tool, "reason": rec.reasoning}
        for rec in arch_recs
    ]
    
    user_prompt = f"""
    Translate this architecture JSON into a highly engaging, non-technical ELI5 markdown document for a Gen-Z builder.
    
    Architecture JSON:
    {json.dumps(arch_data, indent=2)}
    
    Focus on making it fun to read. Use emojis.
    """
    
    try:
        markdown_guide = llm_client.generate_text(system_prompt=FRIENDLY_ELI5_PROMPT, user_prompt=user_prompt, layer="mentor")
        return markdown_guide
    except Exception:
        logger.exception("LLM text generation failed for ELI5 guide")
        return "# Oops! 😅\n\nLooks like the AI engine had a hiccup and is currently unavailable. Check back later!"

def generate_friendly_game_plan(db: Session, project_id: str) -> FriendlyGamePlanResponse:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError("Project not found")

    members = db.query(TeamMember).filter(TeamMember.team_id == project.team_id).all()

    team_cards = []
    for m in members:
        user = db.query(User).filter(User.id == m.user_id).first()
        name = user.name if user else "Teammate"
        
        if m.role == "team_leader":
            title = "The System Architect & Project Lead"
            emoji = "🚀"
            tool_name = "FastAPI & System Specs"
            instructions = [
                "1. Clone repository and establish database schemas.",
                "2. Define core REST endpoints for authentication and business logic.",
                "3. Coordinate teammate PR merges and unblock dependencies."
            ]
        elif m.role == "ai_assisted":
            title = "The AI & Rapid Prototyper"
            emoji = "🤖"
            tool_name = "Cursor / Claude Pro"
            instructions = [
                "1. Initialize AI copilot prompts and configure rule files.",
                "2. Build primary API integration modules rapidly.",
                "3. Run automated tests and patch edge cases."
            ]
        else:
            title = "The Experience & UI Engineer"
            emoji = "🎨"
            tool_name = "Next.js & Tailwind CSS"
            instructions = [
                "1. Scaffold the interactive component library.",
                "2. Connect pages to backend API contracts.",
                "3. Polish animations, typography, and responsive layouts."
            ]

        tool_guide = ELI5ToolGuide(
            tool_name=tool_name,
            category="Core Stack",
            why_this_tool=f"Enables {name} to ship production features fast.",
            is_active_subscription=len(m.subscriptions) > 0,
            step_by_step_instructions=instructions,
            quick_starter_prompt=f"Act as a senior mentor helping {name} build {project.name}."
        )

        team_cards.append(FriendlyTeammateCard(
            member_id=m.id,
            user_id=m.user_id,
            name=name,
            friendly_role_title=title,
            role_emoji=emoji,
            what_you_are_building=f"Core architecture and features for {project.name}",
            days_schedule={
                "Day 1": "Scaffold and connect APIs",
                "Day 2": "Implement primary user flow",
                "Day 3": "Integration testing and demo polish"
            },
            primary_tool_guide=tool_guide,
            active_subscriptions_used=[s.tool_name for s in m.subscriptions]
        ))

    if not team_cards:
        team_cards.append(FriendlyTeammateCard(
            member_id="default-lead",
            user_id="default-user",
            name="Lead Builder",
            friendly_role_title="The Full-Stack Captain",
            role_emoji="⚡",
            what_you_are_building="Full application prototype",
            days_schedule={"Day 1": "Setup", "Day 2": "Build", "Day 3": "Deploy"},
            primary_tool_guide=ELI5ToolGuide(
                tool_name="Next.js & FastAPI",
                category="Full-Stack",
                why_this_tool="Fastest path to working prototype.",
                is_active_subscription=False,
                step_by_step_instructions=[
                    "1. Setup environment.",
                    "2. Build APIs and UI.",
                    "3. Deploy prototype."
                ]
            ),
            active_subscriptions_used=[]
        ))

    daily_roadmap = [
        FriendlyDailyRoadmap(
            day_span="Days 1-2",
            milestone_goal="Foundation, Data Schema, and API Skeleton",
            who_is_doing_what=["Lead sets up repo and schema", "Developers connect initial endpoints"],
            ready_to_demo_check="Health check API returns 200 OK with test data."
        ),
        FriendlyDailyRoadmap(
            day_span="Days 3-4",
            milestone_goal="Core Business Logic & Interactive Screens",
            who_is_doing_what=["Team builds primary user journeys", "AI modules hooked up"],
            ready_to_demo_check="End-to-end user transaction succeeds without mock data."
        ),
        FriendlyDailyRoadmap(
            day_span="Days 5-6",
            milestone_goal="Hardening, Demo Polish, and Deployment",
            who_is_doing_what=["SRE & QA testing", "Recording demo video and deploying to production"],
            ready_to_demo_check="Live production URL accessible with zero downtime."
        )
    ]

    return FriendlyGamePlanResponse(
        project_id=project.id,
        project_name=project.name,
        time_budget_summary=f"{project.time_budget_value} {project.time_budget_unit}",
        plain_english_summary=f"A fast, high-impact plan to build '{project.name}' within your time budget.",
        team_cards=team_cards,
        daily_roadmap=daily_roadmap,
        hackathon_winning_tips=[
            "Prioritize the core 2-minute demo flow above edge cases.",
            "Make sure your elevator pitch clearly communicates the problem before jumping to tech.",
            "Record a backup video of your demo in case of live network hiccups."
        ]
    )
