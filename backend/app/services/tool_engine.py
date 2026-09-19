import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.task import Task
from ..models.tool import ToolCatalogEntry, ToolRecommendation
from ..models.user_team import MemberSubscription
from ..schemas.tool import ToolRecommendationResponse, RecommendedToolItem, RejectedToolItem

def initialize_default_catalog(db: Session):
    if db.query(ToolCatalogEntry).count() > 0:
        return
        
    starter_tools = [
        ToolCatalogEntry(
            tool_name="Cursor Pro / Claude Code",
            category="AI Coding Assistant",
            task_types_json=json.dumps(["API development", "Schema design", "Decision logic", "Testing"]),
            skill_level_fit="Beginner-Advanced",
            free_tier="Free tier limited to 50 requests/mo",
            quota_notes="Pro tier has unlimited fast requests + premium model access",
            integration_difficulty="Low",
            best_for="Accelerating full-stack code and schema implementation",
            limitations="Requires careful boundary prompt design to avoid hallucination",
            last_verified="2026-09-15"
        ),
        ToolCatalogEntry(
            tool_name="FastAPI + Pydantic",
            category="Backend Framework",
            task_types_json=json.dumps(["API development", "Decision logic", "Middleware"]),
            skill_level_fit="Beginner-Intermediate",
            free_tier="Open Source / Free",
            quota_notes="Self-hosted",
            integration_difficulty="Low",
            best_for="High-performance async APIs with automatic OpenAPI schema validation",
            limitations="Not an all-in-one monolith framework like Django",
            last_verified="2026-09-15"
        ),
        ToolCatalogEntry(
            tool_name="PostgreSQL + SQLAlchemy",
            category="Database",
            task_types_json=json.dumps(["Schema design", "Data persistence", "Query optimization"]),
            skill_level_fit="Intermediate-Advanced",
            free_tier="Open Source / Free generous cloud tier",
            quota_notes="Standard relational storage",
            integration_difficulty="Medium",
            best_for="Strict relational schema integrity, foreign keys, and ACID compliance",
            limitations="Requires explicit migration management via Alembic",
            last_verified="2026-09-15"
        ),
        ToolCatalogEntry(
            tool_name="GitHub Actions",
            category="CI/CD",
            task_types_json=json.dumps(["Automated testing", "Linting", "Container build"]),
            skill_level_fit="Beginner-Intermediate",
            free_tier="2,000 free build minutes/mo for public/private repos",
            quota_notes="Sufficient for small team development",
            integration_difficulty="Low",
            best_for="Native GitHub repository workflow integration and test automation",
            limitations="Not justified if project has no automated tests written",
            last_verified="2026-09-15"
        ),
        ToolCatalogEntry(
            tool_name="Docker",
            category="Containerization",
            task_types_json=json.dumps(["Packaging", "Environment consistency", "Deployment"]),
            skill_level_fit="Intermediate",
            free_tier="Docker Desktop Free / Engine Free",
            quota_notes="Local and cloud runner compatible",
            integration_difficulty="Medium",
            best_for="Ensuring identical local and staging execution environments",
            limitations="Overkill for simple single-file scripts",
            last_verified="2026-09-15"
        ),
        ToolCatalogEntry(
            tool_name="Postman / Insomnia",
            category="API Testing",
            task_types_json=json.dumps(["API testing", "Contract validation"]),
            skill_level_fit="Beginner-Intermediate",
            free_tier="Free app with unlimited local requests",
            quota_notes="Cloud sync optional",
            integration_difficulty="Low",
            best_for="Rapid interactive validation against OpenAPI contracts",
            limitations="Does not replace automated unit and integration tests",
            last_verified="2026-09-15"
        )
    ]
    
    for t in starter_tools:
        db.add(t)
    db.commit()

def recommend_tools_for_task(db: Session, task_id: str) -> ToolRecommendationResponse:
    initialize_default_catalog(db)
    
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "TASK_NOT_FOUND", "message": "Task not found"}}
        )
        
    # Check assignee active subscriptions
    active_subscriptions = []
    if task.assignment and task.assignment.member:
        active_subscriptions = db.query(MemberSubscription).filter(
            MemberSubscription.member_id == task.assignment.member.id
        ).all()
        
    active_tool_names = [sub.tool_name.lower() for sub in active_subscriptions]
    
    # -------------------------------------------------------------
    # Two-layer Tool Selection Engine (11_TOOL_CATALOG.md & ADR-004)
    # -------------------------------------------------------------
    recommended_tools = []
    rejected_tools = []
    
    # Check if assignee has Cursor Pro / Claude / Copilot active
    has_ai_sub = any("cursor" in name or "claude" in name or "copilot" in name or "chatgpt" in name for name in active_tool_names)
    
    if has_ai_sub:
        recommended_tools.append(RecommendedToolItem(
            name="Cursor Pro / Claude Code",
            category="AI Coding Assistant",
            reasoning="Assignee holds an active AI tool subscription. Recommended for fast implementation and boilerplate scaffolding.",
            is_active_subscription=True,
            details="Active subscription detected on developer profile."
        ))
    else:
        recommended_tools.append(RecommendedToolItem(
            name="Claude Code / Copilot (Free Tier)",
            category="AI Coding Assistant",
            reasoning="Recommended within standard free-tier limits to accelerate development.",
            is_active_subscription=False
        ))
        
    if "Schema" in task.title or "Database" in task.title:
        recommended_tools.append(RecommendedToolItem(
            name="PostgreSQL + SQLAlchemy",
            category="Database & ORM",
            reasoning="Matches the accepted Modular Monolith data architecture with schema isolation.",
            is_active_subscription=False
        ))
        rejected_tools.append(RejectedToolItem(
            tool="MongoDB / Document DB",
            reason_rejected="Task requires relational foreign keys and transaction guarantees."
        ))
    elif "API" in task.title or "Engine" in task.title or "Auth" in task.title:
        recommended_tools.append(RecommendedToolItem(
            name="FastAPI + Pydantic",
            category="Backend Framework",
            reasoning="Provides high performance async REST endpoints with strict automatic OpenAPI type validation.",
            is_active_subscription=False
        ))
        rejected_tools.append(RejectedToolItem(
            tool="Django Full Stack",
            reason_rejected="Heavy built-in templating and admin site are unnecessary for modular micro-APIs."
        ))
    elif "Sync" in task.title or "README" in task.title:
        recommended_tools.append(RecommendedToolItem(
            name="GitHub Actions & Markdown",
            category="DevOps & Documentation",
            reasoning="Standard automated pipeline for syncing repository artifacts and continuous integration.",
            is_active_subscription=False
        ))
        
    # Save recommendation record
    rec = db.query(ToolRecommendation).filter(ToolRecommendation.task_id == task_id).first()
    if rec:
        rec.recommended_tools = [t.model_dump() for t in recommended_tools]
        rec.rejected_tools = [t.model_dump() for t in rejected_tools]
    else:
        rec = ToolRecommendation(
            task_id=task_id,
            recommended_tools_json=json.dumps([t.model_dump() for t in recommended_tools]),
            rejected_tools_json=json.dumps([t.model_dump() for t in rejected_tools])
        )
        db.add(rec)
    db.commit()
    
    return ToolRecommendationResponse(
        task_id=task_id,
        recommended_tools=recommended_tools,
        rejected_tools=rejected_tools
    )
