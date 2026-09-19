import json
from datetime import datetime, timezone
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.project import Project
from ..models.user_team import Team, TeamMember
from ..models.recommendation import SDLCRecommendation, ArchitectureRecommendation
from ..models.task import Task
from ..models.risk import Risk
from ..models.mentor import MentorConversation
from ..schemas.mentor import MentorResponse, WhyQueryResponse, ProactiveGuidanceResponse, GuidanceFlag

def ask_mentor(db: Session, project_id: str, member_id: str | None, question: str) -> MentorResponse:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "PROJECT_NOT_FOUND", "message": "Project not found"}}
        )
        
    team = db.query(Team).filter(Team.id == project.team_id).first()
    members = db.query(TeamMember).filter(TeamMember.team_id == project.team_id).all() if team else []
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    arch_rec = db.query(ArchitectureRecommendation).filter(ArchitectureRecommendation.project_id == project_id).first()
    sdlc_rec = db.query(SDLCRecommendation).filter(SDLCRecommendation.project_id == project_id).first()
    risks = db.query(Risk).filter(Risk.project_id == project_id).all()
    
    # Extract real database context
    member_map = {}
    for m in members:
        m_name = m.user.name if m.user else "Teammate"
        member_map[m.id] = {
            "name": m_name,
            "role": m.role,
            "subscriptions": [s.tool_name for s in m.subscriptions],
            "skills": [s.name for s in m.skills]
        }
        
    asking_member_name = member_map.get(member_id, {}).get("name", "Teammate") if member_id else "Teammate"
    
    arch_tables = []
    if arch_rec:
        for comp in arch_rec.components:
            tables = comp.get("data_ownership", {}).get("schema_tables", [])
            arch_tables.extend(tables)
            
    mandatory_plats = project.mandatory_platforms or []
    
    q_lower = question.lower()
    sources = []
    rejected_alternatives = []
    
    # -------------------------------------------------------------
    # 1. Cross-Teammate API Connection (Strictly Grounded in Real Endpoints & Project ID)
    # -------------------------------------------------------------
    if "connect" in q_lower and ("react" in q_lower or "frontend" in q_lower or "button" in q_lower or "backend" in q_lower or "api" in q_lower):
        sources.append("09_API_CONTRACTS.md#L18")
        sources.append("backend/app/routers/task.py")
        sources.append(f"projects/{project.id}/endpoints")
        
        # Find backend developer name
        backend_devs = [info["name"] for info in member_map.values() if "backend" in info["role"] or "developer" in info["role"]]
        backend_lead = backend_devs[0] if backend_devs else "the Backend Developer"
        
        answer = (
            f"Here is how to connect your Frontend directly to the Backend API for project **'{project.name}'**:\n\n"
            f"1. **Backend Base URL:** Use `process.env.NEXT_PUBLIC_API_URL` (defaults to `http://127.0.0.1:8000/api/v1` for local dev).\n"
            f"2. **Real Project Endpoint:** `POST /api/v1/projects/{project.id}/tasks`\n"
            f"3. **React `fetch` Call Snippet:**\n"
            f"```javascript\n"
            f"// Connects to {backend_lead}'s live FastAPI service\n"
            f"const submitRequest = async (payload) => {{\n"
            f"  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';\n"
            f"  const response = await fetch(`${{baseUrl}}/projects/{project.id}/tasks`, {{\n"
            f"    method: 'POST',\n"
            f"    headers: {{\n"
            f"      'Content-Type': 'application/json',\n"
            f"      'Authorization': `Bearer ${{userToken}}`\n"
            f"    }},\n"
            f"    body: JSON.stringify(payload)\n"
            f"  }});\n"
            f"  if (!response.ok) throw new Error(`HTTP Error: ${{response.status}}`);\n"
            f"  return await response.json();\n"
            f"}};\n"
            f"```\n"
            f"4. **Handoff Status:** {backend_lead} is assigned to backend tables ({', '.join(arch_tables[:3]) if arch_tables else 'core schemas'}). Use mock data if the route is still in `todo`."
        )

    # -------------------------------------------------------------
    # 2. Concurrency / Double-Booking / Database Locking (Grounded in Real Schema Tables)
    # -------------------------------------------------------------
    elif "double" in q_lower or "lock" in q_lower or "race condition" in q_lower or "oversell" in q_lower or "concurrency" in q_lower:
        sources.append("06_DATA_ARCHITECTURE.md#L4")
        sources.append("08_ADR.md#ADR-002")
        sources.append(f"schema_tables:{', '.join(arch_tables[:3]) if arch_tables else 'bookings'}")
        
        target_table = "bookings" if "bookings" in arch_tables else (arch_tables[0] if arch_tables else "records")
        
        answer = (
            f"To prevent double-booking race conditions in **'{project.name}'**:\n\n"
            f"1. **PostgreSQL Relational Locking:** Use SQLAlchemy `.with_for_update()` on your `{target_table}` table.\n"
            f"2. **Single Transaction Boundary:**\n"
            f"```python\n"
            f"from fastapi import HTTPException\n\n"
            f"# Atomic row-level lock on the {target_table} entity\n"
            f"with db.begin():\n"
            f"    record = db.query(BookingRecord).filter(BookingRecord.id == item_id).with_for_update().first()\n"
            f"    if record.status != 'available':\n"
            f"        raise HTTPException(status_code=400, detail='Resource already reserved by another user!')\n"
            f"    record.status = 'locked_for_payment'\n"
            f"```\n"
            f"3. **Why this works:** PostgreSQL holds a row-level exclusive lock until the transaction commits, ensuring only the first request succeeds."
        )

    # -------------------------------------------------------------
    # 3. QR Code Ticket Generation (Grounded in Project Context)
    # -------------------------------------------------------------
    elif "qr" in q_lower or "ticket" in q_lower or "pass" in q_lower:
        sources.append("backend/app/services/delivery_engine.py")
        sources.append(f"project_id:{project.id}")
        
        answer = (
            f"Here is the standard QR generation routine for **'{project.name}'**:\n\n"
            f"1. Install required packages: `pip install qrcode pillow`\n"
            f"2. Python QR Ticket Generator Function:\n"
            f"```python\n"
            f"import qrcode\n\n"
            f"def generate_ticket_pass(ticket_id: str, project_id: str = '{project.id}') -> str:\n"
            f"    verification_url = f'https://teamforge.app/verify/{project.id}/ticket/{{ticket_id}}'\n"
            f"    img = qrcode.make(verification_url)\n"
            f"    file_path = f'static/qr_{{ticket_id}}.png'\n"
            f"    img.save(file_path)\n"
            f"    return file_path\n"
            f"```\n"
            f"3. Return the `verification_url` and QR image to the frontend so attendees can scan it at event check-in."
        )

    # -------------------------------------------------------------
    # 4. Mandatory Hackathon Sponsor Platforms (Grounded in project.mandatory_platforms)
    # -------------------------------------------------------------
    elif any(p in q_lower for p in ["stripe", "payment", "vercel", "twilio", "sms", "gemini", "sponsor"]):
        sources.append("backend/app/services/condition_layer.py")
        sources.append(f"mandatory_platforms:{', '.join(mandatory_plats)}")
        
        answer = (
            f"**Hackathon Sponsor Platform Configuration for '{project.name}'**:\n\n"
            f"• **Configured Platforms:** {', '.join(mandatory_plats) if mandatory_plats else 'Standard Open Source Stack'}\n\n"
            f"• **Stripe Payments:** `pip install stripe` -> Set `STRIPE_SECRET_KEY` -> Create checkout sessions via `stripe.checkout.Session.create()`.\n"
            f"• **Vercel Edge:** Run `npm i -g vercel && vercel` in your frontend directory to deploy your mobile web client.\n"
            f"• **Twilio Alerts:** `pip install twilio` -> Send real-time booking confirmation SMS via `client.messages.create()`."
        )

    # -------------------------------------------------------------
    # 5. Who is Doing What / Live Team Workstreams (Grounded in Tasks Table)
    # -------------------------------------------------------------
    elif "who" in q_lower or "task" in q_lower or "progress" in q_lower or "status" in q_lower or "doing" in q_lower:
        sources.append("backend/app/models/task.py")
        sources.append(f"total_tasks:{len(tasks)}")
        
        task_summary = []
        for m_id, info in member_map.items():
            assigned = [t.title for t in tasks if t.assignment and t.assignment.member_id == m_id]
            subs_str = f" [Tools: {', '.join(info['subscriptions'])}]" if info['subscriptions'] else ""
            task_summary.append(f"• **{info['name']}** ({info['role']}){subs_str}:\n  - " + ("\n  - ".join(assigned[:3]) if assigned else "No active tasks"))
            
        answer = (
            f"**Current Team Workstream Allocation for '{project.name}' ({len(tasks)} Total Tasks):**\n\n"
            + "\n\n".join(task_summary) +
            f"\n\n*Time Budget:* {project.time_budget_value} {project.time_budget_unit} | *Feasibility:* {project.feasibility_verdict or 'FEASIBLE'}"
        )

    # -------------------------------------------------------------
    # 6. Architecture & SDLC Rationale (Grounded in Recommendations Table & ADRs)
    # -------------------------------------------------------------
    elif "architecture" in q_lower or "tier" in q_lower or "monolith" in q_lower or "microservice" in q_lower:
        sources.append("05_ARCHITECTURE.md#L14")
        sources.append("08_ADR.md#ADR-001")
        tier_name = arch_rec.tier if arch_rec else "Modular Monolith"
        answer = (
            f"The architecture for **'{project.name}'** is a **{tier_name}**.\n\n"
            f"• **Why:** Guarantees strict internal module boundaries and isolated database schemas ({', '.join(arch_tables[:4]) if arch_tables else 'per-service tables'}) "
            f"without incurring the operational overhead and distributed latency of separate microservices for a {len(members)}-person team.\n"
            f"• **Rationale:** {arch_rec.reasoning if arch_rec else 'Modular monolith for maximum sprint velocity.'}"
        )
        if arch_rec:
            rejected_alternatives = arch_rec.rejected_alternatives

    elif "sdlc" in q_lower or "agile" in q_lower or "scrum" in q_lower or "waterfall" in q_lower:
        sources.append("04_SDLC.md#L3")
        sources.append("08_ADR.md#ADR-006")
        model_name = sdlc_rec.recommended_model if sdlc_rec else "Iterative (Lightweight)"
        answer = (
            f"The SDLC methodology for **'{project.name}'** is **{model_name}**.\n\n"
            f"• **Why:** Matched to your time budget of {project.time_budget_value} {project.time_budget_unit}. "
            f"Work is structured into rapid 2-day milestone passes (Foundation -> Core Features -> Demo Polish) without ceremony friction.\n"
            f"• **Rationale:** {sdlc_rec.reasoning if sdlc_rec else 'Lightweight iterative cadence.'}"
        )
        if sdlc_rec:
            rejected_alternatives = sdlc_rec.rejected_alternatives

    # -------------------------------------------------------------
    # 7. General Context-Aware Project Response
    # -------------------------------------------------------------
    else:
        sources.append("01_PROJECT_VISION.md")
        sources.append(f"project_id:{project.id}")
        answer = (
            f"Hello {asking_member_name}! I am your AI Project Brain for **'{project.name}'**.\n\n"
            f"• **Project Summary:** {project.problem_statement}\n"
            f"• **Timeline:** {project.time_budget_value} {project.time_budget_unit} across {len(members)} team members.\n"
            f"• **Workstreams:** {len(tasks)} tasks mapped with {len(arch_tables)} database tables.\n\n"
            f"You can ask me about connecting frontend buttons to backend routes, database row locking, QR generation, or team task allocations anytime!"
        )

    convo = MentorConversation(
        project_id=project_id,
        member_id=member_id,
        question=question,
        answer=answer,
        sources_json=json.dumps(sources),
        rejected_alternatives_json=json.dumps(rejected_alternatives)
    )
    db.add(convo)
    db.commit()
    
    return MentorResponse(
        answer=answer,
        sources=sources,
        rejected_alternatives=rejected_alternatives,
        created_at=datetime.now(timezone.utc)
    )

