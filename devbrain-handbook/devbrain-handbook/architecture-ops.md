# Architecture Ops (Plan First, Maintain Continuously)

This standard forces architectural thinking before implementation and keeps the architecture maintainable over time.

## Architecture-first checklist (required before non-trivial builds)

Before building a new subsystem or feature, write a brief plan that answers:

1. **Boundaries**
   - What are the modules and their responsibilities?
2. **Data flow**
   - What data enters/exits? Where is validation performed?
3. **Types**
   - Where do types live? What is the canonical domain type source?
4. **Failure modes**
   - What can fail? What happens when it fails?
5. **Scaling and maintenance**
   - How does this evolve without creating a monolith file?
6. **Verification**
   - Which quality gates and runtime checks prove correctness?

## Avoiding monoliths (required)

- Prefer smaller modules and clear boundaries over “mega files”.
- If a file grows unwieldy, refactor into submodules with tests.
- Avoid dumping unrelated logic into `utils.ts` style catch-alls.

## Architecture maintenance (continuous)

When you make a structural change (new module boundary, major refactor, new external dependency), update:
- `devbrain-handbook/devbrain-map.md` (navigation)
- `devbrain-handbook/devbrain-dictionary.md` (primitives)
- Any relevant architecture note (ADR) if the decision is non-obvious or long-lived

## ADR-lite (tiny decision records)

Create small, skimmable decision records for significant choices:

Location:
- `docs/architecture/decisions/`

Template:
- Title (date + decision)
- Context (what problem)
- Decision (what we chose)
- Alternatives (what we considered)
- Consequences (tradeoffs)


