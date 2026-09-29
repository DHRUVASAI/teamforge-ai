# TeamForge AI — Architecture Decision Records (ADR)

**Document:** 08 — Architecture Decision Records
**Project:** TeamForge AI
**Status:** Living document — append new ADRs as decisions are made; never delete, only supersede

---

## Format

Each ADR: Title, Status (Proposed / Accepted / Superseded), Context, Decision, Alternatives Considered, Consequences (+ / -). Superseding a decision means adding a new ADR that says so — the old one stays for history.

---

## ADR-001: Modular Monolith for Phase 1 Deployment

**Status:** Accepted

**Context:** TeamForge's domain is naturally organized into 14 logical services (05_ARCHITECTURE.md §5). Phase 1 has one primary developer, no live users beyond the TeamForge team itself, and evolving requirements.

**Decision:** Deploy Phase 1 as a **modular monolith** — logical service boundaries enforced as internal module/API boundaries within one deployable, with per-service data ownership (no shared tables) preserved so services can be split out later.

**Alternatives Considered:**
1. Full microservices from day one — one deployable per logical service.
2. Plain monolith — no enforced internal boundaries at all.
3. Modular monolith (chosen).

**Consequences:**
- (+) Avoids operational overhead (orchestration, service discovery, distributed debugging) that isn't yet justified by scale or team size.
- (+) Clean API contracts between modules mean any service can be split out later without a rewrite.
- (+) Matches the project's own anti-trend principle (04_SDLC.md §7): don't choose an architecture because it's impressive, choose it because the constraints justify it.
- (-) Doesn't demonstrate live distributed-systems infrastructure in the capstone build itself — if the rubric specifically rewards visible microservices/K8s work, this is a trade-off to discuss with your evaluator.
- (-) Requires discipline to keep module boundaries clean (no shortcut cross-module table access) or the "split later" option quietly becomes false.

**Trigger to revisit:** Per 05_ARCHITECTURE.md §14 — when a service has a genuinely different scaling profile (Mentor/LLM orchestration is the likely first candidate) or a second developer needs to own/deploy a piece independently.

---

## ADR-002: PostgreSQL as Default Data Store

**Status:** Accepted

**Context:** Most TeamForge data (users, teams, projects, tasks, recommendations, reasoning records) is structured and relational.

**Decision:** Use PostgreSQL as the default store for all domain services, with per-service schemas preserving data ownership (06_DATA_ARCHITECTURE.md §3–4).

**Alternatives Considered:**
1. A specialized document store for AI-generated/reasoning content.
2. A polyglot approach — different DB per service by default.
3. PostgreSQL for everything unless a specific access pattern says otherwise (chosen).

**Consequences:**
- (+) One operational technology to run/back up/monitor in Phase 1 — matches NFR-005 (Maintainability).
- (+) Recommendation/reasoning records are still fundamentally relational (belong to a project, timestamped, versioned) — no real need for a document store yet.
- (-) If reasoning-history search or analytics needs grow significantly, PostgreSQL's JSON/text search may need supplementing later — deferred, not solved, by this decision.

---

## ADR-003: No Event Bus / Message Queue in Phase 1

**Status:** Accepted

**Context:** Some service interactions (e.g., task completion triggering risk re-evaluation) are natural candidates for async event-driven processing.

**Decision:** Use synchronous service-to-service calls in Phase 1; no event bus.

**Alternatives Considered:**
1. Event bus (e.g., Kafka/RabbitMQ) from the start.
2. Synchronous calls only (chosen).

**Consequences:**
- (+) Simpler to build, test, and debug for a team still establishing its own API contracts.
- (+) Matches current scale — no requirement yet demands decoupled async processing.
- (-) Will need rework if live progress tracking (deferred FR-024–026) later requires multiple services reacting to the same state change without tight coupling.

**Trigger to revisit:** Per 05_ARCHITECTURE.md §8 — when live progress tracking is built and cross-service reactions to shared state changes become common. This should get its own ADR when it happens, not be assumed now.

---

## ADR-004: Two-Layer Reasoning Engine (Deterministic Filter + LLM)

**Status:** Accepted

**Context:** AI-generated recommendations (SDLC, architecture, tasks, tools) need to respect hard constraints reliably (e.g., a 3-person 24-hour team cannot run real Scrum) while still producing natural-language reasoning.

