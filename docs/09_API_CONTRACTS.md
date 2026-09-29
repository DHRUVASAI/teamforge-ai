# TeamForge AI — API & Service Contracts

**Document:** 09 — API & Service Contracts
**Project:** TeamForge AI
**Status:** Draft v0.1
**Traces to:** 05_ARCHITECTURE.md (§5 Domain Services, §7 Communication), 06_DATA_ARCHITECTURE.md (§6 Cross-Service Data Flow), 02_SRS.md (all FRs)

---

## 1. Purpose

This document defines the API contracts every service must implement. This is the document your coding agent should follow literally — per 05_ARCHITECTURE.md's "no shared database" rule, services can *only* interact through these contracts, so an agent inventing its own endpoint shapes breaks the architecture, not just the style.

Each service should ship its own `openapi.yaml` derived from the tables below (see §7).

## 2. Global Conventions

- **Base path:** `/api/v1/{service}/...` — all requests go through the API Gateway (05_ARCHITECTURE.md §4), which routes by service prefix.
- **Format:** JSON request/response bodies, `Content-Type: application/json`.
- **IDs:** UUIDs as strings for all entity IDs.
- **Timestamps:** ISO 8601 UTC (`2026-09-09T10:00:00Z`).
- **Pagination:** list endpoints accept `?limit=&cursor=`, respond with `{ "items": [...], "next_cursor": "..." }`.

## 3. Authentication

- Every request (except `POST /auth/login` and `POST /auth/register`) requires `Authorization: Bearer <token>`.
- The API Gateway validates the token and injects `X-User-Id` and `X-Team-Id` headers for downstream services — domain services trust the gateway for this in Phase 1 (single deployable, per ADR-001), but must still independently filter every query by `X-Team-Id`/project ID (06_DATA_ARCHITECTURE.md §7) rather than trusting the gateway as the only check.
- Project Lead-only actions (e.g., accepting/overriding a recommendation, FR-003/FR-019) additionally require the requesting user to hold the `team_leader` role for that team (technical role slug unchanged; narrative name updated to Project Lead per 03_USE_CASES.md) — checked at the service handling the action, not just the gateway.

## 4. Error Handling

Standard error response shape, used by every service:

```json
{
  "error": {
    "code": "ARCHITECTURE_NOT_FOUND",
    "message": "No accepted architecture recommendation exists for this project.",
    "details": {}
  }
}
```

| HTTP Status | Meaning | Example |
|---|---|---|
| 400 | Invalid request body/params | Missing required field |
| 401 | Missing/invalid auth token | — |
| 403 | Authenticated but not authorized | Non-leader tries to accept a recommendation |
| 404 | Resource not found | Project ID doesn't exist |
| 409 | Conflict / ordering violation | Task decomposition requested before architecture accepted (06_DATA_ARCHITECTURE.md §5 ordering) |
| 422 | Semantically invalid | Team size doesn't match number of member entries |
| 502/503 | Upstream dependency (LLM provider, GitHub) unavailable | Ties to R-003/R-004 in 07_RISK_MANAGEMENT.md — must degrade per NFR-007, not just 500 |

Error `code` values are stable strings services can rely on programmatically; `message` is human-readable.

## 5. Versioning

- URL-path versioning (`/v1/...`). A breaking change to a contract requires `/v2/...` for that service specifically — services version independently, since they deploy independently in principle even while co-located in Phase 1 (ADR-001).
- Non-breaking additions (new optional field, new endpoint) don't require a version bump.
- Each service's OpenAPI file is the source of truth for its current version — this document defines shape and intent; the OpenAPI file is authoritative for exact schema.

## 6. Per-Service Contracts

### 6.1 User & Team Service (FR-001–004)

| Method | Path | Purpose | Key Request Fields | Key Response Fields |
|---|---|---|---|---|
| POST | `/auth/register` | Create a user account | `email, password, name` | `user_id, token` |
| POST | `/auth/login` | Authenticate | `email, password` | `token` |
| POST | `/teams` | Create a team | `name` | `team_id` |
| POST | `/teams/{team_id}/members` | Add a member | `user_id, skills: [{name, level}], subscriptions?: [{tool_name, tier, credits?}]` | `member_id` |
| PATCH | `/teams/{team_id}/members/{member_id}` | Update skills/role/subscriptions | `skills?, role?, subscriptions?` | updated member |
| GET | `/teams/{team_id}` | Get team + members | — | `team, members[]` |

**Depends on:** nothing (base identity service).

### 6.2 Project Service (FR-005–009)

