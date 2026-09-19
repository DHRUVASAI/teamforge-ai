# TeamForge AI — Frontend Integration & Contract Specification

**Document:** 12 — Frontend Integration & Contract Specification  
**Status:** Approved for Implementation  
**Audience:** Frontend Engineers / UI Collaborators  
**Traces to:** `02_SRS.md`, `03_USE_CASES.md`, `05_ARCHITECTURE.md`, `06_DATA_ARCHITECTURE.md`, `09_API_CONTRACTS.md`, `11_TOOL_CATALOG.md`

---

## 1. Overview & Integration Philosophy

This document specifies the exact contract for building the TeamForge AI frontend. It details **every screen, every user input, every API payload, every backend response, and every output component**.

### Integration Principles:
1. **Contract-First & Decoupled:** You can build and test the entire UI using the provided TypeScript types and mock JSON payloads without waiting for the backend to be running.
2. **Standard API Base URL:** All endpoints are served under `/api/v1/{service}/...` (e.g. `http://localhost:8000/api/v1/...` via env var `VITE_API_URL` or `NEXT_PUBLIC_API_BASE_URL`).
3. **Authentication:** All requests (except login/register) send an `Authorization: Bearer <token>` header.
4. **Uniform Error Handling:** When an API fails, the backend always returns a standard JSON error shape.

### 1.1 Mobile-First Blueprint Directive
Per our core product strategy, **this frontend MUST be designed and built mobile-first.** Do not build a wide desktop dashboard and attempt to shrink it to phone size later.
- **Navigation:** Core navigation (Team Hub, Setup, SDLC, Tasks) should rely on bottom tab bars or floating action buttons on mobile screens, which can expand to a left-hand sidebar on desktop.
- **Layout & Typography:** Use vertical card stacks for Problem Statements, Tasks, and Tool Recommendations instead of wide, multi-column data tables.
- **Touch Targets:** Ensure all actionable buttons—especially core progression buttons (e.g., "Accept Architecture", "Generate Tasks")—meet the 44x44pt touch minimum.
- **Progressive Disclosure:** Hide deep metadata (like raw JSON rationale, or deep formula explanations) behind bottom-sheet drawers or collapsible accordions to avoid overwhelming the vertical scroll space on mobile devices.

---

## 2. Global API Conventions & Error Format

### 2.1 Request Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### 2.2 Standard Error Response Shape (HTTP 400, 401, 403, 404, 409, 422, 500)
```json
{
  "error": {
    "code": "ARCHITECTURE_NOT_ACCEPTED",
    "message": "You must review and accept an architecture recommendation before generating engineering tasks.",
    "details": {}
  }
}
```

---

## 3. Application Screen Flow & State Machine

```
[1. Login / Register]
       │
       ▼
[2. Team & Member Profile Setup] (Skills, Experience, Active Subscriptions)
       │
       ▼
[3. Project Definition] (Problem statement, Time budget, Constraints)
       │
       ▼
[4. Requirements & Feasibility Review] (Extract capabilities, Ambiguities Q&A, Feasibility score)
       │
       ▼
[5. SDLC Recommendation] (Model choice, Rationale, Rejected alternatives)
       │
       ▼
[6. Architecture & Data Studio] (Tiers, Component boundaries, Data ownership, Accept/Override)
       │
       ▼
[7. Workspace Dashboard] ── Multi-tab central hub:
       ├── Tab A: Task Board & Dependency Graph (Task DAG, Skill-matching, Tool stack recommendations)
       ├── Tab B: Risk Register & Health (Risk scoring, Triggers, Mitigations)
       ├── Tab C: AI Mentor Chat & "Why?" Explainer (Contextual Q&A, Proactive guidance)
       └── Tab D: DevOps & Deliverables (GitHub sync, Generated README, Pitch outline)
```

---

## 4. Screen-by-Screen Input / Output Specifications

---

### Screen 1: Authentication & Onboarding
* **Route:** `/login` & `/register`
* **Purpose:** Register team accounts and obtain JWT session token.

#### 1. Inputs (User Actions / Form Fields):
* **Register:** `Full Name` (text), `Email` (email), `Password` (password).
* **Login:** `Email` (email), `Password` (password).

#### 2. API Request:
* `POST /api/v1/auth/register` or `POST /api/v1/auth/login`
```json
{
  "email": "lead@team.dev",
  "password": "SecurePassword123!",
  "name": "Alex Rivera"
}
```

