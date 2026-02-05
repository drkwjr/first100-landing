# Agentic Coding Docs: Best-Practice Patterns (Research Findings)

This write-up summarizes how teams structure documentation and guardrails to make coding agents reliable, predictable, and easy to supervise. It focuses on **documentation patterns** (not model-specific prompt tips), and translates them into concrete Dev Brain standards.

## Sources (primary + community)

- OpenAI Agents guide: `https://platform.openai.com/docs/guides/agents`
- OpenAI Function Calling guide: `https://platform.openai.com/docs/guides/function-calling`
- OpenAI Evals (evaluation guidance): `https://platform.openai.com/docs/guides/evals`
- Anthropic Claude Code docs: `https://code.claude.com/docs`
- Google AI for Developers (Gemini): `https://ai.google.dev/`
- GitHub code search for instruction entrypoints:
  - `AGENTS.md`: `https://github.com/search?q=filename%3AAGENTS.md&type=code`
  - `CLAUDE.md`: `https://github.com/search?q=filename%3ACLAUDE.md&type=code`

## What “good agent documentation” looks like in practice

### 1) One canonical entrypoint + a map
Teams converge on having a single “start here” file that answers:
- What is this repo?
- How do I run quality gates?
- Where are the rules for coding style/testing/tool use?
- What is the agent allowed to do vs must ask first?

**Why it matters**: agent performance degrades when instructions are scattered and duplicative. A map reduces time-to-correct-context and reduces drift.

### 2) Layered docs: policy → playbooks → checklists
Strong doc systems separate:
- **Policy** (what is allowed/forbidden)
- **Playbooks** (what to do when X happens)
- **Checklists** (what “done” means)

**Why it matters**: policies prevent bad behavior; playbooks prevent repeated debugging loops; checklists prevent “declaring victory” too early.

### 3) Tool-use and safety as first-class documentation
Modern agent guidance emphasizes:
- Explicit boundaries on tool use (what’s allowed, when to escalate permissions)
- Guardrails around destructive actions (migrations, deletes, bulk refactors)
- Auditability (what was run/changed, and why)

This aligns with mainstream agent guidance that emphasizes reliable tool invocation, explicit verification, and safe stopping rules.

### 4) Evaluation and verification is part of the doc contract
Agentic teams treat evaluation as a requirement, not a nice-to-have:
- “Fast path” checks for iteration
- “Full path” checks for merge/release
- UI/runtime verification when changes are user-facing

### 5) “Freshness-required facts” must be explicitly verified
Best-practice systems distinguish:
- Stable internal facts (repo code, tests, schemas)
- Unstable external facts (pricing, statute URLs, third-party API behavior)

When the fact is external and can change, the doc contract requires explicit verification (and ideally a cited source).

## How these findings map to Dev Brain standards

These findings directly motivate the following Dev Brain deliverables:

- `devbrain-handbook/devbrain-map.md`: single navigation entrypoint
- `devbrain-handbook/devbrain-dictionary.md`: reusable primitives + composition
- `devbrain-handbook/agentic-system-ops.md`: end-to-end operating model + stopping rules
- `devbrain-handbook/terminal-and-command-ops.md`: no-hang, observable command execution
- `devbrain-handbook/tool-usage-playbook.md`: browser verification + tool-choice doctrine + external fact freshness protocol
- `devbrain-handbook/learning-loop.md` + registries: convert recurring failures into stable playbooks

## Implementation decisions we’ll follow

1. **Map-first**: every major standard/script must be linked from the map.
2. **No duplication**: the map/dictionary link out to details; they should not become a second handbook copy.
3. **Enforced “done”**: “done” requires running the documented gates (or explicitly stating why not).
4. **Explicit stop conditions**: agent must stop/ask on ambiguous or high-risk changes.
5. **External-data freshness**: require live verification/citation when facts can change.


