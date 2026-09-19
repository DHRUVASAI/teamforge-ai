# TeamForge AI — SDLC & Engineering Methodology

**Document:** 04 — SDLC & Engineering Methodology
**Project:** TeamForge AI
**Status:** Draft v0.1
**Traces to:** 02_SRS.md (FR-010, FR-011)

---

## 1. Purpose

This document defines how the Mentor decides *which* SDLC model to recommend for a given team/project, and why. No model is treated as universally correct — the decision engine evaluates each model against the specific project's constraints and picks the best fit, with reasoning attached (per FR-011/FR-045).

This document itself models the principle the whole product is built on: **the right process depends on the situation, not on trend.**

## 2. SDLC Models the System Understands

For each model: what it is, what it needs to work well, and where it breaks down.

### 2.1 Waterfall
- **What it is:** Requirements → Design → Implementation → Testing → Deployment, each phase completed before the next begins.
- **Works well when:** requirements are well understood and unlikely to change, the team has limited time for rework, and the problem is narrow/well-defined (e.g., a single CRUD app with a fixed spec).
- **Breaks down when:** requirements are still being discovered, the team is learning the domain as they build, or feedback loops are needed mid-project.

### 2.2 Agile (Scrum/Kanban-style)
- **What it is:** Short iterations, continuous feedback, evolving backlog.
- **Works well when:** requirements may shift, the team can meet/sync regularly, and there's enough time for multiple iterations.
- **Breaks down when:** the time budget is too short for more than one real iteration (e.g., a 24-hour hackathon), or the team lacks experience running structured ceremonies and the overhead outweighs the benefit.

### 2.3 Iterative (non-Scrum)
- **What it is:** Build a working version, then repeatedly refine it in passes — without full Agile ceremony (no formal sprints/standups).
- **Works well when:** the team wants feedback loops but doesn't have the time or experience to run formal Agile — this is the common middle ground for short hackathons and small teams.
- **Breaks down when:** there's no way to test/validate each iteration, or the project has hard interdependencies that make partial builds unusable.

### 2.4 Spiral
- **What it is:** Repeated cycles of risk analysis + prototyping + development, with each loop reducing risk before committing further.
- **Works well when:** the project has significant technical or requirement uncertainty and the cost of a wrong early decision is high (e.g., unproven integration, novel architecture).
- **Breaks down when:** the project is simple/well-understood — the risk-analysis overhead isn't justified, and for very short timeframes there isn't room for multiple loops.

### 2.5 Prototyping
- **What it is:** Build a throwaway or evolving prototype early to validate the idea/UX before committing to the "real" build.
- **Works well when:** the problem or user need is uncertain and a quick mockup would change the plan; also fits demo-driven contexts like hackathons where a working prototype *is* the deliverable.
- **Breaks down when:** the team only has time to build once — there's no room to prototype and then rebuild.

### 2.6 Hybrid
- **What it is:** Combining elements — e.g., a short spike/prototype phase followed by iterative development; or waterfall-style upfront architecture with agile-style execution per component.
- **Works well when:** parts of the project have different risk/uncertainty profiles (e.g., the core feature is well understood but one integration is unproven).
- **Breaks down when:** the team doesn't have the experience to run a hybrid process without it collapsing into "no process."

## 3. Decision Criteria

The Mentor evaluates these inputs to select a model — no single input decides alone:

| Factor | What it affects |
|---|---|
| Time budget | How many real iterations/loops are possible at all |
| Requirement certainty | How likely the spec is to change once building starts |
| Technical uncertainty/risk | Whether unproven components need de-risking before full build |
| Team size | Coordination overhead of ceremony-heavy models scales with people |
| Team process experience | Whether the team can actually execute a model's overhead (e.g., running real Scrum) |
| Deliverable type | Demo-driven (hackathon pitch) vs. production-driven (capstone/product) favor different models |

## 4. Decision Logic (illustrative, not exhaustive)

