# Build vs Buy (Standard)

This standard prevents us from reinventing solved problems and helps us assemble reliable systems faster.

## Decision rubric (required)

When you need a new subsystem (UI, auth, billing, analytics, exports, rich text, etc.), evaluate:

1. **Time-to-ship**
   - Can we ship reliably faster by integrating an existing solution?
2. **Maintenance burden**
   - Who will maintain this in 6–12 months?
3. **Security and correctness**
   - Does the solution reduce risk compared to custom code?
4. **Compatibility**
   - Does it fit the current stack (Next.js/React, Node, TS)?
5. **Licensing**
   - Is the license compatible with the project’s needs?

## Default preference

- Prefer **buy/assemble** (reputable OSS, vendor SDKs, design systems) unless there is a clear reason to build.
- If building, keep scope minimal and modular; avoid monolith files and hidden coupling.

## Integration discipline (required)

- Pin versions where appropriate.
- Add the smallest wrapper layer that fits the codebase conventions.
- Add verification: tests and/or browser runtime checks for user-facing flows.

## Option-comparison template (required for non-trivial subsystems)

When introducing a new subsystem (or rebuilding a major one), include a short comparison using this template:

### Problem statement
- What are we building and why?

### Search plan
- GitHub queries (examples): `"<domain> sdk"`, `"<domain> react component"`, `"<domain> typescript library"`, `"<domain> mcp server"`
- Vendor docs to check (if applicable)
- Internal code to reuse (if applicable)

### Options (compare 2–4)
For each option, capture:
- **What it is** (OSS, vendor SDK, design pack, internal module, custom build)
- **Fit** (feature match, integration complexity)
- **Security/privacy** (keys, data handling, PII risk)
- **Maintenance** (bus factor, release cadence, support)
- **Cost** (licensing, infra, API costs)
- **Risks** (vendor lock-in, fragility, runtime risk)

### Recommendation
- What we choose and why
- What we are explicitly *not* choosing (and why)

### Verification plan
- Commands/tests to run
- Browser verification steps (if UI)
- Evidence requirements (freshness checks for real-world facts)

See also:
- `devbrain-handbook/build-vs-buy-repo-eval.md` (repo evaluation rubric)
- `devbrain-handbook/research-verification.md` (source reliability + anti-404)

## Where this is enforced

- Tool selection and verification: `devbrain-handbook/tool-usage-playbook.md`
- Architecture discipline: `devbrain-handbook/architecture-ops.md` (next)
- Map/dictionary: `devbrain-handbook/devbrain-map.md`, `devbrain-handbook/devbrain-dictionary.md`


