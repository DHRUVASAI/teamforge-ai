# TeamForge AI — System Architecture Specification

**Document:** 05 — System Architecture Specification
**Project:** TeamForge AI
**Status:** Draft v0.1
**Traces to:** 02_SRS.md (all FR sections), 04_SDLC.md (decision-engine shape)

---

## 1. Purpose & Principles

This document defines TeamForge AI's own architecture — the system that implements the requirements in 02_SRS.md. Every component below exists because a specific requirement needs it; none are included by default or by trend.

Principles carried over from 04_SDLC.md's anti-pattern stance:

- **Logical service boundaries first, physical deployment boundaries second.** The system is designed around clear ownership of responsibility and data. Whether a given boundary is deployed as a separate microservice or as a module inside a larger deployable is a *deployment decision* (§14), not an architecture-identity decision.
- **No component without a requirement.** Each service below is justified against the FR it satisfies.
- **Data ownership over shared databases.** Each logical service owns its data; nothing reaches into another service's tables directly.

## 2. High-Level Layered View

```
                    ┌──────────────────┐
                    │   Web Frontend   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   API Gateway    │
                    │ (auth, routing)  │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────────┐
        │                    │                         │
        ▼                    ▼                         ▼
  Team/Project           Mentor / AI              DevOps &
  Domain Services      Orchestration Layer      Integration Services
        │                    │                         │
        └────────────────────┼─────────────────────────┘
                             ▼
                    ┌──────────────────┐
                    │   Data Layer     │
                    │ (per-service DBs)│
                    └──────────────────┘
```

## 3. Frontend

**What it is:** Web application — Project Lead/Developer/Early-Career Developer/AI-Assisted-Developer dashboards (per 03_USE_CASES.md roles).

**Why it exists:** Every FR that involves a human viewing or acting on a recommendation (FR-001–005, FR-019, FR-024–027, FR-030, FR-045–046) needs a surface for that interaction. There is no requirement served by a CLI-only or headless approach at this stage.

**Key views:** project setup, architecture/SDLC recommendation review, task board (per-member), risk register, "why" query interface.

## 4. API Gateway

**What it is:** Single entry point for the frontend; handles routing to backend services and enforces authentication.

**Why it exists:** NFR-001 (Security) requires that all project data access be authenticated — centralizing that check avoids re-implementing it per service. It also gives the system one place to enforce NFR-002 (Scalability)-relevant routing/rate-limiting later without frontend changes.

## 5. Domain Services (Logical Boundaries)

Each entry: purpose, the FRs it satisfies, and why it's a distinct logical boundary rather than folded into another service.

