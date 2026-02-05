# Agentic Build Best Practices (v2, Cited)

**Date (current)**: 2025-12-11  
**Purpose**: Provide a current, cited foundation for Dev Brain standards around agent systems, prompting, verification, and safe operations.

## Primary sources used

- OpenAI Agents guide: `https://platform.openai.com/docs/guides/agents`
- OpenAI Function Calling guide: `https://platform.openai.com/docs/guides/function-calling`
- OpenAI Evals guide: `https://platform.openai.com/docs/guides/evals`
- OpenAI Cookbook repository: `https://github.com/openai/openai-cookbook`
- OpenAI Agents SDK (JS/TS) repository: `https://github.com/openai/openai-agents-js`
- OpenAI Agents tracing docs (JS/TS): `https://github.com/openai/openai-agents-js/blob/main/docs/src/content/docs/guides/tracing.mdx`
- OpenAI Node SDK helpers (structured parsing + tools): `https://github.com/openai/openai-node/blob/v6.1.0/helpers.md`

## Key patterns we are standardizing in Dev Brain

### 1) Multi-agent composition patterns

From the OpenAI Agents SDK for JS/TS, two production patterns are emphasized:

- **Manager (agents as tools)**: a central agent orchestrates, invoking specialist agents exposed as tools.
- **Handoffs**: the initial agent transfers the conversation/task to a specialist once intent is known.

Source: `https://github.com/openai/openai-agents-js/blob/main/docs/src/content/docs/guides/agents.mdx`

**Dev Brain decision**: we will adopt these two patterns as the “default palette” and require a role-based workflow at minimum: **research → implement → verify**.

### 2) Guardrails + tracing are not optional

The Agents SDK includes built-in tracing that records generations, tool calls, handoffs, and guardrails, and can be viewed in the OpenAI Traces dashboard.

Source: `https://github.com/openai/openai-agents-js/blob/main/docs/src/content/docs/guides/tracing.mdx`

**Dev Brain decision**: any multi-step agent workflow should have an explicit tracing/observability plan (even if it’s “start with console-safe summaries + later tracing”).

### 3) Structured outputs and “format enforcement”

The OpenAI Node SDK supports parsing structured outputs using Zod → JSON Schema and returning typed results via `client.chat.completions.parse()` and `zodResponseFormat(...)`.

Source: `https://github.com/openai/openai-node/blob/v6.1.0/helpers.md`

**Dev Brain decision**:
- Default to **schema-backed structured outputs** for automation tasks that create work product (reports, extracted fields, transforms).
- Prefer “few-shot + strict schema + parse” over “freeform text + regex”.

### 4) Tool/function calling should be typed and validated

The OpenAI Node SDK also demonstrates tool calling patterns (`runTools`, parsing tool arguments, and strict schemas).

Source: `https://github.com/openai/openai-node/blob/v6.1.0/helpers.md`

**Dev Brain decision**:
- Treat tool boundaries like API boundaries: **`unknown` → validate → typed**.
- Add a verification step: “what tool calls happened and why” for non-trivial flows.

### 5) Evaluation is part of shipping

OpenAI provides guidance on evaluations; Dev Brain treats this as a standard for any workflow that depends on LLM outputs.

Source: `https://platform.openai.com/docs/guides/evals`

**Dev Brain decision**:
- For prompt/agent changes, include a minimal evaluation plan:
  - a small dataset (even 10–30 cases) + success criteria
  - regression checks to avoid degrading critical behavior

### 6) Freshness and provenance (no “404 facts” in production)

Dev Brain treats real-world facts as unstable unless verified:
- Prefer official sources.
- Validate URLs before promoting them into production data (e.g., statutes).

Sources:
- OpenAI Agents guide (tool use and reliable workflows): `https://platform.openai.com/docs/guides/agents`
- Repo-local verification tooling (statute URL validation): `package.json` scripts such as `validate:statutes`

**Dev Brain decision**:
- Require web verification + source links for external facts.
- Require a current date statement in final write-ups when freshness matters.

## How this maps to current Dev Brain docs

- Multi-agent orchestration + roles: `devbrain-handbook/multi-agent-architecture.md` (to be added in this sprint)
- Prompt engineering (few-shot + schema + eval): `devbrain-handbook/prompt-engineering-openai.md` (to be added)
- Source verification + anti-404: `devbrain-handbook/research-verification.md` (to be added)
- Terminal no-hang discipline: `devbrain-handbook/terminal-and-command-ops.md` (expanded in this sprint)


