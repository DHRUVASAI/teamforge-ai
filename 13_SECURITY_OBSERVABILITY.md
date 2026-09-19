# TeamForge AI — Security & Observability

**Document:** 13 — Security & Observability
**Status:** Draft v0.1
**Traces to:** 02_SRS.md (NFR-001 Security, NFR-003 Availability, NFR-007 Reliability), 06_DATA_ARCHITECTURE.md (§7 Data Security), 05_ARCHITECTURE.md (§9 Auth, §13 Monitoring), 07_RISK_MANAGEMENT.md (R-006, R-007)

---

## 1. Purpose

Security and observability were previously split across other documents as notes (auth in 05_ARCHITECTURE.md §9, data security in 06_DATA_ARCHITECTURE.md §7, monitoring deferred in 05_ARCHITECTURE.md §13). This document consolidates them into concrete, implementable practice — directly addressing R-006 (security vulnerability) and R-007 (data leakage) from the risk register.

## 2. Authentication & Authorization (concrete implementation of 05_ARCHITECTURE.md §9)

- **Auth mechanism:** token-based (e.g., JWT) issued at login, validated at the API Gateway on every request (09_API_CONTRACTS.md §3).
- **Password storage:** hashed with a modern algorithm (e.g., bcrypt/argon2) — never stored or logged in plaintext.
- **Authorization layering:** gateway checks token validity; each service independently re-checks team/project scope on every query (double-check per 06_DATA_ARCHITECTURE.md §7 — not solely trusting the gateway, since a single point of enforcement is itself a risk).
- **Role checks:** Project Lead-only actions (accept/override recommendations, FR-003/FR-019) verified at the specific service handling the action, not just inferred from the frontend hiding a button.

## 3. Data Security (concrete implementation of 06_DATA_ARCHITECTURE.md §7)

- **Team/project scoping:** every query filtered by `X-Team-Id`/project ID at the data-access layer of each service — this is the primary defense against R-007 (data leakage).
- **Secrets:** never in domain tables, never in logs, never in generated documentation/presentation artifacts (FR-040–044 outputs must be checked against this before being surfaced to a user).
- **Transport:** HTTPS/TLS for all traffic — no exceptions, including internal calls once any service is split out physically (§5 of 12_DEPLOYMENT_INFRASTRUCTURE.md).
- **Input validation:** every service validates its own inputs (don't rely on the frontend or gateway to have already sanitized data) — relevant given FR-005/FR-007 accept free-text project descriptions that eventually get used in LLM prompts (a prompt-injection surface worth naming explicitly, see §6).

## 4. Dependency & Vulnerability Management

- Dependency scanning as a CI step (extends 12_DEPLOYMENT_INFRASTRUCTURE.md §3's pipeline) — flags known-vulnerable packages before merge.
- No secrets or credentials committed to the repository, enforced via a pre-commit/CI secret-scan step, not just a written rule.

## 5. Observability (concrete implementation, picking up the deferral in 05_ARCHITECTURE.md §13)

05_ARCHITECTURE.md deferred full monitoring to Phase 3, but named it so the architecture wouldn't preclude it. Concretely, when Phase 3 arrives:

- **Structured logging per service:** every reasoning-layer call logs its inputs, the rule-based filter's candidate set, and the final recommendation — this is what makes explainability (FR-045/046) auditable after the fact, not just at response time.
- **Error/uptime visibility:** basic request success/failure rates and latency per service, surfaced once there are users beyond the TeamForge team itself.
- **What's explicitly NOT built in Phase 1:** a full observability stack (e.g., Prometheus/Grafana) — matches 05_ARCHITECTURE.md's existing deferral and R-010's "excessive infrastructure complexity" guardrail. Basic platform-provided logs (from the hosting platform in 12_DEPLOYMENT_INFRASTRUCTURE.md §2) are sufficient until real usage justifies more.

## 6. AI-Specific Security Notes

These are risks specific to an LLM-orchestrated system that a generic security document would miss:

- **Prompt injection via free-text project input:** since FR-005/FR-030 accept free-text from users that flows into LLM prompts (problem statements, mentor questions), the reasoning layer must treat that text as untrusted content, not as instructions — the deterministic rule-based filter (ADR-004) is a structural mitigation here too, since it means user text can influence *ranking/explanation* but not override the hard constraints the filter enforces.
- **LLM output isn't automatically trusted as a command:** recommendations are data the frontend renders and a human accepts/rejects (FR-019, FR-045) — the system must never auto-execute an LLM-authored action (e.g., auto-merging a PR, auto-deleting a task) without an explicit human accept step.
- **Provider credential isolation:** the LLM provider abstraction (05_ARCHITECTURE.md §11, mitigating R-003) also means the provider API key is scoped to one internal service (Mentor/AI Orchestration), not distributed across every service that happens to need a recommendation.

## 7. Incident Handling (data-related, minimal Phase 1 version)

Consistent with 12_DEPLOYMENT_INFRASTRUCTURE.md §7's "no formal on-call process yet" — but data incidents get a specific minimum bar regardless of team size, since R-006/R-007 are both scored 3 (Low probability, High impact — not negligible):

1. If a vulnerability or leakage is discovered: revoke/rotate any exposed credentials immediately.
2. Identify which records/teams were affected (enabled by the team-scoping in §3 — you can actually answer this because of that design).
3. Patch and redeploy (12_DEPLOYMENT_INFRASTRUCTURE.md §7's rollback path).
4. Disclose to affected users if their data was exposed — this is a minimum ethical bar regardless of project stage, not something deferred to "later phases."

---

*This closes out the core Phase 1–2 documentation set (01 through 13). Remaining items from earlier discussion — Documentation/Presentation Service detail (FR-040–044) and live progress-tracking design — are Could-have priority per 02_SRS.md §6 and can be drafted when Phase 2 implementation actually reaches them.*