**Decision:** Every recommendation engine (SDLC, Architecture, Risk, Tool Recommendation, DevOps) uses a **deterministic rule-based filter** to eliminate options that clearly don't fit, then an **LLM reasoning layer** to rank remaining candidates and write the justification (04_SDLC.md §5, reused in 05_ARCHITECTURE.md §6).

**Alternatives Considered:**
1. Pure LLM reasoning end-to-end.
2. Pure rule-based/expert-system, no LLM.
3. Two-layer: rules filter, LLM ranks and explains (chosen).

**Consequences:**
- (+) Hard constraints are enforced reliably — not dependent on the LLM "remembering" them correctly every time (directly mitigates R-001 in 07_RISK_MANAGEMENT.md).
- (+) LLM is used for what it's actually good at (ranking, explaining) rather than being trusted as the sole source of engineering judgment.
- (-) Requires maintaining an actual rule set per decision domain — more upfront design work than "just prompt the LLM."

---

## ADR-005: No Vector/RAG Store in Phase 1

**Status:** Accepted

**Context:** The Mentor could theoretically retrieve context from a corpus of past projects/decisions.

**Decision:** The Mentor reasons over live API state from domain services (current project, team, tasks) rather than a retrieval index.

**Alternatives Considered:**
1. Vector DB + RAG pipeline from the start.
2. Live API state only (chosen).

**Consequences:**
- (+) Avoids building and maintaining a retrieval pipeline before there's enough historical data (many past projects) to make it useful.
- (+) Consistent with 01_PROJECT_VISION.md §8 — cross-project learning is explicitly out of scope for now.
- (-) The Mentor can't yet say "teams like yours historically ran into X" — that capability is deferred, not built.

**Trigger to revisit:** When the system has enough completed projects that learning across them would meaningfully improve recommendations — likely a Phase 3+ concern.

---

## ADR-006: Decision-Based SDLC Recommendation (No Default Model)

**Status:** Accepted

**Context:** It would be simpler to always recommend Agile (popular) or always recommend a lightweight iterative model.

**Decision:** The SDLC Service selects a model per-project using the criteria and decision logic in 04_SDLC.md §3–4 — no model is ever the unconditional default.

**Alternatives Considered:**
1. Always recommend Agile.
2. Always recommend a single lightweight default (e.g., always Iterative).
3. Decision-based selection per project (chosen).

**Consequences:**
- (+) Matches the project's core thesis: recommendations should be justified by the specific team/project, not by trend.
- (+) Directly mitigates R-009-adjacent failure modes — a fixed default would make the whole "mentor" framing dishonest.
- (-) More complex to build and test than a single hardcoded default — needs real scenario coverage (04_SDLC.md §4) to validate.

---

## ADR-007: Decision-Based Architecture Recommendation (No Default to Microservices)

**Status:** Accepted

**Context:** Microservices are a common "impressive-sounding" default for student projects, but are frequently the wrong fit for small teams/short timeframes.

**Decision:** The Architecture Service recommends single-tier vs. multi-tier based on team size, skills, and time budget (per FR-016–019) — microservices are never the default recommendation regardless of project type.

**Alternatives Considered:**
1. Default to microservices to look more sophisticated.
2. Default to single-tier for simplicity.
3. Decision-based per project (chosen).

**Consequences:**
- (+) This is the engine's core differentiator — it has to actually practice what ADR-001 practices for TeamForge itself.
- (+) Protects teams — hackathon or otherwise — from the actual problem the project was created to solve (over-ambitious architecture for the time/team available).
- (-) Requires the rule set in the Architecture Service to be genuinely well-calibrated — a poorly tuned rule set here undermines the product's core value proposition, not just a minor feature.

---

## ADR-008: Analytics Not Built Without an Explicit FR

**Status:** Accepted

**Context:** Cross-project analytics (e.g., recommendation override rates) could be useful but isn't currently required by any FR.

**Decision:** No analytics data path is built until a specific FR justifies it (06_DATA_ARCHITECTURE.md §4).

**Alternatives Considered:**
1. Build basic analytics preemptively "since it'll be useful eventually."
2. Build only when an FR requires it (chosen).

**Consequences:**
- (+) Consistent with the "no component without a requirement" principle stated in 05_ARCHITECTURE.md §1.
- (-) Means you won't have historical override-rate data to evaluate the recommendation engines' quality until this is deliberately added — worth reconsidering once Phase 2 recommendation engines are live, since that data would help tune ADR-006/007's rule sets.

---

*Next document, per the original plan: 09 — Tool Catalog, defining the structure the Tool Recommendation Service (FR-028–029) reasons over.*
