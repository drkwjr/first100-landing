# Tool Usage Playbook (Search, Terminal, Browser, External Facts)

This document defines how to choose tools and how to verify outcomes so we avoid brittle “looks good” changes.

## Tool choice (default order)

1. **Repo search** (fast, non-invasive)
   - Use when you don’t know where logic lives.
2. **Read files** (confirm reality)
   - Use when you need to understand behavior precisely.
3. **Edit** (after intent is clear)
4. **Run commands** (prove correctness)
5. **Browser verification** (required for user-facing UI changes)

## Browser verification standard (non-negotiable for UI)

For any user-facing UI change:

- Navigate to the relevant flow and exercise the critical path.
- Confirm the page renders correctly and interactions work.
- Check **runtime console** for errors.
- Do not claim “done” if there are console errors in the flow.

## External fact freshness protocol (non-negotiable)

If a claim depends on real-world data that can drift (pricing, statutes, vendor behavior, breaking API changes):

- Treat the fact as **unknown until verified**.
- Verify with a current source and include a link in the write-up or the doc entry.
 - Prefer web research for external reality and Context7 for library docs.

Examples of freshness-required facts in this repo:
- Statute citation URLs (see `docs/product/known-bugs.md`)
- Vendor dashboards (Stripe settings, Supabase config)

## “Current date” requirement

In any final write-up where freshness matters, explicitly state today’s date and what was verified (and how).

## What not to do

- Don’t rely on model cutoff memory for current facts.
- Don’t “fix” uncertainty by adding unsafe casts or suppressions.
- Don’t declare victory without running the relevant gates.