| Service | Purpose | Satisfies | Why it's separate |
|---|---|---|---|
| **User & Team Service** | Auth, team/member/skill/subscription data | FR-001–004 | Owns identity, team, member skills, and active subscriptions — no other service should own "who is this person, what do they know, and what tools do they have" |
| **Project Service** | Problem statement, idea, time budget, project lifecycle state | FR-005–009 | Owns the project's core facts; feeds every downstream recommendation |
| **SDLC Service** | Runs the decision engine from 04_SDLC.md | FR-010–011 | Distinct decision logic and rule set from architecture/risk — keeping it separate lets it evolve (new SDLC models) without touching architecture logic |
| **Risk Service** | Risk identification, scoring, mitigation, re-evaluation | FR-012–015 | Needs to observe *both* project state and live progress (task status) — a cross-cutting concern best owned by one service rather than duplicated in Project/Task services |
| **Architecture Service** | Runs architecture decision engine (single-tier vs. multi-tier), component breakdown | FR-016–019 | Same reasoning as SDLC Service — distinct rule set, and its output (chosen architecture) is a dependency for Data Architecture, Task, and Tool services |
| **Data Architecture Service** | Recommends data ownership/storage per component of the *user's* project | FR-020–021 | Depends on Architecture Service output; kept separate because "what components exist" and "how should their data be organized" are different reasoning steps, occasionally revisited independently |
| **Task Service** | Task decomposition, dependency graph, bottleneck detection | FR-022–024 | Owns the task graph — the single source of truth that Mentor, GitHub Integration, and Progress Tracking all read from |
| **Assignment Service** | Skill-based task assignment | FR-025–027 | Reasoning here (who gets what) is distinct enough from *what tasks exist* (Task Service) to warrant separation, and it's the service most likely to need its own tuning/evaluation over time |
| **Tool Recommendation Service** | Per-task tool/technology suggestions (accounting for skills & active subscriptions) | FR-028–029 | Independent catalog-driven logic (see 11_TOOL_CATALOG) — evaluates task type, assignee skills, and existing subscriptions/licenses |
| **Mentor / Orchestration Service** | Free-form Q&A, proactive guidance, ties reasoning from all services into "why" answers | FR-030–032, FR-045–046 | This is the layer described in §6 below — it's the one service allowed to call into the others' reasoning outputs to answer cross-cutting questions |
| **GitHub Integration Service** | Repo/branch/issue creation, PR status tracking | FR-033–036 | External-system integration boundary — isolates GitHub API specifics from domain logic, and can fail/degrade independently (NFR-007) |
| **DevOps Service** | CI/CD and containerization recommendations | FR-037–039 | Same class of decision-engine as SDLC/Architecture (justified recommendation, not default), kept distinct because its inputs (stack, scale) differ from SDLC/architecture inputs |
| **Documentation Service** | README/architecture-summary generation, kept in sync with accepted plan | FR-040–042 | Read-only consumer of other services' outputs — isolating it means documentation generation can't accidentally mutate project state |
| **Presentation Service** | Pitch outline + anticipated-question generation | FR-043–044 | Same read-only consumer pattern as Documentation Service; separated because its output format (a deck outline, not docs) and audience (judges) differ |

**Note on scope realism (Phase 1):** Not all of these need to exist as *physically separate* deployments from day one — see §14. Their separation here is about clear ownership and API contracts, which matters even inside a single deployable.

## 6. AI / Mentor Orchestration Layer

This is not a single "call an LLM" step — it's the two-layer engine shape established in 04_SDLC.md §5, applied consistently:

```
Domain inputs (from Project, Team, Task, Risk services)
        │
        ▼
Deterministic rule-based filter
  (per-service: SDLC rules, architecture rules, risk heuristics)
        │
        ▼
Candidate recommendation(s)
        │
        ▼
LLM reasoning layer
  (ranks candidates, writes justification + rejected-alternative explanation)
        │
        ▼
Recommendation + Reasoning (FR-045/046)
```

**Why this shape, not "just ask the LLM":** an LLM alone is inconsistent about facts it should treat as hard constraints (e.g., "a 3-person 24-hour team cannot run real Scrum"). The rule-based filter enforces those constraints deterministically; the LLM's job is ranking within valid options and explaining — which is what LLMs are actually good at.

**Mentor Service specifically:** sits above the individual decision engines to answer cross-cutting "why" questions (FR-030, FR-046) and to notice cross-service patterns a single service wouldn't see on its own (e.g., "this task is both a Risk Service bottleneck flag *and* assigned to an Early-Career Developer" — FR-031).

## 7. Communication

- **Frontend ↔ API Gateway ↔ Services:** synchronous REST (or GraphQL, TBD in 11_API_CONTRACTS) — appropriate because most interactions are request/response driven by a human action (create project, accept recommendation).
- **Service ↔ Service (e.g., Mentor calling into Risk/Task/Architecture outputs):** synchronous internal calls for now. Justification: current interaction volume and team size don't require async messaging (NFR-002 doesn't yet demand it) — see §8 for when that would change.
- **No event bus/queue in Phase 1.** See §8.

## 8. Queues / Events — Justification for Deferral

An event-driven layer (e.g., "TaskCompleted" triggering Risk Service re-evaluation) is a natural fit *eventually* — but is **not included in Phase 1** because:

- Current scale (single team working on TeamForge itself, then a handful of pilot teams) doesn't require decoupled async processing.
- Synchronous calls are simpler to build, test, and debug — matching NFR-005 (Maintainability) for a team still establishing its own service contracts.

