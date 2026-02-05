# MCP Inventory + Tool Selection Framework

This repo uses MCP servers configured in `mcp.json`.

Important: `mcp.json` is **intentionally local** (contains secrets and machine-specific paths) and is **ignored by git** via `.gitignore`.

## What “inventory” means

- `mcp.json` is the authoritative list of *what tools exist* in your environment across projects.
- Whether a tool is “plugged in” is environment-dependent (keys present, local services running, etc.).

## How to choose tools (avoid overuse)

Default rule: use the **least powerful** method that can solve the task.

1. **Read/search the repo first**
   - Use repo search + file reads to understand the system before using external tools.
2. **Use MCP tools when they materially reduce risk or time**
   - Example: use `context7` for library API docs; use `supabase` when you need real schema info; use browser tooling for runtime verification.
3. **Don’t use tools “because they exist”**
   - Tools should be used to reduce uncertainty or prove correctness, not to add activity.

## Recommended usage (by MCP server)

- **context7**
  - Use for *current* library documentation and correct APIs/versions.
- **filesystem / commands**
  - Use for local inspection and safe, observable command execution.
- **Playwright / chrome-devtools**
  - Use for UI/runtime verification and catching console/runtime errors.
- **supabase / postgres**
  - Use when you need authoritative DB schema, RPCs, or query behavior.
- **memory**
  - Use for persistent notes where appropriate, but avoid storing secrets.

## Freshness rule

If a fact depends on external reality (pricing, statutes, vendor dashboards), treat it as **unknown until verified**.

See:
- `devbrain-handbook/tool-usage-playbook.md`
- `devbrain-handbook/agentic-system-ops.md`