```
Time budget very short (hours)
   AND requirements roughly fixed
        → Iterative (lightweight), no formal ceremony
        → Waterfall only if scope is truly trivial/fixed

Time budget short–medium (days–weeks)
   AND some requirement uncertainty
        → Iterative or Prototyping first pass, then iterative build

Time budget long (months, e.g., a capstone year)
   AND team can sustain process overhead
        → Agile (real sprints) is viable
        → Spiral if there are genuine unproven technical risks early on
        → Hybrid if risk is concentrated in specific components,
          not the whole project

High technical/requirement uncertainty
   regardless of time budget
        → Spiral or Prototyping-first, to de-risk before committing

Team has no process experience
   AND time budget is short
        → Avoid ceremony-heavy Agile; recommend Iterative instead
          (the overhead of "doing Agile right" isn't worth it)
```

The Mentor must always surface **at least one rejected alternative** with the reason it was rejected — e.g.:

> Recommended: Iterative (lightweight)
> Rejected: Agile/Scrum — team has 3 members and 24 hours; running real sprints and standups would consume time better spent building, and there isn't room for more than one feedback loop anyway.

## 5. How the AI Chooses (Engine Shape)

```
Inputs
  Time budget
  Requirement certainty (from Problem Statement Analysis)
  Technical/architecture risk (from Risk Management + Architecture Recommendation)
  Team size
  Team process experience (self-reported)
  Deliverable type (demo vs. product)
        │
        ▼
Rule-based filter
  (eliminates models that clearly don't fit — e.g., ceremony-heavy models
   for a 24-hour team; single-pass models for high-uncertainty projects)
        │
        ▼
Candidate model(s) remaining
        │
        ▼
LLM reasoning layer
  (ranks remaining candidates, writes the human-readable justification,
   and drafts the rejected-alternative explanation)
        │
        ▼
Recommendation + Reasoning + Rejected Alternative(s)
```

The rule-based filter matters: it keeps obviously-wrong models off the table deterministically, rather than relying entirely on an LLM to "know" that Scrum doesn't fit a 3-person 24-hour hackathon. The LLM's job is ranking and explaining, not deciding from scratch every time. (This same two-layer shape — deterministic filter + LLM reasoning — should be reused for the Architecture Recommendation engine in 06_ARCHITECTURE.md, for consistency.)

## 6. How the Recommendation Affects Project Workflow

Once a model is selected, it changes what the rest of TeamForge generates:

| SDLC Model Selected | Effect on Task Decomposition (FR-022) | Effect on Progress Tracking |
|---|---|---|
| Waterfall | Tasks generated once, in phase order; later phases blocked until earlier ones are marked complete | Progress shown as phase completion |
| Iterative | Tasks generated per pass; each pass produces a working (if partial) build | Progress shown per iteration, with a "what's demoable now" indicator |
| Agile | Tasks generated as a backlog, grouped into short cycles/sprints if time budget allows more than one | Progress shown per cycle, with backlog visible |
| Spiral | Tasks generated per risk-reduction loop, starting with the highest-risk unknowns | Progress tied to risk burn-down, not just task completion |
| Prototyping | An explicit "prototype" task set is generated first, separate from the "build" task set | Progress shows prototype phase distinctly from build phase |
| Hybrid | Task generation mixes the above per component, based on that component's own risk/certainty profile | Progress shown per component, using that component's model |

## 7. Explicit Anti-Pattern Guardrails

To keep the engine decision-based rather than trend-based, the following are hard rules for the recommendation logic:

- The engine must never default to Agile purely because it is popular — Agile is only recommended when the team has both the time budget and process experience to run it meaningfully.
- The engine must never default to Waterfall purely because it is "simple to explain" — it's only appropriate when requirements are genuinely stable.
- Every recommendation must name at least one factor from §3 that drove the choice, tying the output back to this project's specific inputs rather than a generic best practice.

---

*Next document: 05 — System Architecture Specification, where this same decision-based approach is applied to single-tier vs. multi-tier architecture selection.*