| Method | Path | Purpose | Key Request Fields | Key Response Fields |
|---|---|---|---|---|
| POST | `/projects` | Create project | `team_id, problem_statement, idea, time_budget` | `project_id, status` |
| POST | `/projects/{id}/analyze` | Run problem-statement analysis + feasibility | — | `capabilities[], ambiguities[], feasibility: {verdict, reasoning}` |
| GET | `/projects/{id}` | Get project state | — | full project object |
| PATCH | `/projects/{id}` | Edit problem statement/time budget | fields to update | updated project |

**Depends on:** User & Team Service (`team_id` validity).

### 6.3 SDLC Service (FR-010–011)

| Method | Path | Purpose | Key Request Fields | Key Response Fields |
|---|---|---|---|---|
| POST | `/projects/{id}/sdlc/recommend` | Run SDLC decision engine | — | `model, reasoning, rejected_alternatives[]` |
| GET | `/projects/{id}/sdlc` | Get current accepted/latest recommendation | — | recommendation object (versioned, 06_DATA_ARCHITECTURE.md §5) |

**Depends on:** Project Service, User & Team Service (team size/experience inputs).

### 6.4 Architecture Service (FR-016–019)

| Method | Path | Purpose | Key Request Fields | Key Response Fields |
|---|---|---|---|---|
| POST | `/projects/{id}/architecture/recommend` | Run architecture decision engine | — | `tier: "single"|"multi", components[], reasoning, rejected_alternatives[]` |
| POST | `/projects/{id}/architecture/accept` | Project Lead accepts recommendation | `recommendation_id` | `status: "accepted"` |
| POST | `/projects/{id}/architecture/override` | Manual override (FR-019) | `components[]` | new recommendation version |
| GET | `/projects/{id}/architecture` | Get current recommendation | — | recommendation object |

**Depends on:** Project Service, SDLC Service (per ordering in 06_DATA_ARCHITECTURE.md §5).

### 6.5 Data Architecture Service (FR-020–021)

| Method | Path | Purpose | Key Request Fields | Key Response Fields |
|---|---|---|---|---|
| POST | `/projects/{id}/data-architecture/recommend` | Recommend data ownership/storage for the user's project | — | `ownership_map, storage_choices[], reasoning` |
| GET | `/projects/{id}/data-architecture` | Get current recommendation | — | recommendation object |

**Depends on:** Architecture Service (must have an accepted architecture first — 409 if not).

### 6.6 Risk Service (FR-012–015)

| Method | Path | Purpose | Key Request Fields | Key Response Fields |
|---|---|---|---|---|
| POST | `/projects/{id}/risks/evaluate` | Run risk identification/scoring | — | `risks: [{id, description, probability, impact, score, mitigation}]` |
| GET | `/projects/{id}/risks` | Get current risk register | — | risk list |
| PATCH | `/projects/{id}/risks/{risk_id}` | Update status/mitigation | `status?, mitigation?` | updated risk |

**Depends on:** Project, Architecture, Task services (cross-cutting per 05_ARCHITECTURE.md §5) — re-evaluates on relevant state changes (FR-015).

### 6.7 Task Service (FR-022–024)

| Method | Path | Purpose | Key Request Fields | Key Response Fields |
|---|---|---|---|---|
| POST | `/projects/{id}/tasks/decompose` | Generate tasks from accepted architecture | — | `tasks: [{id, title, component, depends_on[]}]` |
| GET | `/projects/{id}/tasks` | List tasks + dependency graph | — | tasks, edges |
| PATCH | `/tasks/{task_id}` | Update task status | `status` | updated task |
| GET | `/projects/{id}/tasks/bottlenecks` | Get bottleneck flags | — | `bottlenecks: [{task_id, blocked_count, suggestion}]` |

**Depends on:** Architecture Service (409 if no accepted architecture).

### 6.8 Assignment Service (FR-025–027)

| Method | Path | Purpose | Key Request Fields | Key Response Fields |
|---|---|---|---|---|
| POST | `/projects/{id}/assignments/generate` | Assign tasks to members by skill | — | `assignments: [{task_id, member_id, reasoning}]` |
| PATCH | `/assignments/{id}` | Manually reassign | `member_id` | updated assignment |

**Depends on:** Task Service, User & Team Service (member skills).

### 6.9 Tool Recommendation Service (FR-028–029)

| Method | Path | Purpose | Key Request Fields | Key Response Fields |
|---|---|---|---|---|
| POST | `/tasks/{task_id}/tools/recommend` | Recommend tools for a task | — | `tools: [{name, category, reasoning}], rejected[]` |
| GET | `/tool-catalog` | List catalog entries | filters (category, skill_level) | catalog entries |

