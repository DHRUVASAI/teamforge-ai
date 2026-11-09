"""
arch_engine.py — Bespoke Architecture Synthesis Engine
=======================================================
Stage 1 (silent, deterministic):  calculate_silent_boundaries()
Stage 2 (LLM, creative layer):    _llm_synthesize_bespoke()
Fallback: deterministic output when LLM rate-limited / unavailable.
"""
import json
import re
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.project import Project
from ..models.user_team import TeamMember
from ..models.recommendation import ArchitectureRecommendation
from ..schemas.recommendation import ArchitectureOverrideRequest
from .condition_layer import extract_mandatory_platform_rules
from ..core import llm_client
from ..prompts.architect_prompt import (
    BESPOKE_ARCHITECT_SYSTEM_PROMPT,
    BESPOKE_ARCHITECT_USER_PROMPT,
)

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Pure-code constraint extractor  (<1 ms, zero API calls)
# ─────────────────────────────────────────────────────────────────────────────

def calculate_silent_boundaries(project: Project, team_size: int) -> dict:
    """
    Deterministically extracts technical envelopes from project data.
    Does NOT name an architecture archetype — the LLM does that in Stage 2.
    Returns a dict of boundary strings consumed by the bespoke LLM prompt.
    """
    # ── Normalise time budget to weeks ────────────────────────────────────────
    tv = project.time_budget_value or 48
    tu = (project.time_budget_unit or "hours").lower()
    if tu == "hours":
        time_weeks = tv / 168.0
    elif tu == "weeks":
        time_weeks = float(tv)
    elif tu == "days":
        time_weeks = tv / 7.0
    else:  # months
        time_weeks = tv * 4.0

    # ── Feature-signal detection (no LLM needed) ─────────────────────────────
    text = f"{project.problem_statement or ''} {project.idea or ''}".lower()

    is_realtime = any(k in text for k in [
        "chat", "realtime", "real-time", "live", "socket", "stream",
        "collaborative", "multiplayer", "notify", "websocket",
    ])
    is_heavy_data = any(k in text for k in [
        "ml", "ai model", "vector", "analytics", "pipeline", "ingestion",
        "scrape", "dataset", "embedding", "recommendation engine",
    ])
    is_ecommerce = any(k in text for k in [
        "checkout", "payment", "stripe", "shop", "cart", "order",
        "invoice", "subscription", "marketplace",
    ])
    is_seo_critical = any(k in text for k in [
        "blog", "cms", "marketing", "landing", "seo", "content",
        "portfolio", "news", "publication",
    ])
    is_mobile = any(k in text for k in [
        "mobile", "ios", "android", "react native", "flutter", "app store",
    ])

    # ── Base defaults ─────────────────────────────────────────────────────────
    b = {
        "compute_strategy":      "Unified Server Runtime with modular internal boundaries",
        "database_paradigm":     "Relational SQL (PostgreSQL) with structured schema",
        "hosting_tier":          "Managed Zero-Ops PaaS (Render, Railway, Fly.io)",
        "deployment_complexity": "Low — single deployable, one-command launch",
        "time_allowance":        "",
    }

    # ── Team & timeline overrides ─────────────────────────────────────────────
    if time_weeks <= 2 or team_size == 1:
        b["compute_strategy"]      = "Serverless Edge Workers + Direct BaaS APIs (zero backend ops)"
        b["database_paradigm"]     = "Serverless Scale-to-Zero SQL (Supabase / Neon) or BaaS"
        b["hosting_tier"]          = "Global Edge CDN (Vercel, Cloudflare Pages)"
        b["deployment_complexity"] = "Minimal — git push to deploy, no server management"
    elif time_weeks > 12 and team_size >= 4:
        b["compute_strategy"]      = "Distributed Independent Services with dedicated API gateways"
        b["database_paradigm"]     = "Polyglot persistence (SQL for ACID + NoSQL for scale-out)"
        b["hosting_tier"]          = "Container Orchestration (AWS ECS / GCP Cloud Run with auto-scaling)"
        b["deployment_complexity"] = "High — CI/CD pipeline, container registry, service mesh"

    # ── Feature-signal overrides (most specific wins) ─────────────────────────
    if is_realtime:
        b["compute_strategy"]  = "Persistent Event-Driven WebSocket Gateway + async task workers"
        b["database_paradigm"] = "Hybrid: Relational SQL + In-Memory Realtime Layer (Supabase Realtime / Redis Pub-Sub)"
        b["deployment_complexity"] = "Medium — persistent connections require non-serverless backend"

    if is_heavy_data:
        b["compute_strategy"]  = "Decoupled Async Worker Pipeline + REST API layer"
        b["database_paradigm"] = "Hybrid Polyglot: SQL (structured) + Vector Index (pgvector / Pinecone)"

    if is_ecommerce:
        b["database_paradigm"] = "Relational SQL with ACID transaction guarantees (PostgreSQL)"
        b["hosting_tier"]      = b["hosting_tier"] + " — PCI-DSS compliant payment processing via Stripe"

    if is_seo_critical:
        b["compute_strategy"]  = "Server-Side Rendering runtime (Next.js SSR / Astro) for pre-rendered HTML"

    if is_mobile:
        b["compute_strategy"]  = "Thin REST/GraphQL API backend + native mobile client"

    # ── Human-readable timeline allowance string ──────────────────────────────
    if time_weeks <= 4:
        b["time_allowance"] = (
            f"Critical timeline ({tv} {tu}) — prioritise zero-ops free tiers: "
            "Supabase, Vercel, Render. Skip heavy cloud setup."
        )
    elif time_weeks <= 12:
        b["time_allowance"] = (
            f"Moderate timeline ({tv} {tu}) — consider Render/Fly for backend, "
            "Vercel for frontend, Supabase free tier for DB."
        )
    else:
        b["time_allowance"] = (
            f"Ample timeline ({tv} {tu}) — configure AWS Free Tier (12 months), "
            "Oracle Always-Free compute, or GCP $300 credits for enterprise-grade zero-cost setup."
        )

    return b


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — LLM bespoke synthesis  (wrapped with rate-limit fallback)
# ─────────────────────────────────────────────────────────────────────────────

