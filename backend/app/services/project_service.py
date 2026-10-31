import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.project import Project
from ..models.user_team import Team, TeamMember
from ..schemas.project import ProjectCreate, ProjectUpdate, FeasibilityResponse, CapabilitySchema, AmbiguitySchema, FeasibilityDetails

def create_project(db: Session, data: ProjectCreate) -> Project:
    team = db.query(Team).filter(Team.id == data.team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team does not exist"
        )
    
    project = Project(
        team_id=data.team_id,
        name=data.name,
        problem_statement=data.problem_statement,
        idea=data.idea,
        time_budget_value=data.time_budget.value,
        time_budget_unit=data.time_budget.unit,
        deliverable_type=data.deliverable_type,
        constraints_json=json.dumps(data.constraints),
        mandatory_platforms_json=json.dumps(data.mandatory_platforms),
        status="draft"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

def update_project(db: Session, project_id: str, data: ProjectUpdate) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if data.name is not None:
        project.name = data.name
    if data.problem_statement is not None:
        project.problem_statement = data.problem_statement
    if data.idea is not None:
        project.idea = data.idea
    if data.time_budget is not None:
        project.time_budget_value = data.time_budget.value
        project.time_budget_unit = data.time_budget.unit
    if data.deliverable_type is not None:
        project.deliverable_type = data.deliverable_type
    if data.constraints is not None:
        project.constraints_json = json.dumps(data.constraints)
    if data.mandatory_platforms is not None:
        project.mandatory_platforms_json = json.dumps(data.mandatory_platforms)
    db.commit()
    db.refresh(project)
    return project

def get_project(db: Session, project_id: str) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project

def analyze_project_feasibility(db: Session, project_id: str) -> FeasibilityResponse:
    project = get_project(db, project_id)
    team_members = db.query(TeamMember).filter(TeamMember.team_id == project.team_id).all()
    team_size = max(1, len(team_members))
    
    # Calculate available capacity hours
    unit_multiplier = {
        "hours": 1,
        "days": 8,
        "weeks": 40,
        "months": 160
    }.get(project.time_budget_unit.lower(), 1)
    
    total_time_hours = project.time_budget_value * unit_multiplier
    total_capacity_hours = team_size * total_time_hours
    
    # Extract capabilities based on problem statement and idea
    text_corpus = f"{project.problem_statement} {project.idea}".lower()
    capabilities = [
        CapabilitySchema(id="CAP-01", name="Core User & Team Management", complexity="Low"),
        CapabilitySchema(id="CAP-02", name="Problem Statement Analysis & Feasibility Engine", complexity="Medium"),
        CapabilitySchema(id="CAP-03", name="SDLC & Architecture Decision Engine", complexity="Medium"),
        CapabilitySchema(id="CAP-04", name="Autonomous Task Decomposition & Workstream DAG", complexity="High"),
        CapabilitySchema(id="CAP-05", name="Skill-Aware Task Assignment & Tool Recommender", complexity="Medium"),
        CapabilitySchema(id="CAP-06", name="Risk Register & Real-Time Mitigation System", complexity="Medium"),
        CapabilitySchema(id="CAP-07", name="AI Engineering Mentor & Explainability Layer", complexity="High")
    ]
    
    if "github" in text_corpus or "ci" in text_corpus or "devops" in text_corpus:
        capabilities.append(CapabilitySchema(id="CAP-08", name="DevOps & Source Control Integration", complexity="Medium"))
    if "doc" in text_corpus or "presentation" in text_corpus or "pitch" in text_corpus:
        capabilities.append(CapabilitySchema(id="CAP-09", name="Automated Architecture Documentation & Pitch Generator", complexity="Low"))

    complexity_hours = {
        "Low": 4,
        "Medium": 8,
        "High": 14
    }
    
    total_estimated_work_hours = sum(complexity_hours[c.complexity] for c in capabilities)
    
    # Feasibility evaluation
    if total_estimated_work_hours <= total_capacity_hours * 0.85:
        verdict = "feasible"
        score = 9.0
        reasoning = f"Project scope is well-sized for {team_size} developer(s) within the {project.time_budget_value} {project.time_budget_unit} window."
        reductions = []
    elif total_estimated_work_hours <= total_capacity_hours * 1.2:
        verdict = "feasible_with_adjustments"
        score = 7.2
        reasoning = f"Scope fits available capacity with slight risk. Highly recommended to defer non-essential integrations to a later phase."
        reductions = [
            "Defer third-party CI/CD automation to Phase 3",
            "Focus on core Modular Monolith before multi-cloud deployment"
        ]
    else:
        verdict = "scope_exceeded"
        score = 4.5
        reasoning = f"Estimated workload ({total_estimated_work_hours}h) exceeds realistic capacity ({total_capacity_hours}h) by over 20%."
        reductions = [
            "Cut advanced distributed orchestration in Phase 1",
            "Limit scope to MVP core workflows (Requirements -> Architecture -> Tasks)"
        ]
        
    # Ambiguity check
    ambiguities = []
    if len(project.problem_statement.strip()) < 50:
        ambiguities.append(AmbiguitySchema(
            id="AMB-01",
            question="The problem statement is very concise. What specific user pain point should be prioritized?",
            suggested_answer="Focus on single-developer bottlenecks and clear team workstream separation."
        ))
    if not project.constraints:
        ambiguities.append(AmbiguitySchema(
            id="AMB-02",
            question="No explicit technical constraints were provided. Is a relational PostgreSQL storage model preferred?",
            suggested_answer="Yes, PostgreSQL with standard REST API is recommended."
        ))
        
    project.status = "analyzed"
    db.commit()
    
    return FeasibilityResponse(
        capabilities=capabilities,
        ambiguities=ambiguities,
        feasibility=FeasibilityDetails(
            verdict=verdict,
            score=score,
            total_estimated_hours=total_estimated_work_hours,
            available_team_capacity_hours=total_capacity_hours,
            reasoning=reasoning,
            proposed_scope_reduction=reductions
        )
    )


def create_demo_project_for_team(db, team_id: str):
    import json
    from uuid import uuid4
    from app.models.project import Project
    from app.models.playbook import ProjectPlaybook, PlaybookStage, PlaybookStep, ToolEvaluation

    pid = str(uuid4())
    proj = Project(
        id=pid,
        team_id=team_id,
        name="AI Incident Triaging & Self-Healing Agent",
        problem_statement="On-call engineering squads spend 80% of outages manually digging through microservice logs, parsing alerts, and identifying regressions after continuous deployments.",
        idea="An autonomous triage copilot integrated with Keploy and FastAPI that correlates real-time trace telemetry, auto-runs regression test replays, and drafts PR fixes for on-call teams.",
        time_budget_value=48,
        time_budget_unit="hours",
        deliverable_type="prototype",
        constraints_json=json.dumps(["PostgreSQL", "FastAPI", "Next.js", "Keploy eBPF", "Docker"]),
        mandatory_platforms_json=json.dumps(["Vercel", "AWS RDS"]),
        status="active"
    )
    db.add(proj)
    db.commit()

    pbid = str(uuid4())
    pb = ProjectPlaybook(
        id=pbid,
        project_id=pid,
        generation_status="SUCCESS",
        provider_used="Groq / llama-3.3-70b-versatile",
        latency_ms=1420
    )
    db.add(pb)

    evals = [
        ("Frontend & Dashboards", "Next.js 15 (App Router)", "Production Standard", "Fastest server rendering with React 19 streaming for live console telemetry."),
        ("Backend API & Engine", "FastAPI (Python 3.12)", "Async Microframework", "Native asynchronous request handling with high throughput for socket event listeners."),
        ("Database & Trace Store", "Supabase (PostgreSQL)", "Cloud-Native SQL", "Instant relational schema with pgvector capabilities for log similarity search."),
        ("Automated Regression Testing", "Keploy Test Harness", "Zero-Code Testing", "Captures real network traffic and virtually mocks PostgreSQL and Redis for instant regression tests.")
    ]
    for cap, tool, cat, rat in evals:
        db.add(ToolEvaluation(
            playbook_id=pbid,
            capability=cap,
            winning_tool=tool,
            winning_category=cat,
            rationale=rat,
            evaluation_matrix_json=[],
            is_fallback=False
        ))

    stages_data = [
        ("Stage 1: System Architecture & Ingestion Sockets", "Configure FastAPI event ingestion webhooks and PostgreSQL log store.", [
            ("Setup FastAPI async event ingestion endpoint for incoming Datadog/Twilio webhook alerts.", "Write an async FastAPI router accepting POST /api/v1/alerts with pydantic validation for severity, stack trace, and microservice origin.", ["backend/app/routers/alerts.py"]),
            ("Configure Supabase PostgreSQL database tables with pgvector for error signature indexing.", "Generate SQL migration creating tables for alerts, incidents, affected_services, and incident_status.", ["backend/migrations/001_alerts.sql"]),
            ("Establish Keploy network proxy configuration for recording inbound alert traffic.", "Create keploy.yml binding to port 8000 and enable SQLite/Postgres auto-mocking.", ["keploy.yml"])
        ]),
        ("Stage 2: AI Root Cause Correlation Engine", "Ingest stack traces into the 7-Layer reasoning pipeline to identify regressions.", [
            ("Correlate recent git commits with stack trace line numbers using Git CLI.", "Execute git log across recent deployment tags to match modified functions against exception stack frames.", ["backend/app/services/git_correlator.py"]),
            ("Invoke NVIDIA Nemotron reasoning agent to draft the Root Cause Analysis hypothesis.", "Prompt the Nemotron architect layer with the incident diff, error payload, and service dependency graph.", ["backend/app/services/rca_engine.py"])
        ]),
        ("Stage 3: Keploy Automated Regression Replay", "Run deterministic integration test replays against the proposed code fix.", [
            ("Record golden baseline test cases from captured staging traffic using Keploy.", "Execute keploy record to capture incoming webhook alerts and database transactions.", ["scripts/run_keploy.ps1"]),
            ("Replay Keploy test suite to assert zero regressions before deploying remediation.", "Run keploy test --delay 5 to assert that the proposed patch eliminates the 500 error while preserving 200 OK across sibling endpoints.", ["keploy/tests/"])
        ]),
        ("Stage 4: Mission Control Dashboard (Next.js)", "Build real-time triage console with interactive resolution tracks.", [
            ("Construct retro incident monitor with live streaming status indicators.", "Build Next.js dashboard page with active incident cards, latency gauges, and one-click triage buttons.", ["frontend/app/dashboard/incident/page.tsx"]),
            ("Wire live WebSocket channel to display automated Keploy test pass/fail results.", "Connect React components to server-sent events for instant visual feedback on test passes.", ["frontend/components/KeployLiveFeed.tsx"])
        ])
    ]

    for s_idx, (s_name, s_desc, steps) in enumerate(stages_data):
        stage = PlaybookStage(
            playbook_id=pbid,
            name=s_name,
            description=s_desc,
            order_index=s_idx
        )
        db.add(stage)
        db.commit()
        db.refresh(stage)

        for st_idx, (inst, prompt, files) in enumerate(steps):
            step = PlaybookStep(
                stage_id=stage.id,
                order_index=st_idx,
                instruction=inst,
                ai_prompt=prompt,
                context_files=files
            )
            db.add(step)

    db.commit()
    return proj