**Depends on:** Task Service (task type), User & Team Service (assignee skill level, active subscriptions).

### 6.10 Mentor Service (FR-030–032, FR-045–046)

| Method | Path | Purpose | Key Request Fields | Key Response Fields |
|---|---|---|---|---|
| POST | `/projects/{id}/mentor/ask` | Free-form question | `member_id, question` | `answer, sources[]` (referenced recommendation IDs) |
| GET | `/recommendations/{id}/why` | Explain a specific recommendation | — | `reasoning, inputs_used, rejected_alternatives[]` |
| GET | `/projects/{id}/mentor/guidance` | Proactive guidance check | — | `flags: [{type, message}]` |

**Depends on:** all domain services (orchestration layer, 05_ARCHITECTURE.md §6).

### 6.11 GitHub Integration Service (FR-033–036)

| Method | Path | Purpose | Key Request Fields | Key Response Fields |
|---|---|---|---|---|
| POST | `/projects/{id}/github/link` | Connect/create repo | `repo_url?` (omit to create new) | `repo_url, status` |
| POST | `/projects/{id}/github/sync-tasks` | Create issues from tasks | — | `issues: [{task_id, issue_url}]` |
| GET | `/projects/{id}/github/status` | Get PR/issue status | — | linked status per task |

**Depends on:** Task Service (per NFR-007, must degrade gracefully if GitHub is unreachable — R-004/R-008).

### 6.12–6.14 DevOps, Documentation, Presentation Services

Follow the same pattern (`recommend`/`generate` POST endpoint, `GET` for current state) — deferred to a follow-up pass since these are "Could-have" priority (02_SRS.md §6) and shouldn't block Phase 1–2 contract work.

## 7. OpenAPI Usage

Each service maintains its own `openapi.yaml`. Example, showing the pattern for one endpoint (Architecture Service):

```yaml
openapi: 3.0.3
info:
  title: TeamForge Architecture Service
  version: 1.0.0
paths:
  /v1/projects/{id}/architecture/recommend:
    post:
      summary: Run the architecture decision engine for a project
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Recommendation generated
          content:
            application/json:
              schema:
                type: object
                properties:
                  tier:
                    type: string
                    enum: [single, multi]
                  components:
                    type: array
                    items:
                      type: object
                      properties:
                        name: { type: string }
                        responsibility: { type: string }
                  reasoning:
                    type: string
                  rejected_alternatives:
                    type: array
                    items:
                      type: object
                      properties:
                        option: { type: string }
                        reason_rejected: { type: string }
        '409':
          description: No accepted SDLC recommendation exists yet
```

Agent instruction (to carry into 12_AGENT_INSTRUCTIONS.md later): generate/update the relevant `openapi.yaml` *before* implementing an endpoint, and implement to match it — not the reverse.

## 8. Dependencies Summary (Call Graph)

Restates 06_DATA_ARCHITECTURE.md §5 as an API-level dependency graph:

```
User & Team ← (base, no dependencies)
Project ← User & Team
SDLC ← Project, User & Team
Architecture ← Project, SDLC
Data Architecture ← Architecture
Task ← Architecture
Assignment ← Task, User & Team
Tool Recommendation ← Task, User & Team
Risk ← Project, Architecture, Task (cross-cutting)
GitHub Integration ← Task
Mentor ← all of the above (orchestration)
```

A service calling "up" this graph (e.g., Task Service calling Assignment Service) is a contract violation and should be treated as an architecture bug, not a style issue.

## 9. Events

Per ADR-003 (07/08 docs), **no event bus exists in Phase 1** — all the above is synchronous request/response. However, so that a future event-driven pass doesn't invent ad hoc names, the *logical* event types this system will eventually emit are named now:

| Event (future) | Emitted by | Would notify |
|---|---|---|
| `ProjectCreated` | Project Service | (future) Analytics, if ever built per ADR-008 |
| `ArchitectureAccepted` | Architecture Service | Task Service, Data Architecture Service |
| `TaskStatusChanged` | Task Service | Risk Service, Mentor Service, GitHub Integration Service |
| `RiskScoreChanged` | Risk Service | Mentor Service |
| `MemberDisconnected` | (future laptop-agent concept, out of scope per 01_PROJECT_VISION.md §8) | Risk Service, Task Service |

These are **not implemented** — they exist here only so that when ADR-003 is revisited, the names/ownership are already thought through rather than invented under time pressure.

---

*Next document, per the original plan: 10 — DevOps Plan, or 12 — Agent Instructions, whichever you'd rather define next.*
