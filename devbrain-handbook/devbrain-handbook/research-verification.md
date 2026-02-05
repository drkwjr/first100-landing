# Research Verification (No 404s in Production)

This standard defines how we use internet research safely. The goal is to stop “plucking” unreliable facts into production.

## Source hierarchy (default)

1. Official sources (vendor docs, government sites, official standards)
2. Reputable secondary sources (well-known engineering orgs, established publishers)
3. Community sources (GitHub issues, StackOverflow, Reddit) — last resort and must be corroborated

## Anti-404 policy (required)

Before promoting any URL into production data (statutes, citations, references):

- Validate the URL responds successfully (prefer < 400 status).
- If it redirects, verify the destination is acceptable and stable.
- If it’s paywalled or license-restricted (Lexis/Westlaw), treat it as “not a public citation” and handle accordingly.

Repo tooling:
- `yarn validate:statutes` (statute URL validation)
- Output reports in `tmp/` (see the script output)

## Evidence requirements

When research influences an implementation decision:
- Include the current date.
- Include at least one source link.
- If multiple sources disagree, state that explicitly and choose conservatively.

## When to stop and ask

Stop and ask before using external information when:
- it changes legal/compliance behavior
- it depends on paid vendor behavior or a dashboard setting
- the sources are inconsistent or low credibility