def _llm_synthesize_bespoke(project: Project, boundaries: dict, mandatory_platforms: list) -> dict | None:
    """
    Calls the LLM once with a concise prompt.
    Returns parsed dict on success, None on any failure (rate limit, timeout, bad JSON).
    """
    user_prompt = BESPOKE_ARCHITECT_USER_PROMPT.format(
        problem_statement=project.problem_statement or "No problem statement provided.",
        idea=project.idea or "No idea provided.",
        compute_strategy=boundaries["compute_strategy"],
        database_paradigm=boundaries["database_paradigm"],
        hosting_tier=boundaries["hosting_tier"],
        deployment_complexity=boundaries["deployment_complexity"],
        time_allowance=boundaries["time_allowance"],
        mandatory_platforms=", ".join(mandatory_platforms) if mandatory_platforms else "None",
        slug="<domain-slug>",
    )

    try:
        raw = llm_client.generate_json(
            system_prompt=BESPOKE_ARCHITECT_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            layer="arch_engine",
        )
        if isinstance(raw, dict) and "bespoke_title" in raw:
            return raw
        # Sometimes generate_json returns a string; try parsing it
        if isinstance(raw, str):
            # Strip markdown fences if present
            cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
            parsed = json.loads(cleaned)
            if isinstance(parsed, dict) and "bespoke_title" in parsed:
                return parsed
    except Exception as exc:
        logger.warning("Bespoke LLM synthesis failed (%s) — falling back to deterministic output.", exc)

    return None


# ─────────────────────────────────────────────────────────────────────────────
# Deterministic fallback components (keyword-aware, never 100% generic)
# ─────────────────────────────────────────────────────────────────────────────

