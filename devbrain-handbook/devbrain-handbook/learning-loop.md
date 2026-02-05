# Dev Brain Learning Loop (How We Maintain Shared Knowledge)

The goal of this system is to make recurring failures **less likely every time they happen**.

This doc defines what we record, where it lives, and how agents and humans use it.

## What we track

### 1) Common error signatures
Examples:
- TypeScript compiler errors (e.g., `TS2786`, `TS2322`)
- ESLint rule failures (e.g., `react-hooks/exhaustive-deps`, `@typescript-eslint/no-unused-vars`)
- Build pipeline failures (frontend type-check, backend build, monorepo `tsc -b`)

We store these in:
- `devbrain-handbook/registries/common-errors.md`

### 2) Known issues (canonical, not duplicated)
Project-known issues must live in the project’s canonical bug tracker doc and be **linked**, not copied.

For this repo, canonical known issues live in:
- `docs/product/known-bugs.md`

We maintain a lightweight link index in:
- `devbrain-handbook/registries/known-issues.md`

### 3) Flaky tests and environmental failures
Examples:
- A test that fails only in CI
- A command that hangs without output
- A service dependency that is intermittently unavailable

We store these as entries in `devbrain-handbook/registries/common-errors.md` with:
- Symptom
- Root cause (if known)
- “Fast path” workaround
- “Real fix”

### 4) Freshness-required facts
Examples:
- Statute URLs
- Vendor pricing
- Third-party API behavior

These must be verified with a current source link. Rules for this are in:
- `devbrain-handbook/tool-usage-playbook.md`
 - `devbrain-handbook/research-verification.md`

### 5) Script reliability failures
Examples:
- A script that can’t resume after interruption
- A script that reprocesses and duplicates work

Rules and patterns are in:
- `devbrain-handbook/script-ops.md`

## When to add/update entries

Create or update an entry whenever:
- The same failure has occurred more than once, or
- The fix required non-obvious steps, or
- The fix could be safely standardized into a repeatable playbook.

## Entry format (required)

Every new entry must include:
- **Signature**: the exact error string / rule name / symptom
- **Where it happened**: command + file(s)
- **Root cause**
- **Fix**
- **Prevention**
- **Verification**: the exact commands to run to prove it’s resolved
- **Links**: to PRs/docs/issues when available

## How agents should use this

1. Search `devbrain-handbook/registries/common-errors.md` for a matching signature.
2. Apply the documented fix and re-run the verification commands.
3. If no match exists, proceed with normal investigation.
4. After resolution, add a new entry (and link it from `devbrain-handbook/devbrain-map.md` if it’s high-frequency).


