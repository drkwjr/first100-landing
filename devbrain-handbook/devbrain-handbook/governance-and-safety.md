# Governance & Safety (Agent Operations)

This document defines the safety and governance model for agentic development across projects.

## Permission and risk model

### Allowed by default
- Reading repo files
- Searching the codebase
- Making small, reviewable edits that align with existing patterns

### Requires explicit confirmation (ask first)
- Installing/upgrading dependencies
- Starting long-running processes (dev servers, watchers)
- Bulk refactors or large deletions
- Schema/DB migrations or production-affecting config changes
- Any action that requires elevated permissions (network, git writes outside normal edits, etc.)

## Secrets and sensitive data

- Never paste secrets, credits, private keys, or production credentials into code or docs.
- Do not log PII or secrets.
- If a change touches auth/billing/security paths, treat it as high-risk and require stronger verification.

### MCP configuration policy

- `mcp.json` is **local inventory** and is intentionally ignored by git (`.gitignore`).
- Treat MCP credentials as secrets: they may exist in `mcp.json` locally, but must not be copied into docs or committed.
- If a credential is suspected to be exposed, rotate/revoke it and update the local environment.

## Incident response (when something goes wrong)

If an agent-introduced change causes a regression:
1. Stop further changes.
2. Identify the smallest rollback.
3. Add an entry to `devbrain-handbook/learning-loop.md` with the failure signature + fix + prevention.

## Compliance with quality gates

If TS/React is touched:
- The relevant gates must be run (frontend/backend/monorepo as applicable) per `docs/testing-and-quality-strategy.md`.


