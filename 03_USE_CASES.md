# TeamForge AI — Use Cases & User Journeys

**Document:** 03 — Use Cases & User Journeys
**Status:** Draft v0.2 — Repositioned
**Traces to:** 02_SRS.md (Functional Requirements)

---

## 1. User Roles

Roles updated to reflect general software teams rather than hackathon-only framing (FR-003 now names the role "Team Leader or Project Owner").

| Role | Description |
|---|---|
| Project Lead | Creates the project, owns team setup, accepts/overrides Mentor recommendations on the team's behalf (FR-003) |
| Developer | A team member executing assigned tasks — the default role, regardless of experience level |
| Early-Career Developer | A team member with limited professional/project experience; needs tasks scoped to their level and more guided explanations (FR-026, FR-032) — replaces the earlier "Beginner Developer" label |
| AI-Assisted Developer | A member whose primary workflow relies heavily on AI coding tools; needs tool recommendations matched to that workflow (FR-028) — this is a workflow persona, not an experience level, and can apply to any developer |
| Mentor | Not a person — the AI reasoning layer itself, referenced here to define what it does at each stage |

## 2. Primary Use Case: Project → Engineering Plan → Development → Integration → Delivery

This use case now explicitly extends past initial planning into the full lifecycle described in 01_PROJECT_VISION.md §6 (objectives 12–13), not just the first task assignment.

### 2.1 Stage One — Engineering Plan (Setup Through Task Assignment)

```
Project Lead
    │
    ▼
Creates project (FR-001)
    │
    ▼
Adds team — size, members, skills, experience, active subscriptions (FR-002, FR-004)
    │
    ▼
Adds project description, problem statement, objectives (FR-005)
    │
    ▼
Mentor analyzes requirements (FR-006, FR-007)
    │
    ├── Ambiguous? → Mentor asks clarifying questions → Project Lead answers
    │
    ▼
Mentor runs feasibility analysis (FR-008, FR-009)
    │
    ├── Scope too large? → Mentor proposes reduced/phased scope → Project Lead accepts/edits
    │
    ▼
Mentor recommends SDLC approach (FR-010, FR-011)
    │
    ▼
Mentor recommends architecture — monolith, modular, or multi-service (FR-016–018)
    │
    ▼
Project Lead reviews architecture recommendation + reasoning
    │
    ├── Rejects/adjusts → Mentor regenerates (FR-019)
    │
    ▼
Project Lead accepts plan
    │
    ▼
Mentor generates risk register (FR-012–014)
    │
    ▼
Mentor decomposes architecture into tasks + dependencies (FR-022, FR-023)
    │
    ▼
Mentor assigns tasks by skill level (FR-025–027)
    │
    ▼
Each developer sees their task(s) with reasoning attached (FR-045)
```

### 2.2 Stage Two — Development → Integration → Delivery

```
Team begins development, guided by accepted plan
    │
    ▼
Mentor recommends tools per task (FR-028, FR-029)
    │
    ▼
Project connects to source control (FR-033); repo structure aligned to architecture (FR-034)
    │
    ▼
Tasks synced as issues, linked to assignees (FR-035)
    │
    ▼
Developers work; PR status tracked against tasks (FR-036)
    │
    ▼
Mentor recommends CI/CD strategy and baseline config where justified (FR-037, FR-038)
    │
    ▼
Mentor recommends containerization/monitoring only if architecture justifies it (FR-039)
    │
    ▼
Documentation generated and kept aligned with the accepted plan (FR-040–042)
    │
    ▼
Presentation/communication material generated for reviews, demos, or evaluations (FR-043, FR-044)
    │
    ▼
Delivery — project reaches a reviewable/deployable state
```

## 3. Individual Journeys

### 3.1 Project Lead

1. Creates the project and enters the problem statement/objectives.
2. Adds each teammate, their skills, and their active subscriptions/tool licenses (or invites them to self-report).
3. Reviews Mentor's feasibility, SDLC, and architecture recommendations.
4. Accepts the plan, or pushes back and asks the Mentor to explain/reconsider (FR-046).
5. Monitors overall progress and the risk register as development proceeds.
6. Is notified first when the Mentor detects a bottleneck (FR-024) or an at-risk dependency (FR-015).

### 3.2 Developer

1. Sees their assigned task(s) with reasoning for why it was assigned to them.
2. Sees the task's dependencies — what it needs before starting, and what depends on it finishing.
3. Works on the task; updates task status as they progress.
4. Can ask the Mentor architecture/ownership questions grounded in the current plan (FR-030).

### 3.3 Early-Career Developer

1. Sees a task scoped to their stated experience level (FR-026).
2. Gets more detailed explanation of why this task and how it fits the bigger picture (FR-032) — more scaffolding than an experienced developer would see for the same feature.
3. Can request a "stretch" task explicitly if they want more challenge (FR-026 override path).
4. If they fall behind or seem stuck, the Mentor proactively offers guidance rather than waiting to be asked (FR-031).

### 3.4 AI-Assisted Developer

1. Sees their task along with recommended AI/dev tools suited to that specific task and their active subscriptions/credits (FR-028, FR-029) — reasoned, not generic.
2. Can ask the Mentor for the reasoning behind a tool recommendation, and see rejected alternatives.
3. Executes the task using AI-assisted workflows; updates status same as any other developer.

### 3.5 Mentor

1. Runs analysis at each stage of the primary use case (requirements → feasibility → SDLC → architecture → risk → tasks → assignment → development → integration → delivery).
2. Attaches reasoning to every recommendation it produces (FR-045/046).
3. Continuously watches project state: task status, dependency graph, risk register — re-flagging when something changes materially (FR-015, FR-024).
4. Answers ad hoc questions from any team member, tailored to their role/experience (FR-030, FR-032).

## 4. Secondary Use Case: Mid-Project Disruption Handling

```
Team member goes offline / falls behind
    │
    ▼
Mentor detects dependency at risk (FR-015, FR-024)
    │
    ▼
Mentor notifies Project Lead + affected teammates
    │
    ▼
Mentor proposes mitigation:
    │
    ├── Reassign task to another member
    ├── Generate a mock interface so dependent work can continue
    └── Reduce scope of the affected component
    │
    ▼
Project Lead accepts a mitigation
    │
    ▼
Mentor updates task graph, risk register, and affected assignments
```

## 5. Secondary Use Case: "Why" Query (Explainability)

```
Any team member
    │
    ▼
Selects a recommendation (architecture choice, task assignment, tool suggestion)
    │
    ▼
Asks "why?"
    │
    ▼
Mentor responds with:
    - the specific inputs that drove the recommendation
    - the alternative(s) considered
    - why the alternative(s) were not chosen
```

---

*Next document: 04 — SDLC & Engineering Methodology (existing content remains valid — it was already framed generically; hackathons remain one worked example, not the defining context).*
