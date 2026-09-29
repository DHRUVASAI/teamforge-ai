# TeamForge AI — Data Architecture Specification

**Document:** 06 — Data Architecture Specification
**Project:** TeamForge AI
**Status:** Draft v0.1
**Traces to:** 05_ARCHITECTURE.md (§10 Databases, §5 Domain Services)

---

## 1. Purpose

This document details data ownership, storage technology choice, and lifecycle for each logical service defined in 05_ARCHITECTURE.md. The rule from that document holds here too: no shared database, no storage technology chosen by default — each choice is justified against what the data actually needs.

## 2. Data Entities

The core entities the system operates on, independent of which service owns them (ownership assigned in §3):

| Entity | Description |
|---|---|
| User | An authenticated individual |
| Team | A group of users working on one project |
| MemberSkillProfile | A user's self-reported skills/experience, scoped to a team |
| MemberSubscription | A user's or team's active subscriptions, tool licenses, and cloud credits (e.g. GitHub Copilot, Claude Pro, Cursor Pro, AWS credits) |
| Project | A problem statement, idea, and time budget |
| SDLCRecommendation | A recommended SDLC model + reasoning + rejected alternatives, versioned |
| ArchitectureRecommendation | A recommended architecture (single/multi-tier) + component breakdown + reasoning, versioned |
| DataArchitectureRecommendation | Recommended data ownership/storage for the *user's* project (not TeamForge's own) |
| Risk | An identified risk with probability, impact, score, mitigation, status |
| Task | A unit of work derived from the accepted architecture |
| TaskDependency | A directed relationship between two tasks |
| Assignment | A task-to-member mapping + reasoning |
| ToolRecommendation | A suggested tool/technology for a task + reasoning |
| MentorConversation | A Q&A exchange between a user and the Mentor |
| RepoLink / IssueLink / PRStatus | Linkage between internal tasks and external GitHub objects |
| GeneratedDocument | A README/architecture-summary artifact |
| GeneratedPresentation | A pitch-deck outline artifact |
| ToolCatalogEntry | A cataloged tool with category, cost, skill fit (feeds ToolRecommendation) |

## 3. Data Ownership Map (Which Service Owns Which Data)

```
User & Team Service        → users, teams, member_skills, member_subscriptions
Project Service             → projects, problem_statements, time_budgets
SDLC Service                → sdlc_recommendations, sdlc_reasoning
Risk Service                → risks, risk_scores, mitigations, risk_history
Architecture Service        → architecture_recommendations, component_breakdowns
Data Architecture Service   → data_architecture_recommendations (for the USER's project)
Task Service                → tasks, task_dependencies, bottleneck_flags
Assignment Service          → task_assignments, assignment_reasoning
Tool Recommendation Service → tool_catalog, tool_recommendations
Mentor Service               → mentor_conversations, qa_history
GitHub Integration Service  → repo_links, issue_links, pr_status
DevOps Service               → devops_recommendations
Documentation Service        → generated_docs (metadata + file references)
Presentation Service         → generated_presentations (metadata + file references)
```

No service reads another's tables directly. Cross-service data needs go through that owning service's API (per 05_ARCHITECTURE.md §5/§10).

## 4. Storage Technology Per Data Type