#### 3. API Response:
* **HTTP 200/201:**
```json
{
  "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "name": "Alex Rivera",
  "email": "lead@team.dev"
}
```

#### 4. Frontend Outputs & UI Elements:
* Standard form with error banners (e.g., "Invalid credentials").
* On success, store `token` in `localStorage`/`sessionStorage` and navigate to `/teams/setup` or `/projects`.

---

### Screen 2: Team & Member Profile Setup
* **Route:** `/teams/setup` or `/teams/:teamId/members`
* **Purpose:** Define team name, invite/add members, record member skill levels, and record active tool/AI/cloud subscriptions (FR-002, FR-004).

#### 1. Inputs (User Actions / Form Fields):
* **Team Name:** Text input.
* **Member List:** Repeating card/table with:
  * `User ID` or `Email / Name`
  * `Role`: Dropdown (`Project Lead`, `Developer`, `Early-Career Developer`, `AI-Assisted Developer`)
  * `Skills`: Dynamic tag/list input (`name`: e.g. "React", "Python", "Docker"; `level`: `Beginner` | `Intermediate` | `Advanced`)
  * `Active Subscriptions & Licenses`: Checkbox/multi-select + details:
    * Tool: (e.g. `GitHub Copilot`, `Claude Pro`, `ChatGPT Plus`, `Cursor Pro`, `AWS Credits`, `Vercel Pro`, `JetBrains`)
    * Tier: (`Free`, `Pro`, `Team`, `Credits`)
    * Quota / Credits notes: optional text (e.g. "$100 credit remaining")

#### 2. API Requests:
* `POST /api/v1/teams`
```json
{
  "name": "Alpha Builders"
}
```
* `POST /api/v1/teams/{team_id}/members`
```json
{
  "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "role": "team_leader",
  "skills": [
    { "name": "TypeScript", "level": "Advanced" },
    { "name": "FastAPI", "level": "Intermediate" },
    { "name": "PostgreSQL", "level": "Intermediate" }
  ],
  "subscriptions": [
    { "tool_name": "Claude Pro", "tier": "Pro" },
    { "tool_name": "Cursor Pro", "tier": "Pro" },
    { "tool_name": "AWS", "tier": "Credits", "credits": "$200 free tier" }
  ]
}
```

#### 3. API Response:
* **HTTP 201 Created:**
```json
{
  "member_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "team_id": "e0a1b2c3-d4e5-6f7a-8b9c-0d1e2f3a4b5c",
  "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "role": "team_leader",
  "skills": [
    { "name": "TypeScript", "level": "Advanced" }
  ],
  "subscriptions": [
    { "tool_name": "Claude Pro", "tier": "Pro" }
  ]
}
```

#### 4. Frontend Outputs & UI Elements:
* Team summary card showing team size, skill tags with badges (`Beginner` = green, `Intermediate` = blue, `Advanced` = purple), and badge icons for active subscriptions (e.g., "⚡ Cursor Pro", "☁️ AWS Credits").
* "Continue to Project Setup" button $\rightarrow$ routes to `/projects/new`.

---

### Screen 3: Project Definition & Problem Statement
* **Route:** `/projects/new`
* **Purpose:** Input problem statement, objectives, time budget, and project constraints (FR-005).

#### 1. Inputs (User Actions / Form Fields):
* `Project Name`: Text input.
* `Problem Statement`: Rich textarea / markdown input (e.g. "College hackathon teams struggle to divide work...").
* `Proposed Solution / Idea`: Textarea (e.g. "An AI engineering intelligence platform...").
* `Time Budget`: Dropdown + number (`Hours` | `Days` | `Weeks` | `Months`, e.g. "48 Hours" or "3 Months").
* `Target Deliverable`: Dropdown (`Working Prototype / Hackathon Demo`, `Production Application`, `Academic Capstone`).
* `Explicit Constraints`: Free-form tag list (e.g., "Must use Python", "No paid cloud services").

#### 2. API Request:
* `POST /api/v1/projects`
```json
{
  "team_id": "e0a1b2c3-d4e5-6f7a-8b9c-0d1e2f3a4b5c",
  "name": "TeamForge AI",
  "problem_statement": "Student teams suffer from single-developer bottlenecks and lack architecture direction during software builds.",
  "idea": "An AI-powered engineering mentor that analyzes requirements, recommends architectures, and coordinates parallel tasks.",
  "time_budget": {
    "value": 48,
    "unit": "hours"
  },
  "deliverable_type": "prototype",
  "constraints": ["Zero budget", "Relational storage preferred"]
}
```

