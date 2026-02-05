# Product Language: “Credit” vs “Token” (DocketMath)

## Rule (non-negotiable)

- **DocketMath’s product currency is called a _credit_**.
- Do **not** use “token” as a synonym for “credit” in user-facing language, docs, schemas, or scripts.

## Allowed use of “token”

The word “token” is only acceptable when it is **literally** an authentication / API credential, e.g.:

- `AIRTABLE_TOKEN` (Airtable personal access key / PAT)
- OAuth tokens, JWTs, CSRF tokens
- `SUPABASE_SERVICE_ROLE_KEY` / keys used to authenticate to third-party systems

## Why this exists

We intentionally standardized on **credit** across the product and supporting systems to avoid confusion and regressions after a prior cleanup effort.