| Data type | Example | Storage choice | Why |
|---|---|---|---|
| Structured, relational, transactional | users, teams, projects, tasks, assignments | PostgreSQL | Strong relational consistency; team/project/task relationships are inherently relational (foreign keys, joins); mature tooling reduces setup risk for a small team (ties to NFR-005 Maintainability) |
| Reasoning/recommendation records | sdlc_recommendations, architecture_recommendations, risk data | PostgreSQL (same instance/cluster, separate schemas per service) | Still structured and relational (a recommendation belongs to a project, has a timestamp, reasoning text) — doesn't need a different technology just because it's "AI output" |
| Conversation/Q&A history | mentor_conversations | PostgreSQL (JSON/text columns) | Volume and access pattern don't yet justify a specialized document store; revisit if conversation volume or search-over-history needs grow |
| Cache / session data | active session tokens, short-lived recommendation-in-progress state | Redis (or in-memory, revisit) | Only justified once concurrent usage is high enough that repeated DB hits for session checks matter — **not required for Phase 1** (single team, low concurrency); named here so the option exists when NFR-002 (Scalability) becomes relevant |
| Generated files | READMEs, architecture summaries, presentation decks | Object/file storage (e.g., S3-compatible or simple filesystem in Phase 1) + a metadata row in the owning service's DB | Files themselves don't belong in a relational DB; the DB just needs to know a file exists and where |
| Tool catalog | tool_catalog | PostgreSQL | Structured, queryable by task type/skill level/cost — no need for anything more specialized |
| Vector/RAG store | — | **Not included in Phase 1** | Per 05_ARCHITECTURE.md §12 — the Mentor reasons over live API state, not a retrieval index, until the system needs to learn across many past projects |
| Logs | request logs, reasoning-input logs (per service) | Structured log files → log aggregation service (deferred to Phase 3 per 05_ARCHITECTURE.md §13) | Logs are operational data, not domain data — kept out of the relational domain DBs so they can be rotated/aggregated independently and don't bloat backups |
| Analytics | aggregate usage/outcome data (e.g., how often recommendations get overridden) | **Not included in Phase 1** | No current FR requires cross-project analytics (01_PROJECT_VISION.md §8 excludes multi-team program management for now); when needed, should be a read-only aggregation over existing service data, not a new write path — and needs its own FR before implementation |

**Guardrail:** no data type gets a specialized store (vector DB, document DB, graph DB) unless a specific access pattern requires it. Relational is the default; deviations need their own justification, same as every other recommendation this system makes.

## 5. Data Lifecycle

| Concern | Approach |
|---|---|
| Creation | Each service writes its own records via its own API — never inserted by another service |
| Update | Recommendations are versioned, not overwritten — when the Architecture Service regenerates a recommendation after a user override (FR-019), the prior version is retained for the reasoning/audit trail (supports explainability, FR-045/046, and revisits NFR-008's intent even though it's currently deprioritized) |
| Retention | Project data persists for the life of the project; no automatic deletion in Phase 1 — a retention/deletion policy is a Phase 3+ concern once real user data (not just the TeamForge team's own test data) is involved |
| Backup | Standard DB backup for the relational store; file storage backup handled by whatever storage provider is chosen — not a bespoke system |

## 6. Cross-Service Data Flow (Read Dependencies)

Even though no service reads another's tables, several services *depend on* another service's current output via API:

```
Project Service
   │  (problem statement, time budget)
   ▼
SDLC Service ──┐
   │           │  both read Project + Team data
   ▼           ▼
Architecture Service
   │
   ▼
Data Architecture Service (for the user's project)
   │
   ▼
Task Service
   │
   ▼
Assignment Service ──┐
                  │  both read Task output + Team skills & member subscriptions
                  ▼
Tool Recommendation Service

Risk Service reads from: Project, Architecture, Task (cross-cutting, per 05_ARCHITECTURE.md §5)
Mentor Service reads from: all of the above (cross-cutting, orchestration layer)
```

This confirms the ordering assumption baked into 04_SDLC.md and 05_ARCHITECTURE.md: SDLC and Architecture recommendations must exist before Task decomposition can run, which must exist before Assignment and Tool Recommendation can run. This ordering should be enforced by the Mentor Orchestration Service, not left to the frontend to call things in the right sequence.

## 7. Data Security Notes (ties to NFR-001)

- Team-scoped access enforced at the API Gateway (per 05_ARCHITECTURE.md §9) — but each service's data layer should also filter by team/project ID as a second layer, not rely solely on the gateway.
- No secrets (GitHub tokens, LLM API keys) stored alongside domain data — kept in a separate secrets store/environment configuration, never in a table a domain service query could accidentally expose.

---

*Next document: 07 — Risk Management Plan, applying the Risk Service's own logic (04.5 in 02_SRS.md) to TeamForge's own build as a dogfooding exercise.*
