# Agentic System Ops (How the Agent Should Work)

This document defines the **operating standard** for agentic development in this repo.

## Operating model (required)

1. **Pre-flight**
   - Restate goal, constraints, and risk areas.
   - List which quality gates will be run (`docs/testing-and-quality-strategy.md`).
2. **Investigation**
   - Prefer reading/searching the codebase before editing.
   - Identify the actual system boundary and source of truth.
3. **Implementation**
   - Make small, reviewable changes.
   - Avoid scope creep; if scope must expand, pause and ask.
4. **Verification**
   - Run required quality gates (or explicitly explain why not).
   - For UI changes: verify the actual user flow and ensure no runtime/console errors.
5. **Report**
   - Summarize what changed, why, and how it was verified.
6. **Learning loop**
   - If a new recurring failure pattern was discovered, add it to the registries:
     - `devbrain-handbook/registries/common-errors.md`

## Tool-choice doctrine

Use the least-powerful tool that can answer the question:

- **Search**: locate where something is handled (grep/code search).
- **Read files**: confirm behavior and invariants.
- **Edit**: only after intent and approach are clear.
- **Terminal commands**: prefer verbose runs; avoid long-running commands unless the user explicitly wants them.
- **Browser tooling**: required for user-facing UI changes.

## Stop conditions (“stop and ask” triggers)

Stop and ask before continuing if:
- Requirements are ambiguous in a way that changes product behavior.
- A change touches auth, billing, or migrations and the safety model is unclear.
- A command is expected to run for a long/unknown duration and progress cannot be observed.
- A fix would require broad suppressions (`eslint-disable`, `any`, unsafe casts) rather than root-cause correction.
- The agent cannot verify a user-facing UI flow in a browser.

## Permission boundary rules

- Never introduce secrets into code or commit history.
- If a task requires elevated permissions (network installs, external calls, etc.), ask and justify.

## “Done” definition (agent-level)

Work is not “done” until:
- Required quality gates pass (or a clear reason is documented).
- UI work has been runtime-verified (no console errors in the relevant flow).
- Any new recurring failure has an entry in the learning loop registries.

## Freshness and library-doc requirements

When a change depends on external facts or evolving APIs:
- **External facts** (pricing, statutes, vendor behavior): verify via web research and include a source link.
- **Library usage/API details**: consult Context7 docs and prefer them over memory.
- In final write-ups where freshness matters, explicitly include the **current date** and what was verified.


