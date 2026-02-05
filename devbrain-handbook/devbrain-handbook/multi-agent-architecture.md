# Multi-Agent Architecture (Narrow Construction, Cost-Aware)

This standard defines how we design agent systems so they are **modular, cheap where possible, reliable, and verifiable**.

It is intentionally aligned with two common production patterns described in the OpenAI Agents SDK:
- **Manager (agents-as-tools)**
- **Handoffs**

Reference: `https://github.com/openai/openai-agents-js/blob/main/docs/src/content/docs/guides/agents.mdx`

## Default architecture

Use a **Supervisor** that orchestrates a set of narrow agents:

- **Scout**: web research and source gathering (freshness + citations)
- **Librarian**: API/library correctness (Context7)
- **Implementer**: code changes
- **Verifier**: quality gates + browser console checks + regression checks
- **Auditor**: privacy/security review (secrets, PII, data handling)

The supervisor is responsible for:
- selecting which agents run
- managing tool permissions
- ensuring verification is completed before “done”

## Model selection (cost-aware)

Default policy:

- Use a **fast/cheap model** for narrow, deterministic work (formatting, straightforward extraction, boilerplate updates).
- Use a **reasoning-capable model** for system design, tricky debugging, or multi-module changes.

Escalate to a larger model only when:
- requirements are ambiguous or high-stakes (billing/auth/legal)
- failure cost is high
- the smaller model is repeatedly producing unreliable outputs

## Tool permissions per role

Keep permissions minimal:

- Scout: web search + browser tools (no code edits)
- Librarian: Context7 (no code edits)
- Implementer: code edits + repo search (no external calls unless needed)
- Verifier: terminal commands + browser verification
- Auditor: repo read + policy checks (no external calls unless required)

## Artifacts and work product

Each role should produce a small artifact:

- Scout: sources + notes (with URLs and date)
- Librarian: API excerpts and recommended calls (Context7-based)
- Implementer: diff summary + files touched
- Verifier: commands run + results + screenshots/console status when UI
- Auditor: risks + mitigations + what must be redacted

Use `devbrain-handbook/artifact-and-report-naming.md` for naming.

## Verification contract

No multi-agent workflow is “done” until:
- quality gates pass (or explicit reason given)
- browser runtime verification is complete for UI changes
- external facts are verified with sources (and date stated)


