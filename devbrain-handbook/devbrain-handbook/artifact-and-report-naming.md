# Artifact & Report Naming (Searchable, Non-Generic)

This standard ensures generated outputs (reports, audits, verification logs) are easy to find and don’t become “mystery files”.

## Naming convention (required)

Use:

`YYYY-MM-DD__scope__purpose__optionalContext.ext`

Examples:
- `2025-12-11__frontend__quality-run__lint-and-typecheck.txt`
- `2025-12-11__backend__build__tsc-output.txt`
- `2025-12-11__ui__verification__pricing-flow.md`
- `2025-12-11__docs__agentic-research__sources.md`

## Rules

- Include date first for sorting.
- Scope must be one of: `frontend`, `backend`, `ui`, `docs`, `ci`, `scripts`, `infra`.
- Purpose must be specific (avoid “report”, “notes”, “stuff”).
- If the artifact is tied to a feature/bug, include a short context suffix (calculator name, issue slug).


