# TeamForge AI — Risk Management Plan

**Document:** 07 — Risk Management Plan
**Project:** TeamForge AI
**Status:** Draft v0.1
**Traces to:** 02_SRS.md (FR-012–015, Risk Service), 05_ARCHITECTURE.md (§5 Risk Service)

---

## 1. Purpose

This is TeamForge's own risk register — built using the same identification/scoring/mitigation logic the Risk Service (FR-012–015) is meant to apply to *user* projects. This is a deliberate dogfooding exercise: if the reasoning isn't good enough to trust for TeamForge's own build, it isn't good enough to hand to a hackathon team either.

## 2. Scoring Model

- **Probability:** Low (1) / Medium (2) / High (3)
- **Impact:** Low (1) / Medium (2) / High (3)
- **Risk Score:** Probability × Impact (range 1–9)
- **Priority bands:** 1–2 = Low, 3–4 = Medium, 6–9 = High

Scores are re-evaluated whenever project state changes materially (new phase, new integration added, team composition change) — matching FR-015.

## 3. Risk Register

| Risk ID | Risk | Probability | Impact | Score | Trigger | Mitigation | Contingency | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| R-001 | LLM hallucination — Mentor generates a plausible-sounding but factually wrong recommendation or explanation | High (3) | High (3) | 9 | Any LLM reasoning-layer output not backed by the rule-based filter (04_SDLC.md §5) | Keep the deterministic rule-based filter authoritative for hard constraints; LLM only ranks/explains within valid options; require every recommendation to cite the specific inputs behind it (FR-045) | If a hallucinated recommendation reaches a user, log it, correct it, and add the failure case to the rule-based filter so it can't recur silently | Mentor Service owner | Open |
| R-002 | Incorrect architecture recommendation — system recommends an architecture that doesn't fit the team/time budget | Medium (2) | High (3) | 6 | Architecture Service output disagreement with a manual review, or a user override (FR-019) used repeatedly for the same input pattern | Ground recommendations in explicit rules from 04_SDLC.md/05_ARCHITECTURE.md, not free LLM judgment; track override frequency as a quality signal | Allow immediate manual override (already required, FR-019); review overridden cases to correct the underlying rule set | Architecture Service owner | Open |
| R-003 | AI tool (LLM provider) becoming unavailable or rate-limited | Medium (2) | Medium (2) | 4 | Provider outage, quota exhaustion, or API deprecation | Abstract the LLM provider behind an internal interface (05_ARCHITECTURE.md §11) so a provider swap doesn't touch domain services | Fall back to showing the deterministic rule-based filter's output without LLM-authored explanation, rather than blocking the whole flow (NFR-007) | Mentor Service owner | Open |
| R-004 | API failure — a downstream service call fails mid-request (e.g., GitHub, LLM provider) | Medium (2) | Medium (2) | 4 | Timeout/error from an external integration | Timeouts + retries with backoff on all external calls; degrade gracefully per NFR-007/NFR-003 | Surface a clear "this feature is temporarily unavailable" state rather than a silent failure or crash | API Gateway owner | Open |
| R-005 | Service dependency failure — an internal service (e.g., Task Service) is down, blocking dependent services (Assignment, Tool Recommendation) | Low (1) | Medium (2) | 2 | Health check failure on a domain service | Modular monolith deployment in Phase 1 (05_ARCHITECTURE.md §14) reduces the surface area for this vs. a full distributed system; clean API contracts make failure isolation possible later | If a dependent service can't get needed data, show the last-known accepted state rather than blocking entirely | Whichever service owner is affected | Open |
| R-006 | Security vulnerability — auth bypass, injection, or exposed endpoint | Low (1) | High (3) | 3 | Code review flag, dependency vulnerability scan, or penetration test finding | Centralize auth at API Gateway (05_ARCHITECTURE.md §4/§9); team-scoped filtering as a second layer (06_DATA_ARCHITECTURE.md §7); no secrets in domain tables | Rotate any exposed credentials immediately; patch and redeploy; disclose to affected users if data was exposed | Whoever owns the affected service | Open |
| R-007 | Data leakage — one team's project data becomes visible to another team | Low (1) | High (3) | 3 | Any query missing a team/project scope filter | Enforce team-scoped access at both gateway and per-service data layer (double-check, not single point of failure) — per 06_DATA_ARCHITECTURE.md §7 | Immediately revoke access, audit which records were exposed and to whom, notify affected teams | User & Team Service owner | Open |
| R-008 | Integration problems — GitHub or other external integration behaves differently than assumed (rate limits, auth scopes, API changes) | Medium (2) | Medium (2) | 4 | Integration test failure or unexpected API response shape | Build GitHub Integration Service as an isolated boundary (05_ARCHITECTURE.md §5) so integration quirks don't leak into domain logic; version-pin the GitHub API used | Degrade to manual repo/task linking if automated integration breaks, rather than blocking task tracking entirely | GitHub Integration Service owner | Open |
| R-009 | Scope creep — the one-year capstone timeline expands to try to build every FR at once instead of following the phased priority in 02_SRS.md §6 | High (3) | High (3) | 9 | Any point where "Could-have" FRs are being worked before "Must-have" FRs are solid | Hold to the Must/Should/Could-have priority table (02_SRS.md §6); require a phase's Must-haves to be working before starting the next phase's scope | If scope has already crept, cut back to the current phase's Must-haves and explicitly move the extra work to a later phase rather than half-finishing both | Project Lead (or, for a solo/small build, the project owner) | Open |
| R-010 | Excessive infrastructure complexity — building full microservices/Kubernetes/CI-CD before it's justified by actual scale | Medium (2) | Medium (2) | 4 | Any infrastructure decision made without a corresponding trigger condition from 05_ARCHITECTURE.md §14 or 04_SDLC.md §7 | Modular monolith by default in Phase 1; every infra addition (K8s, event bus, etc.) requires its own ADR justifying why the trigger condition was met | If complexity has already crept in without justification, document it honestly as a lesson in the capstone report rather than hiding it — it's a legitimate risk-management outcome to show | Project owner | Open |

## 4. Risk Ownership & Review Cadence

- Each risk has a named service/role owner (per §3), consistent with the service-ownership model in 05_ARCHITECTURE.md — no risk is "everyone's problem."
- Review the full register at the start of each development phase (per the phasing in the earlier planning discussion), and immediately whenever a trigger condition in §3 fires.
- Status values: **Open** (not yet mitigated), **Monitoring** (mitigation in place, watching for trigger), **Mitigated** (trigger addressed, residual risk low), **Closed** (no longer applicable).

## 5. Relationship to the Risk Service (FR-012–015)

This document is the manually-maintained version of what the Risk Service should eventually do automatically for *user* projects: identify risks from project/architecture/team inputs, score them, attach mitigations, and re-evaluate as state changes. Building this register by hand first is intentional — it's the reference behavior the Risk Service's rule-based filter (same two-layer shape as 04_SDLC.md §5) should be built to reproduce.

---

*Next document: 08 — Architecture Decision Records (ADRs), formally recording the decisions already made informally across 04_SDLC.md, 05_ARCHITECTURE.md, and 06_DATA_ARCHITECTURE.md (e.g., modular monolith for Phase 1, PostgreSQL as default store, no event bus yet).*