def explain_recommendation_why(db: Session, recommendation_id: str) -> WhyQueryResponse:
    sdlc_rec = db.query(SDLCRecommendation).filter(SDLCRecommendation.id == recommendation_id).first()
    if sdlc_rec:
        return WhyQueryResponse(
            recommendation_type="SDLC",
            recommendation_id=sdlc_rec.id,
            reasoning=sdlc_rec.reasoning,
            inputs_used=["Project Time Budget", "Team Size", "Process Experience Level", "Deliverable Type"],
            rejected_alternatives=sdlc_rec.rejected_alternatives
        )
        
    arch_rec = db.query(ArchitectureRecommendation).filter(ArchitectureRecommendation.id == recommendation_id).first()
    if arch_rec:
        return WhyQueryResponse(
            recommendation_type="Architecture",
            recommendation_id=arch_rec.id,
            reasoning=arch_rec.reasoning,
            inputs_used=["Team Size & Skills", "System Component Boundaries", "Operational Overhead Limits"],
            rejected_alternatives=arch_rec.rejected_alternatives
        )
        
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"error": {"code": "RECOMMENDATION_NOT_FOUND", "message": "Recommendation ID not found"}}
    )

def get_proactive_guidance(db: Session, project_id: str) -> ProactiveGuidanceResponse:
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    risks = db.query(Risk).filter(Risk.project_id == project_id).all()
    
    flags = []
    
    for r in risks:
        if r.score >= 6 and r.status in ["Open", "Monitoring"]:
            flags.append(GuidanceFlag(
                type="risk",
                message=f"High risk flagged: {r.title} (Score: {r.score}).",
                action=f"Mitigation: {r.mitigation}"
            ))
            
    in_progress = [t for t in tasks if t.status == "in_progress"]
    if len(in_progress) > 4:
        flags.append(GuidanceFlag(
            type="bottleneck",
            message=f"High number of concurrent in-progress tasks ({len(in_progress)}).",
            action="Consider finishing active work before starting new tasks to avoid context switching."
        ))
        
    if not flags:
        flags.append(GuidanceFlag(
            type="opportunity",
            message="Project execution is aligned with the accepted architecture and SDLC plan.",
            action="Continue executing assigned workstream tasks."
        ))
        
    return ProactiveGuidanceResponse(
        project_id=project_id,
        flags=flags
    )