#### 3. API Response:
* **HTTP 201 Created:**
```json
{
  "project_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "team_id": "e0a1b2c3-d4e5-6f7a-8b9c-0d1e2f3a4b5c",
  "name": "TeamForge AI",
  "status": "draft",
  "created_at": "2026-09-15T11:00:00Z"
}
```

#### 4. Frontend Outputs & UI Elements:
* Direct redirect to the Requirements & Feasibility Screen (`/projects/:id/feasibility`).

---

### Screen 4: Requirements & Feasibility Review
* **Route:** `/projects/:id/feasibility`
* **Purpose:** Mentor extracts capabilities, flags ambiguous requirements for user answer, and presents feasibility verdict (FR-006–009).

#### 1. Inputs (User Actions):
* Trigger button: "Run Requirements & Feasibility Analysis".
* Clarification Q&A Form: If ambiguities are returned, input fields to answer specific questions.
* Scope Adjustment: "Accept Proposed Phased Scope" or "Edit Scope".

#### 2. API Request:
* `POST /api/v1/projects/{id}/analyze` (empty body or with clarification answers).

#### 3. API Response:
* **HTTP 200 OK:**
```json
{
  "capabilities": [
    { "id": "CAP-01", "name": "Team Profiling & Subscription Tracking", "complexity": "Low" },
    { "id": "CAP-02", "name": "SDLC & Architecture Decision Engine", "complexity": "Medium" },
    { "id": "CAP-03", "name": "Autonomous Task Dependency DAG", "complexity": "High" }
  ],
  "ambiguities": [
    {
      "id": "AMB-01",
      "question": "Will the platform support multi-cloud deployments in Phase 1?",
      "suggested_answer": "No, single cloud or local deployment is sufficient for the initial build."
    }
  ],
  "feasibility": {
    "verdict": "feasible_with_adjustments",
    "score": 7.8,
    "total_estimated_hours": 42,
    "available_team_capacity_hours": 48,
    "reasoning": "Scope fits the 48-hour window if advanced integrations (Jira, Kubernetes) are deferred to Phase 3.",
    "proposed_scope_reduction": [
      "Defer live event bus to Phase 3",
      "Focus on Modular Monolith over distributed microservices"
    ]
  }
}
```

#### 4. Frontend Outputs & UI Elements:
* **Capabilities Breakdown Card:** List of extracted functional modules with complexity badges.
* **Ambiguity Resolution Dialog:** Interactive question cards with pre-filled recommendations; user clicks "Confirm Clarifications".
* **Feasibility Gauge / Banner:**
  * 🟢 `Feasible` / 🟡 `Feasible with Adjustments` / 🔴 `Scope Exceeded`.
  * Detailed reasoning box explaining capacity vs complexity.
* Button: "Proceed to SDLC Recommendation" $\rightarrow$ `/projects/:id/sdlc`.

---

### Screen 5: SDLC Recommendation & Methodology
* **Route:** `/projects/:id/sdlc`
* **Purpose:** Displays recommended SDLC model, decision reasoning, rejected models with reasons, and impact on task workflow (FR-010, FR-011, ADR-006).

#### 1. Inputs (User Actions):
* Button: "Generate SDLC Recommendation".
* Selection Radio / Override: Allow Project Lead to select alternative model if desired.
* Button: "Accept SDLC Recommendation".

#### 2. API Request:
* `POST /api/v1/projects/{id}/sdlc/recommend`

#### 3. API Response:
* **HTTP 200 OK:**
```json
{
  "recommendation_id": "sdlc-rec-001",
  "project_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "recommended_model": "Iterative (Lightweight)",
  "reasoning": "With a 48-hour time budget and 3 developers, formal Agile Scrum ceremonies introduce unnecessary overhead. Lightweight iterative development allows immediate testable passes.",
  "rejected_alternatives": [
    {
      "model": "Agile / Full Scrum",
      "reason_rejected": "Team size (3) and time budget (48h) do not support multi-week sprint planning, backlog grooming, or ceremony overhead."
    },
    {
      "model": "Waterfall",
      "reason_rejected": "Requirements still contain minor uncertainty; a single-pass sequential waterfall risks building the wrong interfaces without feedback."
    }
  ],
  "workflow_impact": {
    "task_generation_style": "Iteration Passes (Pass 1: Core Foundation, Pass 2: Intelligence Engines, Pass 3: Review UI)",
    "progress_tracking": "Iteration completion + Demoable state indicator"
  }
}
```

