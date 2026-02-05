# Linear Ticketing Playbook (Agent-Executable Work Tickets)

This playbook defines **how we write Linear tickets** so that:
- Humans can quickly understand and prioritize work
- Cloud agents can execute work **end-to-end** without ambiguity
- Verification is explicit, repeatable, and non-negotiable

This is a **general** standard. Project-specific label sets, workflows, and naming can vary, but the **ticket contract** and **agent ergonomics** should remain consistent.

Related standards (canonical):
- Agent operating model: `devbrain-handbook/agentic-system-ops.md`
- Tool choice + browser verification + freshness: `devbrain-handbook/tool-usage-playbook.md`
- Quality gates (source of truth): `docs/testing-and-quality-strategy.md`
- Roadmap hygiene (Now/Next/Later/Backlog): `devbrain-handbook/roadmap-hygiene.md`

---

## Goals

1. **Unambiguous execution**: a ticket should read like an executable spec.
2. **Scope containment**: prevent “audit” tickets from turning into redesign projects.
3. **Reliable verification**: every ticket states what proves correctness and what evidence is required.
4. **Metadata discipline**: tickets are queryable, sliceable, and schedulable.

---

## The Linear ticket contract (required fields)

Every ticket must have the following in its **description**, in this order:

1. **Problem**
   - What is wrong / missing?
   - Why does it matter (impact, user pain, risk reduction)?
2. **Scope**
   - In-scope: bullets (concrete)
   - Out-of-scope: bullets (explicit)
3. **Constraints**
   - Non-negotiables (e.g., “no breaking schema”, “no new UI section”, “no new external dependencies”)
4. **Approach (high-level)**
   - 3–7 bullets of the intended implementation strategy
   - Key files/areas to touch if known
5. **Acceptance Criteria (DoD)**
   - Checklists that define “done” in observable outcomes
6. **Verification Plan**
   - Exact commands, tests, or user flows to run
   - Expected outputs / assertions
7. **Artifacts / Deliverables**
   - What files, docs, screenshots, reports, or links should be produced
8. **Risks / Notes**
   - Edge cases, assumptions, known tradeoffs
9. **Rollback**
   - How to revert safely if the change causes regressions (feature flag, simple revert, fallback path)

If a ticket cannot fit this structure, it’s usually too large and must be split.

---

## Metadata rules (how to use Linear features)

### Project
- Use **Projects** to represent the product/initiative a ticket belongs to.
- A ticket should typically belong to **exactly one** project.
- Epics are often best represented as a **parent issue** with children, all inside the same project.

### Labels (keep them small, consistent, and queryable)
Use labels as **orthogonal axes**, not a pile of synonyms. Prefer 2–5 labels per ticket.

Recommended label categories:
- **Horizon**: Now / Next / Later / Backlog (match `roadmap-hygiene.md`)
- **Area**: CalculatorAudit / Citations / Auth / CI / Monetization / Onboarding / Infra / Security / etc.
- **WorkType**: Bug / Improvement / Refactor / Chore / Research
- **Risk** (optional): HighRisk / LowRisk (use sparingly)

Rules:
- Avoid duplicative labels (e.g., both “Bug” and “Fix”).
- A label should enable a useful saved view. If it doesn’t, remove it.
- Don’t encode status in labels (that’s what **States** are for).

### Priority
- Use priority for **ordering work within the same horizon**.
- Only set priority when you mean it (avoid everything being Urgent).

### States
- Keep the workflow minimal: Todo → In Progress → In Review → Done.
- Use Cancelled/Duplicate/De-scoped states explicitly instead of silently abandoning tickets.

### Cycles / due dates
- Use Cycles for planning a batch of work that will be tackled together.
- Use Due Dates only when there is a real external deadline. Otherwise, prefer horizon + cycle.

### Assignee vs Delegate (agent ergonomics)
- **Assignee**: the accountable owner (human).
- **Delegate** (if available): the executing agent (cloud agent / automation).

If your workspace doesn’t use Delegate, encode execution intent in the description:
- “Execution: cloud agent” vs “Execution: human”

### Parent/child issues
Use parent/child when:
- Work naturally decomposes into independent deliverables
- Different subsystems are involved (frontend vs backend vs data)
- Verification steps differ (UI flow vs backend build vs migration)

