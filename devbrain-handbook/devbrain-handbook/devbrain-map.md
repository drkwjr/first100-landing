# Dev Brain Map (Start Here)

This is the **single navigation entrypoint** for Dev Brain standards in this repo.

Rule: **Do not duplicate content** here. Link out to the canonical doc/script instead.

## If you only read one thing

- **Core standards**: `devbrain-handbook/README.md`
- **TS/ESLint prevention playbook**: `devbrain-handbook/lint-and-typescript-style.md`
- **Quality gates + commands**: `docs/testing-and-quality-strategy.md`
- **Linear ticketing (agent-executable work tickets)**: `devbrain-handbook/linear-ticketing-playbook.md`
- **Agent operating model**: `devbrain-handbook/agentic-system-ops.md`
- **Terminal/command “no-hang” policy**: `devbrain-handbook/terminal-and-command-ops.md`
- **Tool choice + browser verification**: `devbrain-handbook/tool-usage-playbook.md`
- **MCP inventory + tool selection**: `devbrain-handbook/mcp-inventory.md`
- **Architecture discipline**: `devbrain-handbook/architecture-ops.md`
- **Learning loop + registries**: `devbrain-handbook/learning-loop.md`

## Where to look first (common scenarios)

### Product language consistency (“credit” vs “token”)

- See: `devbrain-handbook/product-language-credit.md`

### TypeScript/Lint errors

1. `devbrain-handbook/lint-and-typescript-style.md` (rules + prevention patterns + playbook)
2. `devbrain-handbook/registries/common-errors.md` (error signature index)
3. Run gates per `docs/testing-and-quality-strategy.md`

### UI changes / runtime verification

1. `devbrain-handbook/tool-usage-playbook.md` (browser verification contract)
2. Run frontend gates: `cd frontend && npm run quality`
3. Verify no runtime/console errors in the relevant flow

### Backend changes

1. `devbrain-handbook/agentic-system-ops.md` (stop conditions + safe change protocol)
2. Run backend gates: `cd backend && npm run lint && npm run build`
3. If touching shared types/configs: also run `yarn tsc -b`

### Running commands (avoid hangs)

1. `devbrain-handbook/terminal-and-command-ops.md`
2. Prefer `scripts/devbrain/*` runners (verbose + watchdog)

### “Is this fact current in real life?”

1. `devbrain-handbook/tool-usage-playbook.md` (freshness protocol)
2. Require a current source (link) if a fact can drift (pricing, statutes, third-party APIs)

### “Should we build this or assemble something existing?”

1. `devbrain-handbook/build-vs-buy.md` (decision rubric + integration discipline)
2. `devbrain-handbook/build-vs-buy-repo-eval.md` (repo scoring + adopt-safely checklist)
2. `devbrain-handbook/tool-usage-playbook.md` (tool choice + verification)

### “We’re building an agent system / multi-agent workflow”

1. `devbrain-handbook/multi-agent-architecture.md` (roles, orchestration, model escalation)
2. `devbrain-handbook/prompt-engineering-openai.md` (few-shot + schema + eval patterns)
3. `devbrain-handbook/agentic-system-ops.md` (stop conditions + safe change protocol)

### “We’re running a long script / batch job”

1. `devbrain-handbook/script-ops.md` (checkpointing, idempotency, resume)
2. `devbrain-handbook/terminal-and-command-ops.md` (45–60s rule + readable progress)
3. `devbrain-handbook/research-verification.md` (if ingesting external facts/URLs)

### “We’re designing or building the blog”

1. `docs/design/blog-first-principles.md` (goals, UX, a11y, SEO, content model, scope, workflow)
2. `docs/design/blog-design-system.md` (blog-specific tokens, components, polish, a11y)
3. `docs/product/blog-content-strategy.md` (topic types, calculator × jurisdiction, meta posts, feature launches, workflow)
4. `docs/architecture/decisions/2025-01-29-blog-content-model-file-based.md` (file-based Markdown choice)
5. `docs/features/blog-seo-engine.md` (automation: LLM drafts, scheduling)

## Structure overview (handbook-only)

- `devbrain-handbook/README.md` (index)
- `devbrain-handbook/devbrain-map.md` (this file)
- `devbrain-handbook/devbrain-dictionary.md` (reusable primitives + composition)
- `devbrain-handbook/lint-and-typescript-style.md` (lint/TS bible)
- `devbrain-handbook/agentic-system-ops.md` (how the agent works)
- `devbrain-handbook/terminal-and-command-ops.md` (no-hang execution)
- `devbrain-handbook/tool-usage-playbook.md` (tool choice + browser verification + freshness)
- `devbrain-handbook/build-vs-buy.md` (build vs buy rubric)
- `devbrain-handbook/build-vs-buy-repo-eval.md` (repo evaluation)
- `devbrain-handbook/multi-agent-architecture.md` (multi-agent patterns)
- `devbrain-handbook/prompt-engineering-openai.md` (prompting + few-shot + eval)
- `devbrain-handbook/research-verification.md` (no 404s in production)
- `devbrain-handbook/script-ops.md` (resumable scripts)
- `devbrain-handbook/learning-loop.md` (how we learn + update registries)
- `devbrain-handbook/registries/*` (indexes)
- `devbrain-handbook/research/*` (cited external best practices)