def _deterministic_fallback(project: Project, boundaries: dict, platform_rules: list) -> dict:
    """
    Builds a bespoke-flavoured output using only deterministic code.
    Used when the LLM is rate-limited or unavailable.
    """
    # Derive a contextual title from the project text
    text = f"{project.problem_statement or ''} {project.idea or ''}".lower()
    if any(k in text for k in ["chat", "realtime", "collaborative"]):
        title = "Reactive Collaborative Event-Mesh Platform"
    elif any(k in text for k in ["ml", "ai model", "vector", "embedding"]):
        title = "Intelligent Data-Ingestion & Inference Pipeline"
    elif any(k in text for k in ["checkout", "payment", "marketplace"]):
        title = "Transactional Commerce Delivery Framework"
    elif any(k in text for k in ["blog", "cms", "content", "seo"]):
        title = "Statically-Optimised Content Delivery Architecture"
    elif any(k in text for k in ["mobile", "ios", "android"]):
        title = "API-First Mobile Client Architecture"
    else:
        title = "Modular Domain-Driven Service Platform"

    rationale = (
        f"Given the {boundaries['deployment_complexity'].split('—')[0].strip().lower()} deployment "
        f"envelope and {boundaries['database_paradigm'].split('(')[0].strip()}, "
        "this architecture maximises delivery velocity while maintaining clear domain boundaries."
    )

    components = [
        {
            "id": "comp-identity-access",
            "name": "Identity & Access Control Layer",
            "responsibility": "Authentication, authorisation, user profiles, and session management.",
            "data_ownership": {"storage": "PostgreSQL", "schema_tables": ["users", "sessions", "roles"]},
        },
        {
            "id": "comp-core-domain",
            "name": "Core Domain Logic Service",
            "responsibility": f"Primary business logic for {project.name or 'this application'}, domain rules and state transitions.",
            "data_ownership": {"storage": "PostgreSQL", "schema_tables": ["domain_records", "events"]},
        },
        {
            "id": "comp-api-gateway",
            "name": "Public API & Integration Gateway",
            "responsibility": "RESTful API surface, request validation, rate limiting, and third-party webhook ingestion.",
            "data_ownership": {"storage": "PostgreSQL", "schema_tables": ["api_keys", "audit_logs"]},
        },
        {
            "id": "comp-async-worker",
            "name": "Background Processing & Scheduler",
            "responsibility": "Async job execution, scheduled tasks, notification dispatch, and retry logic.",
            "data_ownership": {"storage": "PostgreSQL", "schema_tables": ["job_queue", "job_history"]},
        },
        {
            "id": "comp-storage-layer",
            "name": "Data Storage & Persistence Layer",
            "responsibility": "Durable state management, file storage, caching, and query optimisation.",
            "data_ownership": {"storage": boundaries["database_paradigm"].split("(")[0].strip(), "schema_tables": ["entities", "metadata", "cache"]},
        },
        {
            "id": "comp-observability",
            "name": "Observability & Health Monitor",
            "responsibility": "Structured logging, error tracking, performance metrics, and uptime alerting.",
            "data_ownership": {"storage": "PostgreSQL & Object Store", "schema_tables": ["traces", "error_logs", "metrics"]},
        },
    ]

    # Inject mandatory platform components
    for rule in platform_rules:
        bp = rule["blueprint"]
        comp_id = f"comp-{rule['platform_name'].lower().replace(' ', '-')}"
        if not any(c["id"] == comp_id for c in components):
            components.append({
                "id": comp_id,
                "name": bp["component_name"],
                "responsibility": bp["responsibility"],
                "data_ownership": {"storage": "PostgreSQL", "schema_tables": bp["schema_tables"]},
            })

    ai_accelerators = [
        {
            "phase": "UI Prototyping",
            "tools": [
                {"name": "v0.dev", "why": "Generate React components from plain-text descriptions — zero design friction."},
                {"name": "Bolt.new", "why": "Full-stack app scaffold in one prompt — ideal for rapid feature spikes."},
            ],
        },
        {
            "phase": "Backend & API",
            "tools": [
                {"name": "Supabase", "why": "Instant PostgreSQL + Auth + Realtime + Storage — eliminates backend boilerplate."},
                {"name": "Railway", "why": "git push deploy for Docker containers — no Kubernetes overhead."},
            ],
        },
        {
            "phase": "Testing & Quality",
            "tools": [
                {"name": "Keploy", "why": "Record real API traffic and auto-generate regression tests — zero test-writing effort."},
            ],
        },
    ]

    rejected_alternatives = [
        {
            "approach": "Full Distributed Microservices",
            "reason_rejected": f"Excessive operational overhead (Kubernetes, service mesh, distributed tracing) for a {boundaries['deployment_complexity'].split('—')[0].strip().lower()} deployment context.",
        },
        {
            "approach": "Unstructured Monolith",
            "reason_rejected": "Lacks enforced module boundaries — leads to tightly coupled code and single-developer bottlenecks at scale.",
        },
    ]

    diagram_mermaid = synthesize_mermaid_diagram(title, components, boundaries)

    return {
        "bespoke_title": title,
        "bespoke_rationale": rationale,
        "components": components,
        "deployment_blueprint": f"Single deployable on {boundaries['hosting_tier'].split('(')[0].strip()} — auto-scaling enabled, zero manual server provisioning.",
        "ai_accelerators": ai_accelerators,
        "rejected_alternatives": rejected_alternatives,
        "diagram_mermaid": diagram_mermaid,
    }


