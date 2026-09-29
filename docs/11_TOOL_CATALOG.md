# TeamForge AI — Tool Catalog

**Document:** 11 — Tool Catalog
**Status:** Draft v0.1
**Traces to:** 02_SRS.md (FR-028–029, Tool Recommendation), 05_ARCHITECTURE.md (§5 Tool Recommendation Service), 06_DATA_ARCHITECTURE.md (§2 ToolCatalogEntry entity)

---

## 1. Purpose

This is the structured catalog the Tool Recommendation Service reasons over. Per FR-029, the system must never assume one tool fits every project — this catalog is what makes that possible: each entry is tagged with enough structure that the rule-based filter (ADR-004's two-layer shape) can narrow candidates before the LLM ranks and explains.

Without this catalog, "recommend a tool" degrades into an LLM guessing from general knowledge, which is exactly the failure mode ADR-004 was written to prevent.

## 2. Catalog Entry Schema

Every entry captures:

| Field | Purpose |
|---|---|
| Tool | Name |
| Category | e.g., AI coding assistant, frontend framework, backend framework, database, CI/CD, containerization, testing, design/prototyping |
| Task Types | Which task categories (from Task Service output) this tool fits — e.g., "API development", "UI implementation", "data modeling" |
| Skill Level Fit | Beginner-friendly / Intermediate / Advanced-only — feeds FR-026's constraint that Early-Career Developers shouldn't get tools that assume advanced setup knowledge |
| Free Tier | What's available without payment |
| Credit / Quota Notes | Rate limits, usage caps — directly relevant to R-003 (AI tool unavailability) in 07_RISK_MANAGEMENT.md |
| API Available | Whether the tool can be integrated programmatically (relevant to future GitHub/DevOps Service automation) |
| Integration Difficulty | Low / Medium / High — setup time cost, weighed against project time budget |
| Best Use Cases | When this is the right recommendation |
| Limitations | When it's *not* — required so the engine can produce rejected-alternative reasoning (FR-029) |
| Last Verified | Date the entry was checked — catalog entries go stale (pricing, free-tier limits, and even tool existence change), so this field is load-bearing, not decorative |

## 3. Starter Catalog (illustrative — expand as tools are actually evaluated)

| Tool | Category | Task Types | Skill Level | Free Tier | Integration Difficulty | Best For | Limitations |
|---|---|---|---|---|---|---|---|
| Claude Code / Cursor / Copilot (class) | AI coding assistant | Implementation across most task types | Beginner–Advanced | Varies by provider | Low | Accelerating implementation once a task/interface is well defined | Not a substitute for the architecture/task decomposition this platform already does — recommend *after* a task exists, not as a planning tool |
| FastAPI / Express (class) | Backend framework | API/service implementation | Intermediate | Free/open-source | Low–Medium | Small-to-medium services where the accepted architecture calls for a lightweight backend | Not the right recommendation if the architecture calls for a specific existing stack the team already knows — familiarity should outweigh "best practice" for short time budgets |
| React / Next.js (class) | Frontend framework | UI implementation | Intermediate | Free/open-source | Medium | Projects where the architecture includes a dedicated frontend component | Overkill for a single-page prototype with no real interactivity — flag simpler alternatives for those cases |
| PostgreSQL | Database | Data storage (matches ADR-002 default) | Intermediate | Free/open-source, generous free tiers on managed hosts | Low–Medium | Default recommendation per 06_DATA_ARCHITECTURE.md, unless a specific access pattern says otherwise | Not the right recommendation if the Data Architecture Service has already justified a different store for a specific data type |
| GitHub Actions | CI/CD | Automated build/test/lint | Beginner–Intermediate | Free tier generous for small/public repos | Low | Teams already on GitHub (ties to GitHub Integration Service, FR-033–036) | Not justified for a project with no CI/CD requirement yet (FR-037 — recommend only when justified) |
| Docker | Containerization | Environment consistency | Intermediate | Free | Medium | When the architecture has been split into independently deployable components (ADR-001's trigger condition) | Not justified for Phase-1-style single-deployable projects — recommending it prematurely repeats the mistake ADR-001 exists to avoid |
| Figma (class) | Design/prototyping | UI/UX design before implementation | Beginner–Intermediate | Free tier available | Low | Projects where UI needs to be agreed on before implementation starts | Not relevant for backend-only or infrastructure-focused tasks |
| Postman / Insomnia (class) | API testing | Verifying API contracts (ties to 09_API_CONTRACTS.md) | Beginner–Intermediate | Free tier available | Low | Validating a service against its OpenAPI contract before integration | Doesn't replace automated tests — recommend alongside, not instead of, a testing framework |

**Note on specificity:** entries above are written as tool *classes* (e.g., "FastAPI / Express") rather than picking a single winner, because picking one would itself violate FR-029's "don't assume one tool fits every project" rule — the actual recommendation the engine makes should be the specific tool, chosen per-project from within a class based on task/skill/constraint fit.

## 4. How This Feeds the Recommendation Engine

Same two-layer shape as every other recommendation engine in this system (ADR-004):

```
Task (from Task Service) + Assignee skill level + Assignee subscriptions/licenses + Time budget + Stack already chosen
        │
        ▼
Deterministic filter over catalog
  (eliminate entries with wrong Task Type, wrong Skill Level,
   or a Limitation that directly matches this project's constraints;
   prioritize tools where the member or team already holds an active subscription/license)
        │
        ▼
Candidate tool(s)
        │
        ▼
LLM reasoning layer
  (ranks candidates, writes justification + rejected alternatives)
        │
        ▼
Tool Recommendation + Reasoning (FR-029)
```

## 5. Maintenance

- **Last Verified** drives a staleness check — entries older than a defined threshold (e.g., 6 months) should be flagged for re-verification before being served as a fresh recommendation, since free-tier limits and pricing change often.
- Adding a new catalog entry does **not** require an ADR (it's data, not architecture) — but adding a new *category* of tool that implies new integration work (e.g., a new external API TeamForge itself needs to call) does, per 08_ADR.md's rule.
- This catalog is explicitly out of scope for automatic self-updating in Phase 1 (no scraping/monitoring pipeline) — it's maintained manually, consistent with NFR-002/ADR-008's "no component without a requirement" discipline.

---

*Next document: 12 — Deployment & Infrastructure, covering CI/CD, containerization, and the trigger conditions for moving past the modular monolith established in ADR-001.*