#### 4. Frontend Outputs & UI Elements:
* **Hero Recommendation Card:** Highlighted Recommended SDLC badge with an explanation paragraph.
* **Rejected Alternatives Accordion / Table:** Clearly listing why Waterfall, Scrum, Spiral, etc., were rejected for this project.
* **Workflow Impact Box:** Explaining how tasks will be structured in later stages.
* Action: "Accept & Continue to Architecture" $\rightarrow$ `/projects/:id/architecture`.

---

### Screen 6: Architecture & Data Ownership Studio
* **Route:** `/projects/:id/architecture`
* **Purpose:** Visual architecture review, component boundaries, data ownership mapping, rejected architecture alternatives, and Project Lead Accept/Override (FR-016–021, ADR-001, ADR-007).

#### 1. Inputs (User Actions):
* Trigger: "Generate Architecture & Data Design".
* Customization / Override Form (FR-019):
  * Add / Rename / Delete components.
  * Adjust storage choices (PostgreSQL, Redis, S3).
* Action: "Accept Architecture Plan".

#### 2. API Requests:
* Generate: `POST /api/v1/projects/{id}/architecture/recommend`
* Accept: `POST /api/v1/projects/{id}/architecture/accept`
```json
{
  "recommendation_id": "arch-rec-001"
}
```
* Override (if customized): `POST /api/v1/projects/{id}/architecture/override`
```json
{
  "tier": "modular_monolith",
  "components": [
    { "name": "Auth & Team", "responsibility": "User management and member skills" },
    { "name": "Intelligence Engine", "responsibility": "SDLC and architecture decision rules" }
  ]
}
```

#### 3. API Response:
* **HTTP 200 OK:**
```json
{
  "recommendation_id": "arch-rec-001",
  "tier": "Modular Monolith",
  "deployment_recommendation": "Single deployable package with strict internal module API boundaries.",
  "reasoning": "Team size (3 devs) and early lifecycle do not justify the distributed complexity, deployment overhead, and networking latency of 14 separate microservices.",
  "rejected_alternatives": [
    {
      "tier": "Full Microservices",
      "reason_rejected": "Operational overhead (Kubernetes, service discovery, distributed tracing) exceeds team capacity."
    },
    {
      "tier": "Unstructured Monolith",
      "reason_rejected": "Lacks clean module boundaries, leading to tight coupling and single-developer bottleneck."
    }
  ],
  "components": [
    {
      "id": "comp-1",
      "name": "User & Team Module",
      "responsibility": "Auth, team profiles, member skills, and active subscriptions",
      "data_ownership": {
        "storage": "PostgreSQL",
        "schema_tables": ["users", "teams", "member_skills", "member_subscriptions"]
      }
    },
    {
      "id": "comp-2",
      "name": "Decision Engine Module",
      "responsibility": "Rule-based filtering and LLM reasoning orchestration",
      "data_ownership": {
        "storage": "PostgreSQL",
        "schema_tables": ["sdlc_recommendations", "arch_recommendations"]
      }
    },
    {
      "id": "comp-3",
      "name": "Task & Assignment Module",
      "responsibility": "Task DAG, bottleneck detection, and skill-based assignment",
      "data_ownership": {
        "storage": "PostgreSQL",
        "schema_tables": ["tasks", "task_dependencies", "task_assignments"]
      }
    }
  ]
}
```

#### 4. Frontend Outputs & UI Elements:
* **Visual Architecture Diagram / Component Cards:**
  * Visual cards showing each module, its stated responsibility, and its isolated database schema.
  * Explicit note: *"No shared tables — communication via internal APIs only."*
* **Rejected Architecture Trade-Offs:** Explaining why microservices were rejected.
* **Accept Button (Project Lead only):** Locks the architecture plan and enables task decomposition.

---