def synthesize_mermaid_diagram(title: str, components: list, boundaries: dict) -> str:
    """
    Constructs a clean, production-grade Mermaid flowchart TD from components and data ownership.
    Guaranteed syntactically valid with zero rendering errors.
    """
    clean_title = title.replace('"', "'")
    lines = [
        "flowchart TD",
        "    classDef client fill:#001133,stroke:#0066CC,stroke-width:2px,color:#FFFFFF",
        "    classDef gateway fill:#1E293B,stroke:#38BDF8,stroke-width:2px,color:#FFFFFF",
        "    classDef service fill:#0F172A,stroke:#CC0066,stroke-width:2px,color:#FFFFFF",
        "    classDef storage fill:#064E3B,stroke:#10B981,stroke-width:2px,color:#FFFFFF",
        "",
        '    subgraph Edge["Client & Edge Gateway"]',
        '        Client["Web / Mobile Clients"]:::client',
        f'        Gateway["{boundaries.get("hosting_tier", "Edge CDN").split("—")[0].strip()}"]:::gateway',
        '    end',
        "",
        f'    subgraph Mesh["Architecture: {clean_title}"]',
    ]

    db_map = {}
    for i, comp in enumerate(components):
        node_id = f"SVC_{i}"
        comp_name = comp.get("name", f"Service {i+1}").replace('"', "'")
        lines.append(f'        {node_id}["{comp_name}"]:::service')

        storage = comp.get("data_ownership", {}).get("storage", "PostgreSQL")
        clean_db_id = "DB_" + re.sub(r'[^a-zA-Z0-9_]', '', storage.replace(' ', '_'))
        if clean_db_id not in db_map:
            db_map[clean_db_id] = (storage, [])
        db_map[clean_db_id][1].append(node_id)

    lines.append('    end')
    lines.append('')
    lines.append('    subgraph Storage["State & Persistence Layer"]')
    for db_id, (storage_name, _) in db_map.items():
        clean_name = storage_name.replace('"', "'")
        lines.append(f'        {db_id}[("Store: {clean_name}")]:::storage')
    lines.append('    end')
    lines.append('')
    lines.append('    Client --> Gateway')
    for i in range(len(components)):
        lines.append(f'    Gateway --> SVC_{i}')
    for db_id, (_, svc_ids) in db_map.items():
        for svc_id in svc_ids:
            lines.append(f'    {svc_id} -.-> {db_id}')

    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def recommend_architecture(db: Session, project_id: str) -> ArchitectureRecommendation:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "PROJECT_NOT_FOUND", "message": "Project not found"}},
        )

    team_members = db.query(TeamMember).filter(TeamMember.team_id == project.team_id).all()
    team_size = max(1, len(team_members))

    # Stage 1 — deterministic boundaries (zero API calls, <1 ms)
    boundaries = calculate_silent_boundaries(project, team_size)

    # Condition Layer — mandatory hackathon platforms
    platform_rules = extract_mandatory_platform_rules(project)
    mandatory_platforms = [r["platform_name"] for r in platform_rules]

    # Stage 2 — LLM bespoke synthesis (may fall back silently)
    bespoke = _llm_synthesize_bespoke(project, boundaries, mandatory_platforms)

    if bespoke is None:
        # Deterministic fallback — always succeeds
        bespoke = _deterministic_fallback(project, boundaries, platform_rules)
    else:
        # Merge mandatory platform components if LLM omitted them
        existing_ids = {c.get("id", "") for c in bespoke.get("components", [])}
        for rule in platform_rules:
            bp = rule["blueprint"]
            comp_id = f"comp-{rule['platform_name'].lower().replace(' ', '-')}"
            if comp_id not in existing_ids:
                bespoke["components"].append({
                    "id": comp_id,
                    "name": bp["component_name"],
                    "responsibility": bp["responsibility"],
                    "data_ownership": {"storage": "PostgreSQL", "schema_tables": bp["schema_tables"]},
                })

    # Persist to DB
    tier = bespoke.get("bespoke_title", "Bespoke Platform Architecture")
    deployment_recommendation = bespoke.get(
        "deployment_blueprint",
        f"Deployed on {boundaries['hosting_tier']} with {boundaries['deployment_complexity'].split('—')[0].strip()} complexity.",
    )
    reasoning = bespoke.get("bespoke_rationale", boundaries["time_allowance"])
    components = bespoke.get("components", [])
    rejected_alternatives = bespoke.get("rejected_alternatives", [])
    ai_accelerators = bespoke.get("ai_accelerators", [])

    diagram_mermaid = bespoke.get("diagram_mermaid")
    if not diagram_mermaid or not any(diagram_mermaid.strip().startswith(p) for p in ["graph", "flowchart"]):
        diagram_mermaid = synthesize_mermaid_diagram(tier, components, boundaries)

    rec = db.query(ArchitectureRecommendation).filter(
        ArchitectureRecommendation.project_id == project_id,
        ArchitectureRecommendation.status != "overridden",
    ).order_by(ArchitectureRecommendation.version.desc()).first()

    if rec and rec.status == "recommended":
        rec.tier = tier
        rec.deployment_recommendation = deployment_recommendation
        rec.reasoning = reasoning
        rec.components = components
        rec.rejected_alternatives = rejected_alternatives
        rec.ai_accelerators = ai_accelerators
        rec.bespoke_rationale = reasoning
        rec.diagram_mermaid = diagram_mermaid
    else:
        rec = ArchitectureRecommendation(
            project_id=project_id,
            tier=tier,
            deployment_recommendation=deployment_recommendation,
            reasoning=reasoning,
            rejected_alternatives_json=json.dumps(rejected_alternatives),
            components_json=json.dumps(components),
            ai_accelerators_json=json.dumps(ai_accelerators),
            bespoke_rationale=reasoning,
            diagram_mermaid=diagram_mermaid,
            version=1 if not rec else rec.version + 1,
            status="recommended",
        )
        db.add(rec)

    db.commit()
    db.refresh(rec)
    return rec


