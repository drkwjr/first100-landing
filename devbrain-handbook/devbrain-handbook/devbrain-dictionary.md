# Dev Brain Dictionary (Reusable Primitives + Composition)

This is the canonical catalog of **reusable Dev Brain primitives**. It explains what each primitive is, when to use it, and how primitives compose into a reliable agentic workflow.

## Core primitives

### PreFlight
- **Definition**: A short statement of goal, scope, constraints, risks, and verification gates before changes start.
- **Used in**: `agentic-system-ops.md`
- **Why**: Prevents hidden scope creep and makes later verification unambiguous.

### DOD (Definition of Done)
- **Definition**: The required checks and evidence before “done” can be claimed.
- **Used in**: `docs/testing-and-quality-strategy.md`, `devbrain-handbook/README.md`

### QualityGates
- **Definition**: The commands that prove “no TS/lint regressions” (frontend/backend/monorepo).
- **Source of truth**: `docs/testing-and-quality-strategy.md`

### NoHangRuns
- **Definition**: A command-running policy that guarantees visible progress and avoids silent stalls.
- **Source of truth**: `terminal-and-command-ops.md`
- **Implementation**: `scripts/devbrain/*` (watchdog + verbose runners)

### BoundaryValidation
- **Definition**: External inputs begin as `unknown` and are validated/narrowed at the boundary (API, DB rows, webhooks, third-party SDK responses).
- **Source of truth**: `lint-and-typescript-style.md`

### ErrorTaxonomy
- **Definition**: Typed errors with stable codes + context, instead of ad-hoc strings.
- **Why**: Enables consistent handling, testability, and debugging.

### FreshnessProtocol
- **Definition**: For real-world facts that can drift (pricing, statutes, vendor behavior), require explicit verification + a source link.
- **Source of truth**: `tool-usage-playbook.md`

### BrowserVerification
- **Definition**: For user-facing changes, validate the flow end-to-end and ensure no runtime console errors before claiming done.
- **Source of truth**: `tool-usage-playbook.md`

### LinearTicketTemplate
- **Definition**: A required, ordered structure for Linear issue descriptions (Problem → Scope → Constraints → DoD → Verification → Artifacts → Risks → Rollback) so tickets are agent-executable.
- **Source of truth**: `linear-ticketing-playbook.md`

### TicketMetadataContract
- **Definition**: Standard usage rules for Linear metadata (Project, Labels, Priority, State, Cycle, Assignee/Delegate, Parent/child) so work is queryable and schedulable.
- **Source of truth**: `linear-ticketing-playbook.md`

### AgentExecutableTicket
- **Definition**: A ticket that contains explicit inputs/outputs, stop-and-ask triggers, and a verification plan (commands and/or user flows) sufficient for an agent to complete the work without guesswork.
- **Source of truth**: `linear-ticketing-playbook.md`

### StopConditions
- **Definition**: “Stop and ask” triggers (ambiguous requirements, risky migrations/deletes, permission escalations).
- **Source of truth**: `agentic-system-ops.md`

### MCPInventory
- **Definition**: The canonical “what tools exist” list (MCP servers) and how to choose tools without overuse.
- **Source of truth**: `mcp-inventory.md`

### BuildVsBuyDecision
- **Definition**: A standard rubric for deciding whether to build vs assemble an existing solution, including integration discipline.
- **Source of truth**: `build-vs-buy.md`

### BuildVsBuyRepoEval
- **Definition**: A standardized rubric for evaluating external repos/design packs and adopting them safely.
- **Source of truth**: `build-vs-buy-repo-eval.md`

### ArchitectureOps
- **Definition**: Architecture-first planning checklist + ongoing maintenance rules to prevent monoliths.
- **Source of truth**: `architecture-ops.md`

### MultiAgentArchitecture
- **Definition**: A role-based, supervisor/worker pattern for building agent systems with narrow construction and cost-aware model escalation.
- **Source of truth**: `multi-agent-architecture.md`

### ScriptOps
- **Definition**: Idempotent + resumable scripts using checkpoints and deduplication to avoid duplicated work.
- **Source of truth**: `script-ops.md`

### ResearchVerification
- **Definition**: How to validate internet sources and prevent broken/404 links and low-credibility facts from entering production.
- **Source of truth**: `research-verification.md`

### PromptEngineering
- **Definition**: Few-shot prompting + schema enforcement + eval patterns for OpenAI SDK-based agent workflows.
- **Source of truth**: `prompt-engineering-openai.md`

## Composition (how primitives chain)

### The canonical workflow

1. **PreFlight** (goal/scope/risks/gates)
2. **Investigate** (read/search before editing)
3. **Implement** (small, reviewable steps)
4. **QualityGates** (fast path vs full path)
5. **BrowserVerification** (if UI)
6. **DOD summary** (what changed, commands run, evidence)
7. **LearningLoop update** (if a new/common failure pattern was encountered)

## Extendability rules

When adding a new “system capability” (doc, script, convention):

1. Add it to `devbrain-map.md` (so it’s discoverable)
2. Add it here with a definition + link
3. Add enforcement (Cursor rules and/or scripts) if it’s a non-negotiable standard


