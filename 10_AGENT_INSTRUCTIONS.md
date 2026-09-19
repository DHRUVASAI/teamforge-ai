# TeamForge AI — Agent Instructions

**Document:** 10 — Agent Instructions
**Project:** TeamForge AI
**Status:** Draft v0.1
**Purpose:** The document handed directly to a coding agent (or a human contributor) before any implementation work begins. Everything here is a rule, not a suggestion.

---

## 1. What You Are Building

You are implementing TeamForge AI, following the specification pack below. Do not invent architecture, requirements, or API shapes that aren't in these documents. If something you need isn't specified, stop and ask rather than deciding it yourself and moving on.

**Read in this order before writing any code:**

1. `01_PROJECT_VISION.md` — what this is and isn't
2. `02_SRS.md` — the requirements you're implementing (every feature must trace to an FR/NFR ID)
3. `03_USE_CASES.md` — how each user role actually uses the system
4. `04_SDLC.md` — the decision-engine pattern (deterministic filter + LLM reasoning) used throughout
5. `05_ARCHITECTURE.md` — service boundaries, why each exists, and the Phase 1 deployment shape (modular monolith)
6. `06_DATA_ARCHITECTURE.md` — data ownership; no service touches another's tables
7. `07_RISK_MANAGEMENT.md` — known risks and their mitigations; check before introducing anything on this list
8. `08_ADR.md` — decisions already made and why; don't silently contradict one — write a new ADR if you think one should change
9. `09_API_CONTRACTS.md` — the exact API shapes to implement

## 2. Hard Rules

- **Do not invent architecture.** If 05_ARCHITECTURE.md doesn't define a service/component you think you need, stop and flag it rather than adding it.
- **Do not modify another service's data or bypass its API.** Per 06_DATA_ARCHITECTURE.md — no direct table access across service boundaries, even though Phase 1 is one deployable (ADR-001). The boundary is enforced by contract, not by deployment topology.
- **Follow 09_API_CONTRACTS.md exactly.** Generate/update the relevant `openapi.yaml` before implementing an endpoint — implement to match the spec, not the reverse (09_API_CONTRACTS.md §7).
- **Do not introduce a new technology without an ADR.** Adding a cache, queue, vector store, or new external integration requires a new entry in `08_ADR.md` justifying it against an actual trigger condition (per the "Trigger to revisit" note on the relevant existing ADR) — not because it seemed useful.
- **Every recommendation-producing feature needs the two-layer engine shape.** Per ADR-004: deterministic rule-based filter first, LLM ranks/explains what's left. Do not implement a recommendation feature as a single LLM call with no rule layer.
- **Every recommendation must include reasoning and at least one rejected alternative.** Per FR-045/046 — this is not optional polish, it's a functional requirement.
- **Respect the dependency ordering.** Per 06_DATA_ARCHITECTURE.md §5 / 09_API_CONTRACTS.md §8 — a service must not be callable in a way that skips its upstream dependency (e.g., no task decomposition before an architecture is accepted; return 409 per 09_API_CONTRACTS.md §4).
- **Every feature requires tests.** No exceptions for "it's just a small endpoint."
- **Every service requires a README** covering purpose, API summary, and dependencies (this becomes an input to the Documentation Service later, per FR-040).
- **Never expose secrets.** No API keys, tokens, or credentials in code, logs, or committed config — use environment configuration (06_DATA_ARCHITECTURE.md §6, security notes).
- **If a requirement conflicts with the architecture, stop and report the conflict.** Do not silently resolve it by changing one or the other on your own judgment.
- **Follow the phase priority order.** Per 02_SRS.md §6 — implement Must-have FRs for the current phase completely before starting Should-have or Could-have FRs, even if a later-phase feature looks easy to knock out along the way. This directly mitigates R-009 (scope creep) in 07_RISK_MANAGEMENT.md.

## 3. Build Order (Phase 1–2, per 02_SRS.md §6 priorities)

```
Phase 1 — Foundation
  User & Team Service
  Project Service
  API Gateway (auth)

Phase 2 — Intelligence
  SDLC Service
  Architecture Service
  Task Service
  Assignment Service
  Risk Service

Phase 2/3 — Execution support
  Tool Recommendation Service
  Mentor Service (orchestration)

Phase 3+ (Could-have — do not start early)
  GitHub Integration Service
  DevOps Service
  Documentation Service
  Presentation Service
```

Do not begin a later phase's services until the current phase's Must-have FRs are implemented and tested end-to-end (per §2's phase-priority rule).

## 4. When You're Unsure

- If a document is silent on something you need: stop, state the gap, propose an option, and wait rather than guessing and continuing.
- If two documents seem to disagree: flag the specific sections and ask which should be treated as authoritative — don't silently pick one.
- If you think a past decision (an ADR) should change: don't just build the new way. Propose the change as a new ADR entry first (per 08_ADR.md's "living document, supersede don't delete" rule).

## 5. Definition of Done (per feature)

A feature is not done until:

1. It traces to a specific FR/NFR ID from `02_SRS.md`.
2. Its API matches `09_API_CONTRACTS.md` (or that document has been updated first, with the change flagged).
3. Tests exist and pass.
4. The service's README reflects the change.
5. If it's a recommendation-producing feature: it follows the two-layer engine shape and includes reasoning + at least one rejected alternative.
6. If it introduces a new technology/dependency: an ADR exists for it.

---

*This document should be kept short and rule-shaped on purpose — it's meant to be read in full before every work session, not browsed. If it grows past roughly this length, split detail out into the referenced documents and keep this one as the checklist.*