Rule of thumb:
- If you have more than ~7 acceptance criteria bullets, consider splitting into child tickets.

### Attachments and links
Use links for durable references:
- Docs, PRs, dashboards, vendor consoles, prior incidents

Use attachments for evidence:
- Screenshots, exports, logs, small reports

---

## Writing for agents (make tickets executable)

### Use the “agent preflight” inside the ticket
At the top of the description (or right before DoD), add:
- **Goal** (one sentence)
- **Constraints** (bullets)
- **Verification** (exact commands/flows)

This mirrors `PreFlight` and `DOD` from `devbrain-handbook/devbrain-dictionary.md`.

### Make inputs and outputs explicit
Agents fail when inputs are implicit. Include:
- Required environment assumptions (e.g., “uses root .env via dotenv; do not add .env.local”)
- Required sample inputs for manual testing (e.g., “enter 1000, 5%, 30 days”)
- Expected output invariants (e.g., “result not NaN”, “increasing principal increases total”)

### Encode “stop-and-ask” triggers
If certain conditions are hit, the agent should stop rather than guessing. Examples:
- Requirements ambiguous in a way that changes product behavior
- Breaking changes would be required
- External fact is uncertain and needs freshness verification
- Fix would require unsafe suppressions instead of root-cause correction

Reference: `devbrain-handbook/agentic-system-ops.md`

### Require a minimal verification bar
Always specify at least one of:
- A quality gate command
- A unit test suite
- A browser flow (and “no console errors”)

Reference: `docs/testing-and-quality-strategy.md`, `devbrain-handbook/tool-usage-playbook.md`

---

## Sizing and slicing rules (avoid scope ballooning)

### Target size
- Prefer tickets that can be completed in **1–3 days** by an agent.
- If larger: create an epic/parent ticket and split into child tickets with independent DoD.

### Slice by subsystem
Split when work crosses:
- frontend vs backend
- schema/data vs UI
- correctness vs polish
- refactor vs feature

### “Non-breaking” posture by default
Unless explicitly requested:
- Add new behavior behind feature flags (default OFF)
- Deprecate, don’t delete
- Keep API and schema backward compatible

---

## Ticket templates

### Template: General engineering ticket (copy/paste)

Problem:
- …

Scope:
- In:
  - …
- Out:
  - …

Constraints:
- …

Approach:
- …

Acceptance Criteria (DoD):
- [ ] …

Verification Plan:
- [ ] Command(s):
  - `…`
- [ ] UI flow (if applicable):
  - …
- [ ] Assertions:
  - …

Artifacts / Deliverables:
- …

Risks / Notes:
- …

Rollback:
- …

### Template: Audit ticket (copy/paste)

Problem:
- Validate calculator/feature correctness and identify non-breaking improvements.

Constraints:
- No breaking schema/API.
- No redundant UI sections; use existing controls.

Acceptance Criteria (DoD):
- [ ] Runs end-to-end with representative inputs
- [ ] Explainability includes formula + steps + citations
- [ ] No console errors in the audited flow
- [ ] Report produced under `docs/audits/...`

Verification Plan:
- [ ] Browser smoke flow
- [ ] Relevant quality gates (frontend/backend)

Artifacts:
- `docs/audits/<name>-audit.md`

---

## Examples (for calibration)

### Example A: Calculator audit (project-specific instance)
See the calculator audit tickets `ANO-60`–`ANO-71` (DocketMath) for an example of a standardized audit criteria block applied consistently.

### Example B: Backend reliability ticket (generic)
Problem:
- API occasionally returns 500 due to unhandled edge cases in input normalization.

Scope:
- In:
  - Add boundary validation and typed errors for the handler
  - Add regression tests for the failure case
- Out:
  - No schema migrations
  - No new external dependencies

Constraints:
- Do not use blanket suppressions (`any`, `eslint-disable`) for type errors.

Acceptance Criteria (DoD):
- [ ] Repro test added and passing
- [ ] Lint/build gates pass
- [ ] Error path returns stable error code + message

Verification Plan:
- [ ] `cd backend && npm run lint && npm run build`
- [ ] Run targeted tests: `…`

Rollback:
- Revert commit(s); the change is additive and guarded by tests.


