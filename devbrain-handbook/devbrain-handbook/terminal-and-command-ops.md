# Terminal & Command Ops (No-Hang, Observable, Safe)

This document standardizes how commands should be proposed and run so they do not “hang silently” and so you can observe progress.

## No-hang policy (non-negotiable)

- Commands must be run in a way that provides **continuous, human-readable progress**.
- Avoid `--silent` or suppressed output.
- If a command can run for a long/unknown duration, prefer:
  - A wrapper that prints elapsed time/progress, or
  - Proposing the command for the user to run (especially installs, builds, dev servers).

## 45–60 second rule (default)

If a command is likely to take **more than ~45–60 seconds**, default to **proposing** the command for you to run unless:
- you explicitly asked the agent to run it, or
- the agent can guarantee visible progress output (and you want it run).

This reduces “silent hang” anxiety and keeps you in control for long-running operations.

## Terminal reuse policy (explain when we need a new terminal)

- Prefer reusing an existing terminal session when possible.
- Only use a new terminal when it provides real value, e.g.:\n  - one terminal for a long-running server and another for short commands\n  - isolating a long build from other work\n+- When creating/using a different terminal, explicitly state why.

## When the agent should propose a command instead of running it

Propose (don’t execute) when:
- Duration is unknown or likely long (installs, full e2e suites, dev servers).
- The command may require interactive input.
- It changes the environment significantly (dependency installs, global state).

## When the agent can run a command

Run directly when:
- It’s short and deterministic (formatting a single file, quick type-check, targeted test).
- Output will be visible and progress can be observed.

## Standard wrappers (preferred)

- `node scripts/devbrain/run-quality.mjs all` (runs the correct quality gates with progress output)
- `node scripts/devbrain/run-with-watchdog.mjs -- <command>` (wraps any command with elapsed-time progress output)
- `node scripts/devbrain/run-frontend-verify.mjs` (runs frontend gates and prints a browser verification checklist)

These scripts should be used in docs and CI/check scripts so that the “right way” becomes the default.

## Required output contract for command runs

When running commands, always show:
- The exact command being run
- The working directory
- Visible output (no silencing)
- If taking longer than expected: periodic “still running” + elapsed time
 - Clear phase headers (e.g. “Step 1/3: lint”, “Step 2/3: type-check”)