**Trigger to revisit:** when live progress tracking (FR-024–026, "Could-have" per 02_SRS.md §6) is built and multiple services need to react to the same state change (task status, risk re-evaluation, GitHub PR events) without tight coupling. At that point, an event bus becomes justified — this should become its own ADR when it happens, not a default assumption now.

## 9. Authentication

- Handled at the API Gateway (§4) plus owned by the User & Team Service (§5) for identity data.
- Team-level authorization: a member can only access projects belonging to their team (NFR-001).
- Project Lead role (FR-003, "Team Leader or Project Owner") carries additional permission to accept/override recommendations — enforced at the API layer, not left to the frontend.

## 10. Databases (Data Ownership)

Per-service ownership, consistent with 06_DATA_ARCHITECTURE (to be written next in this pack):

| Service | Owns |
|---|---|
| User & Team | users, teams, member skill profiles, member subscriptions/licenses |
| Project | projects, problem statements, time budgets |
| SDLC / Architecture / Risk / Task / Assignment | their respective recommendation records + reasoning history (NFR-008-style auditability, even though NFR-008 itself was deprioritized — worth revisiting) |
| Mentor | conversation/Q&A history |
| Tool Recommendation | tool catalog (from 09_TOOL_CATALOG) |
| GitHub Integration | linkage between internal tasks and external repo/issue/PR IDs — not a mirror of GitHub's own data |
| Documentation / Presentation | generated artifact history |

No shared database. Cross-service reads happen via API calls, not direct table access — this is what makes "logical service, physical monolith" (§14) still safe to later split.

## 11. External Integrations

- **LLM provider(s):** powers the reasoning layer in §6. Should be abstracted behind an internal interface so the provider can change without touching domain services (mitigates the "AI tool becoming unavailable" risk named in 01_PROJECT_VISION.md-adjacent risk thinking).
- **GitHub:** repo/branch/issue/PR management (FR-033–036).
- **Future/optional:** Jira (mentioned in the original brainstorming as a possible integration) — not in current FRs, so not included here; would need its own FR if added.

## 12. Storage

- Relational storage for structured domain data (per §10).
- Object/file storage for generated documentation and presentation artifacts (FR-040–044 outputs).
- No vector/RAG store in Phase 1 — the Mentor's context comes from direct API calls into domain services' current state, not from a retrieval index. Revisit if/when the system needs to reason over historical patterns across many past projects (out of scope per 01_PROJECT_VISION.md §8 for now).

## 13. Monitoring

- Deferred to Phase 3+ per the original phasing discussion, but named here so the architecture doesn't preclude it: structured logging per service (especially the reasoning layer's inputs/rejected-alternatives, supporting explainability audits) and basic uptime/error-rate visibility once there are real users beyond the TeamForge team itself.

## 14. Deployment — Applying the Project's Own Anti-Pattern Rule

This is the most important section for staying consistent with 04_SDLC.md §7's guardrail against defaulting to trendy choices.

**Phase 1 reality:** one primary developer plus collaborators, no live users yet, requirements still settling. Per the Architecture Recommendation logic this same system will apply to *other* teams (FR-016–019), a team in this position would **not** be told to deploy 14 separate microservices — that architecture would be recommended to the team building TeamForge itself only once team size, operational skill, and genuine scaling need justify it.

**Recommendation for TeamForge's own Phase 1 deployment:** a **modular monolith** — the logical service boundaries in §5 enforced as internal module/API boundaries within one deployable, sharing infrastructure but not databases (per §10). This keeps the door open to splitting any service out physically later (each already has a clean API contract) without paying microservices' operational cost before it's earned.

**Trigger to split a service out physically:** when it has a genuinely different scaling profile from the rest (the Mentor/LLM orchestration layer is the most likely first candidate, since LLM call latency and cost behave differently from simple CRUD services), or when a second developer needs to own and deploy it independently.

This decision itself should be written up as ADR-001 in 08_ARCHITECTURE_DECISIONS.md.

---

*Next document: 06 — Data Architecture Specification, detailing the per-service data ownership introduced in §10.*