def accept_architecture(db: Session, project_id: str, recommendation_id: str) -> ArchitectureRecommendation:
    rec = db.query(ArchitectureRecommendation).filter(
        ArchitectureRecommendation.id == recommendation_id,
        ArchitectureRecommendation.project_id == project_id,
    ).first()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "RECOMMENDATION_NOT_FOUND", "message": "Architecture recommendation not found"}},
        )
    rec.status = "accepted"

    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        project.status = "planned"

    db.commit()
    db.refresh(rec)
    return rec


def override_architecture(db: Session, project_id: str, data: ArchitectureOverrideRequest) -> ArchitectureRecommendation:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "PROJECT_NOT_FOUND", "message": "Project not found"}},
        )

    db.query(ArchitectureRecommendation).filter(
        ArchitectureRecommendation.project_id == project_id
    ).update({"status": "overridden"})

    components_dict = [c.model_dump() for c in data.components]

    diagram_mermaid = synthesize_mermaid_diagram(data.tier, components_dict, {
        "hosting_tier": "Custom User Infrastructure",
        "deployment_complexity": "Custom"
    })

    new_rec = ArchitectureRecommendation(
        project_id=project_id,
        tier=data.tier,
        deployment_recommendation="User customized architectural layout with defined module boundaries.",
        reasoning="Custom architecture configuration provided by Project Lead override.",
        rejected_alternatives_json=json.dumps([{
            "approach": "Original System Recommendation",
            "reason_rejected": "Project Lead exercised manual override authority per FR-019.",
        }]),
        components_json=json.dumps(components_dict),
        ai_accelerators_json=json.dumps([]),
        bespoke_rationale=None,
        diagram_mermaid=diagram_mermaid,
        version=2,
        status="accepted",
    )
    db.add(new_rec)
    project.status = "planned"
    db.commit()
    db.refresh(new_rec)
    return new_rec