### Screen 7: Workspace Dashboard — Tab A: Tasks & Workstreams
* **Route:** `/projects/:id/workspace` (Default Tab: Tasks)
* **Purpose:** Interactive Task Board (Kanban / DAG view), task dependencies, assignee skill-match reasoning, bottleneck alerts, and task-specific tool recommendations (FR-022–029).

#### 1. Inputs (User Actions):
* Trigger: "Decompose Architecture into Tasks" (`POST /api/v1/projects/{id}/tasks/decompose`).
* Generate Assignments: "Auto-Assign Tasks by Skill Level" (`POST /api/v1/projects/{id}/assignments/generate`).
* Status Change: Drag & drop card or status dropdown (`PATCH /api/v1/tasks/{task_id}` with `status`: `todo` | `in_progress` | `review` | `done`).
* Task Click: Opens **Task Detail Drawer**.
* Inside Drawer: "Get Tool Recommendation" (`POST /api/v1/tasks/{task_id}/tools/recommend`).

#### 2. API Requests:
* Update Task Status: `PATCH /api/v1/tasks/{task_id}`
```json
{
  "status": "in_progress"
}
```
* Get Tool Recommendation: `POST /api/v1/tasks/{task_id}/tools/recommend` (takes task type, assignee skills, and assignee's active subscriptions into account).

#### 3. API Response (Task Decomposition & Assignment):
```json
{
  "tasks": [
    {
      "id": "tsk-001",
      "title": "Implement User & Subscription Schema",
      "component": "User & Team Module",
      "status": "in_progress",
      "estimated_hours": 3,
      "depends_on": [],
      "assignee": {
        "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "name": "Alex Rivera",
        "experience_level": "Advanced",
        "reasoning": "Alex has advanced TypeScript and PostgreSQL skills matching the database migration requirements."
      }
    },
    {
      "id": "tsk-002",
      "title": "Build Rule-Based SDLC Filter",
      "component": "Decision Engine Module",
      "status": "todo",
      "estimated_hours": 4,
      "depends_on": ["tsk-001"],
      "assignee": {
        "user_id": "c2d3e4f5-a6b7-8c9d-0e1f-2a3b4c5d6e7f",
        "name": "Jordan Lee",
        "experience_level": "Intermediate",
        "reasoning": "Jordan has intermediate Python skills; task provides structured boundary with explicit test specifications."
      }
    }
  ],
  "bottlenecks": [
    {
      "task_id": "tsk-001",
      "blocked_tasks_count": 2,
      "severity": "medium",
      "suggestion": "Jordan can start on mock interface data while Alex completes the schema."
    }
  ]
}
```

#### 4. API Response (Tool Recommendation for a Task):
```json
{
  "task_id": "tsk-001",
  "recommended_tools": [
    {
      "name": "Cursor Pro",
      "category": "AI Coding Assistant",
      "reasoning": "Assignee holds an active Cursor Pro subscription; recommended for rapid schema generation and type definitions.",
      "is_active_subscription": true
    },
    {
      "name": "FastAPI + Pydantic",
      "category": "Backend Framework",
      "reasoning": "Provides strict OpenAPI schema validation matching the API contract specification.",
      "is_active_subscription": false
    }
  ],
  "rejected_alternatives": [
    {
      "tool": "Django Full Stack",
      "reason_rejected": "Heavyweight ORM and built-in templates are unnecessary for a focused REST API module."
    }
  ]
}
```

#### 5. Frontend Outputs & UI Elements:
* **Kanban Board Columns:** `To Do`, `In Progress`, `Review`, `Done`.
* **Task Card Badges:**
  * Component Tag (e.g. `[User & Team]`).
  * Dependency Indicator: 🔒 `Blocked by Task #001` or 🔓 `Ready`.
  * Assignee Avatar with experience chip.
* **Bottleneck Warning Banner:** Highlighted banner if a task blocks multiple workstreams with one-click mitigation advice.
* **Task Detail Drawer:**
  * Full task description & dependency tree.
  * "Why was this assigned to me?" rationale box.
  * Recommended Tool Stack with "⚡ Active Subscription" badge for tools the user already pays for.

---

### Screen 8: Workspace Dashboard — Tab B: Risk Register & Health
* **Route:** `/projects/:id/workspace` (Tab: Risks)
* **Purpose:** Live risk matrix, probability $\times$ impact scoring, automated mitigations, and status toggles (FR-012–015).

#### 1. Inputs (User Actions):
* Re-evaluate Risks: "Run Risk Health Check" (`POST /api/v1/projects/{id}/risks/evaluate`).
* Update Risk Status: Dropdown (`PATCH /api/v1/projects/{id}/risks/{risk_id}` with `status`: `Open` | `Monitoring` | `Mitigated` | `Closed`).

#### 2. API Response:
```json
{
  "risks": [
    {
      "id": "R-001",
      "title": "LLM Hallucination on Architecture Decisions",
      "probability": 3,
      "impact": 3,
      "score": 9,
      "severity": "High",
      "trigger": "Complex multi-service constraint inputs",
      "mitigation": "Enforce deterministic rule-based filter before LLM ranking; validate all outputs against 08_ADR.md.",
      "owner": "Jordan Lee",
      "status": "Monitoring"
    },
    {
      "id": "R-003",
      "title": "Third-Party AI Quota Depletion",
      "probability": 2,
      "impact": 2,
      "score": 4,
      "severity": "Medium",
      "trigger": "Heavy test generation during development",
      "mitigation": "Parallelize across team members' individual Cursor/Claude subscriptions rather than a single account.",
      "owner": "Alex Rivera",
      "status": "Mitigated"
    }
  ]
}
```

#### 3. Frontend Outputs & UI Elements:
* **Risk Score Matrix / Table:** Columns for ID, Risk Title, Probability ($1-3$), Impact ($1-3$), Score ($1-9$), Mitigation Plan, and Status Tag.
* High-risk items ($6-9$) styled with red warning indicators.

---

### Screen 9: Workspace Dashboard — Tab C: AI Engineering Mentor
* **Route:** `/projects/:id/workspace` (Tab: Mentor)
* **Purpose:** Context-aware Q&A, explainable "Why?" queries, and proactive engineering advice (FR-030–032, FR-045–046).

#### 1. Inputs (User Actions):
* Chat Input Box: "Ask a question about your project, architecture, or task..."
* Quick Action Chips:
  * *"Why was this architecture recommended?"*
  * *"How does my task connect to the rest of the system?"*
  * *"What should I test first?"*

#### 2. API Request:
* `POST /api/v1/projects/{id}/mentor/ask`
```json
{
  "member_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "question": "Why are we using PostgreSQL instead of MongoDB?"
}
```
* Or dedicated Why endpoint: `GET /api/v1/recommendations/{id}/why`

#### 3. API Response:
```json
{
  "answer": "PostgreSQL was selected because your project data (users, teams, tasks, and dependency graphs) is inherently relational with strict foreign key relationships. Furthermore, relational consistency is required for the task DAG, and your team already has intermediate SQL experience.",
  "sources": ["ADR-002", "06_DATA_ARCHITECTURE.md#L63"],
  "rejected_alternatives": [
    {
      "option": "MongoDB / Document DB",
      "reason_rejected": "Document stores lack native relational integrity enforcement for multi-table task dependencies and risk matrices."
    }
  ]
}
```

#### 4. Frontend Outputs & UI Elements:
* Clean, responsive Chat Bubble UI.
* Response bubbles include formatted markdown, source citations (e.g., `[ADR-002]`), and a structured "Rejected Alternatives" callout box.
* Proactive Guidance Bell / Badge on the navbar when the system notices blocked tasks or at-risk dependencies.

---

### Screen 10: Workspace Dashboard — Tab D: DevOps & Delivery
* **Route:** `/projects/:id/workspace` (Tab: Delivery)
* **Purpose:** GitHub repo link, automatic issue creation from tasks, generated README, and presentation outline (FR-033–044).

#### 1. Inputs (User Actions):
* `GitHub Repo URL`: Text input or "Create Repo for me" button.
* Button: "Sync Tasks to GitHub Issues" (`POST /api/v1/projects/{id}/github/sync-tasks`).
* Button: "Download Consolidated Architecture README".
* Button: "Generate Presentation Deck Outline & Q&A".

#### 2. API Response (GitHub Sync):
```json
{
  "repo_url": "https://github.com/team-alpha/teamforge-ai",
  "synced_issues": [
    { "task_id": "tsk-001", "issue_number": 1, "issue_url": "https://github.com/team-alpha/teamforge-ai/issues/1" },
    { "task_id": "tsk-002", "issue_number": 2, "issue_url": "https://github.com/team-alpha/teamforge-ai/issues/2" }
  ]
}
```

#### 3. Frontend Outputs & UI Elements:
* Status card showing connected repository with direct links to created GitHub issues.
* Markdown preview card of the generated Architecture Document with a "Copy to Clipboard" / "Download .md" button.
* Pitch Outline Card with bulleted problem/solution talking points and anticipated technical defense Q&A.

---

## 5. TypeScript Interfaces (Copy-Pasteable for Frontend)

```typescript
// ==========================================
// 1. User & Team Models
// ==========================================
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface MemberSkill {
  name: string;
  level: SkillLevel;
}

export interface MemberSubscription {
  tool_name: string;
  tier: 'Free' | 'Pro' | 'Team' | 'Credits';
  credits?: string;
}

export interface TeamMember {
  member_id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'team_leader' | 'developer' | 'early_career' | 'ai_assisted';
  skills: MemberSkill[];
  subscriptions: MemberSubscription[];
}

export interface Team {
  team_id: string;
  name: string;
  members: TeamMember[];
}

// ==========================================
// 2. Project Models
// ==========================================
export interface TimeBudget {
  value: number;
  unit: 'hours' | 'days' | 'weeks' | 'months';
}

export interface Project {
  project_id: string;
  team_id: string;
  name: string;
  problem_statement: string;
  idea: string;
  time_budget: TimeBudget;
  deliverable_type: 'prototype' | 'production' | 'capstone';
  constraints: string[];
  status: 'draft' | 'analyzed' | 'planned' | 'in_progress' | 'completed';
}

// ==========================================
// 3. Recommendation Models
// ==========================================
export interface RejectedAlternative {
  option: string;
  reason_rejected: string;
}

export interface SDLCRecommendation {
  recommendation_id: string;
  project_id: string;
  recommended_model: string;
  reasoning: string;
  rejected_alternatives: RejectedAlternative[];
}

export interface ComponentDataOwnership {
  storage: string;
  schema_tables: string[];
}

export interface ArchitectureComponent {
  id: string;
  name: string;
  responsibility: string;
  data_ownership: ComponentDataOwnership;
}

export interface ArchitectureRecommendation {
  recommendation_id: string;
  project_id: string;
  tier: string;
  deployment_recommendation: string;
  reasoning: string;
  rejected_alternatives: RejectedAlternative[];
  components: ArchitectureComponent[];
  status: 'recommended' | 'accepted' | 'overridden';
}

// ==========================================
// 4. Tasks & Risk Models
// ==========================================
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface TaskAssignee {
  user_id: string;
  name: string;
  experience_level: SkillLevel;
  reasoning: string;
}

export interface Task {
  id: string;
  title: string;
  component: string;
  status: TaskStatus;
  estimated_hours: number;
  depends_on: string[];
  assignee?: TaskAssignee;
}

export interface BottleneckFlag {
  task_id: string;
  blocked_tasks_count: number;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

export interface RecommendedTool {
  name: string;
  category: string;
  reasoning: string;
  is_active_subscription: boolean;
}

export interface Risk {
  id: string;
  title: string;
  probability: 1 | 2 | 3;
  impact: 1 | 2 | 3;
  score: number;
  severity: 'Low' | 'Medium' | 'High';
  trigger: string;
  mitigation: string;
  owner: string;
  status: 'Open' | 'Monitoring' | 'Mitigated' | 'Closed';
}
```

---

## 6. Frontend Developer Checklist for Plug-and-Play Integration

When your partner is ready to build:
* [ ] Configure HTTP client (e.g. Axios or Fetch wrapper) with Base URL and `Authorization: Bearer` interceptor.
* [ ] Implement global error interceptor that parses `{ error: { code, message } }` and shows a toast alert.
* [ ] Build Screens 1 to 6 as a linear wizard / stepper (`Register` $\rightarrow$ `Team Setup` $\rightarrow$ `Project Definition` $\rightarrow$ `Feasibility` $\rightarrow$ `SDLC` $\rightarrow$ `Architecture`).
* [ ] Build Screens 7 to 10 as tabs inside the central Workspace Dashboard (`/projects/:id/workspace`).
* [ ] Use the TypeScript interfaces above to guarantee exact data type matching with backend models.
* [ ] Include the Subscriptions & Licenses multi-select in the Team Member form (Screen 2) and highlight "⚡ Active Subscription" on tool recommendations (Screen 7).
