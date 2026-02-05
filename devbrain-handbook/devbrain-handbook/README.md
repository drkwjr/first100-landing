# Developer Handbook

This directory contains development standards, guidelines, and best practices for the DocketMath project. These documents define how code should be written, tested, documented, and deployed.

---

## Handbook Files

| Document | Description |
|----------|-------------|
| `coding-style.md` | Code style guidelines and conventions for consistency and clarity |
| `lint-and-typescript-style.md` | **ESLint & TypeScript style bible** - exhaustive rules, exceptions, and patterns |
| `commit-guidelines.md` | Git commit message standards and best practices |
| `cursor-guidance.md` | Cursor IDE usage, prompt patterns, and best practices |
| `deployment-checklist.md` | Pre-deployment quality gates, verification steps, and rollback procedures |
| `documentation-rules.md` | Documentation standards and guidelines for when and how to document |
| `file-conventions.md` | File naming, directory structure, and organization rules |
| `qa-rules-guide.md` | Quality assurance rules for calculator validation and business logic |
| `refactor-rules.md` | Refactoring best practices and when code can be safely refactored |
| `test-strategy.md` | Testing approach, coverage targets, and test organization standards |

---

## Quick Reference

### Start Here (Dev Brain Map)

- Primary navigation entrypoint: `devbrain-handbook/devbrain-map.md`
- Reusable primitives catalog: `devbrain-handbook/devbrain-dictionary.md`
- Learning loop + registries: `devbrain-handbook/learning-loop.md`, `devbrain-handbook/registries/*`

### For New Developers
1. Start with `coding-style.md` to understand code conventions
2. **Read `lint-and-typescript-style.md`** for lint and TypeScript standards
3. Review `file-conventions.md` for project structure
4. Read `test-strategy.md` before writing tests
5. Check `commit-guidelines.md` before your first commit

### Merge Gates / Definition of Done (TS/React)

For any change that touches **TypeScript/React** (`.ts`, `.tsx`) or TypeScript configs:

1. **Zero issues policy**
   - **No TypeScript errors** and **no ESLint errors or warnings** are allowed on main.
2. **Run the quality gates**
   - Frontend: `cd frontend && npm run quality`
   - Backend: `cd backend && npm run lint && npm run build`
   - Monorepo: `yarn lint` and `yarn tsc -b` (when shared types/configs are touched)
3. **No blanket suppressions**
   - Do not “fix” issues with `any`, unchecked casts (`as unknown as`), or broad `eslint-disable`.
   - If a narrow exception is truly required, it must include an inline rationale comment and be scoped as tightly as possible.

References:
- `devbrain-handbook/lint-and-typescript-style.md` (style bible + exceptions + playbooks)
- `docs/testing-and-quality-strategy.md` (commands + CI expectations)

### For Code Changes
- **Writing new code**: Follow `coding-style.md`, `lint-and-typescript-style.md`, and `file-conventions.md`
- **Lint/TypeScript issues**: See `lint-and-typescript-style.md` for rules and exceptions
- **Refactoring**: Review `refactor-rules.md` first
- **Adding tests**: See `test-strategy.md` for coverage expectations
- **Committing**: Use `commit-guidelines.md` for message format

### For Deployment
- **Pre-deployment**: Use `deployment-checklist.md` for quality gates
- **Documentation**: Follow `documentation-rules.md` when updating docs
- **QA Rules**: See `qa-rules-guide.md` for calculator validation

### For Cursor/Agents
- **Prompt patterns**: See `cursor-guidance.md` for effective prompting
- **Agent behavior**: All handbook files include agent-specific guidance

---

## Common Scenarios

### Starting a New Feature
1. Review `file-conventions.md` for where to place files
2. Follow `coding-style.md` for code structure
3. Write tests per `test-strategy.md`
4. Document per `documentation-rules.md`
5. Commit using `commit-guidelines.md`

### Refactoring Existing Code
1. Check `refactor-rules.md` for safety guidelines
2. Ensure test coverage exists (see `test-strategy.md`)
3. Follow `coding-style.md` for consistency
4. Update docs if structure changes (`documentation-rules.md`)

### Preparing for Deployment
1. Run through `deployment-checklist.md` quality gates
2. Verify commit messages follow `commit-guidelines.md`
3. Ensure documentation is updated (`documentation-rules.md`)
4. Confirm tests pass (`test-strategy.md`)

---

## Related Documentation

- **Project Documentation**: See [`../docs/README.md`](../docs/README.md) for architecture, features, and guides
- **Root README**: See [`../README.md`](../README.md) for project overview and setup

---

## Dev Brain Upgrades (Standards)

These standards are designed to make the assistant more reliable, more verifiable, and less likely to “paper over” TS/ESLint failures.

### Maintenance rule (non-negotiable)

When adding a new major standard/script:
- Add an entry to `devbrain-handbook/devbrain-map.md`
- Add a primitive definition (or update) in `devbrain-handbook/devbrain-dictionary.md`

1. **Pre-flight checklist standard**
   - Before edits: restate goal, scope, risks, and which quality gates will be used.
2. **Definition-of-done (DOD) template**
   - Every non-trivial change ends with: commands run, affected surfaces, and rollback notes.
3. **Typed boundary rule**
   - All external inputs start as `unknown` (API, DB rows, webhooks) and must be validated/narrowed at the boundary before use.
4. **No silent suppressions**
   - Any `eslint-disable*` or `@ts-expect-error` must include a rationale and an “expiry” (issue link or removal condition).
5. **Single-source domain types**
   - Declare canonical type modules per domain; forbid copy/paste type duplicates.
6. **Error taxonomy**
   - Prefer typed error objects (`code`, `message`, `context`) over ad-hoc thrown strings/errors.
7. **Logging contract**
   - Define what must be logged and what must never be logged (secrets/PII), and enforce structured logging in production code.
8. **No mixed module systems**
   - Make ESM/CJS policy explicit, including dynamic import patterns and “when `require()` is allowed” (ideally never in production).
9. **Quality gates, fast path vs full path**
   - Document “fast local checks” vs “full CI checks” so iteration is quick but correctness is still guaranteed.
10. **AI change discipline**
   - Require the assistant to summarize: intent, invariants preserved, behavior changes, and “what I did not change” (to reduce accidental scope creep).

### Additional enforced standards

- **Roadmap hygiene**: see `devbrain-handbook/roadmap-hygiene.md`
- **Artifact/report naming**: see `devbrain-handbook/artifact-and-report-naming.md`
- **Real-world data correctness**: see `devbrain-handbook/tool-usage-playbook.md`
- **Terminal ergonomics (no-hang)**: see `devbrain-handbook/terminal-and-command-ops.md`
- **Browser verification before “done”**: see `devbrain-handbook/tool-usage-playbook.md`
- **Agent operating model**: see `devbrain-handbook/agentic-system-ops.md`

*This handbook is maintained alongside the project codebase and should be updated when standards evolve.*

