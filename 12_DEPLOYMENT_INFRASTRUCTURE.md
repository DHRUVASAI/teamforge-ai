# TeamForge AI — Deployment & Infrastructure

**Document:** 12 — Deployment & Infrastructure
**Status:** Draft v0.1
**Traces to:** 05_ARCHITECTURE.md (§14 Deployment), 08_ADR.md (ADR-001, ADR-003), 02_SRS.md (FR-037–039, NFR-002)

---

## 1. Purpose

This document is the concrete implementation of the deployment philosophy already decided in 05_ARCHITECTURE.md §14 and ADR-001: infrastructure is added when a specific trigger condition is met, never by default. This applies to **TeamForge's own infrastructure** — the DevOps *recommendations the platform makes to user projects* (FR-037–039) are a separate, decision-engine-driven concern already covered by those FRs and reuse the same two-layer shape (ADR-004).

## 2. Phase 1 Deployment Shape

Per ADR-001: a single deployable (modular monolith) containing all logical services from 05_ARCHITECTURE.md §5, each with clean internal API boundaries and separate data ownership (06_DATA_ARCHITECTURE.md).

```
                 ┌───────────────────────────┐
                 │   TeamForge Deployable     │
                 │  (single process/container)│
                 │                            │
                 │  User&Team | Project | SDLC│
                 │  Architecture | Risk | Task│
                 │  Assignment | ToolRec      │
                 │  Mentor | GitHub Integ.    │
                 │  DevOps | Docs | Present.  │
                 └─────────────┬──────────────┘
                               │
                     ┌─────────┴─────────┐
                     ▼                   ▼
              PostgreSQL              Object/File
              (per-service schemas)    Storage
```

- **Runtime:** containerized (Docker) even in Phase 1 — this is a *packaging* decision, not an architecture-splitting decision, so it doesn't contradict ADR-001's guardrail. One container, one deployable, consistent environment across development/staging/production.
- **Hosting:** a single low-ops platform (e.g., Render/Railway/Fly.io-class, or a single cloud VM) — chosen for minimal operational overhead while the team is small, not because it's a permanent architectural commitment.
- **Environments:** local (developer machine), staging (for testing before demo/review), production (if the project reaches a deployed, reviewable state per FR outcomes in 02_SRS.md §7).

## 3. CI Pipeline (Phase 1)

```
Push / PR
   │
   ▼
Lint
   │
   ▼
Unit tests (per logical service, run together in Phase 1)
   │
   ▼
Build container image
   │
   ▼
(on merge to main) Deploy to staging
```

- **Tool:** GitHub Actions (from 11_TOOL_CATALOG.md — free tier fits Phase 1 scale, low integration difficulty, matches FR-037's "recommend CI/CD only when justified" — a solo/small team building over a year genuinely benefits from CI, so this is justified, not default).
- **Not included in Phase 1:** separate CI pipelines per logical service (that's a Phase 2+/post-split concern — see §5), staged/canary deployments, blue-green deployment.

## 4. Secrets & Configuration

- Environment variables for all secrets (LLM API keys, GitHub tokens, DB credentials) — never committed, never logged (ties to NFR-001 and 06_DATA_ARCHITECTURE.md §7).
- A single `.env.example` (no real values) committed to the repo so setup is reproducible, per the original brainstorming's "one-click local environment" goal — still a valid, low-cost convenience even under the repositioned scope.
- Phase 1: environment variables managed via the hosting platform's built-in secrets UI — a dedicated secrets manager (e.g., Vault) is **not justified yet** (would be its own ADR if it becomes necessary, per the "no technology without a trigger condition" rule).

## 5. Trigger Conditions to Split Past the Modular Monolith

Restating and making concrete the trigger from ADR-001, so "when do we split a service out" isn't a judgment call made under pressure later:

| Trigger | Likely first service affected | Why |
|---|---|---|
| A logical service's resource usage (latency, cost, or compute) diverges sharply from the rest | Mentor/AI Orchestration Service | LLM call latency and cost behave nothing like simple CRUD services (already flagged in 05_ARCHITECTURE.md §14) |
| A second developer needs to own and deploy a piece independently | Whichever service that developer owns | Matches NFR-002's "components with different scaling characteristics shall remain separable" — separable in the codebase from day one (clean API contracts), physically split only when needed |
| A specific integration needs independent uptime/retry behavior distinct from the rest of the app | GitHub Integration Service | Already isolated as a boundary (05_ARCHITECTURE.md §5) specifically so this split is cheap when it happens |

**When a trigger fires:** write a new ADR (per 08_ADR.md's living-document rule) documenting the specific trigger, the service being split, and the new deployment shape — don't just do it silently.

## 6. Containerization & Orchestration for User Projects (FR-039)

This is what the DevOps Service recommends to *user* projects — same two-layer engine shape (ADR-004):

```
Project architecture (from Architecture Service) + team DevOps skill + time budget
        │
        ▼
Deterministic filter
  - single-tier architecture → no containerization recommendation by default
  - multi-tier/microservices architecture + team has Docker familiarity → Docker recommended
  - genuine scale/orchestration need + team has DevOps experience → Kubernetes considered
  - otherwise → Kubernetes explicitly rejected with reasoning (mirrors 04_SDLC.md's anti-pattern guardrail)
        │
        ▼
LLM ranks/explains within the filtered candidates
```

This must never default to Kubernetes because it "looks professional" — same discipline as ADR-007's architecture-recommendation rule.

## 7. Rollback & Incident Response (Phase 1, minimal)

- Deployment is a single container — rollback means redeploying the previous image tag. No blue-green/canary complexity justified yet.
- No formal on-call process in Phase 1 (team is too small for it to mean anything) — this is intentionally simple, not an oversight; a heavier incident process would itself be the "excessive infrastructure complexity" risk named in R-010 (07_RISK_MANAGEMENT.md).

---

*Next document: 13 — Security & Observability, covering the concrete implementation of NFR-001 (Security) and the monitoring approach deferred (with reasoning) in 05_ARCHITECTURE.md §13.*
