# Prompt Engineering (OpenAI SDK, Few-Shot First)

**Date (current)**: 2025-12-11  
This guide is for building reliable agents/workflows using OpenAI SDKs. It prioritizes **few-shot examples**, **schema enforcement**, and **verification**.

## Ground rules

- Prefer **structured outputs** for automation.
- Prefer **few-shot** for tricky formatting and edge cases.
- Treat inputs/outputs at boundaries as `unknown` until validated.
- Add a minimal evaluation set for changes that affect agent behavior.

References:
- OpenAI Agents guide: `https://platform.openai.com/docs/guides/agents`
- OpenAI Evals guide: `https://platform.openai.com/docs/guides/evals`
- OpenAI Node SDK structured parsing examples: `https://github.com/openai/openai-node/blob/v6.1.0/helpers.md`
- OpenAI Agents SDK patterns (handoffs/manager): `https://github.com/openai/openai-agents-js`

## Few-shot patterns (templates)

### 1) Structured extraction (JSON, strict)

Use when you need deterministic machine-readable output.

Key ideas:
- Provide 2–4 examples showing edge cases.
- Require **no extra keys**.
- Reject unknown/insufficient info explicitly.

Example (conceptual):
- System: output contract + refusal rules
- User: input text
- Assistant (few-shot): valid JSON object only

### 2) Classification (single label + rationale)

Use when you need a stable decision but still want a short explanation.

Key ideas:
- Fixed label set
- “Unknown” is allowed
- Few-shot includes borderline cases

### 3) Tool/function calling (typed)

Prefer schemas and typed parsing over raw JSON parsing.

OpenAI Node SDK references:
- `runTools` and schema validation with Zod/JSON schema: `https://github.com/openai/openai-node/blob/v6.1.0/helpers.md`

## Schema enforcement (recommended default)

If you’re in TypeScript:
- Define a Zod schema for the expected output/tool args.
- Use SDK helpers (e.g., Zod → JSON Schema) to validate and parse.

This reduces “hallucinated keys” and makes failure modes testable.

## Error recovery prompts (minimal, predictable)

If output is invalid:
- Re-ask once with a minimal correction prompt:
  - restate schema
  - include the validation error
  - instruct “output JSON only”
- If it fails again, stop and escalate.

## Evaluation (required for prompt/agent changes)

Follow a lightweight eval pattern:
- Create a small set of representative cases (10–30).
- Define pass/fail criteria (schema-valid + key assertions).
- Run it before merge and after major refactors.

Reference: `https://platform.openai.com/docs/guides/evals`

## Interaction with multi-agent systems

Pair this doc with:
- `devbrain-handbook/multi-agent-architecture.md` (roles + orchestration)
- `devbrain-handbook/research-verification.md` (source quality + anti-404)


