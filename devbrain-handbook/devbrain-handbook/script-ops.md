# Script Ops (Idempotent, Resumable, No Duplicate Work)

This standard applies to scripts that process lots of inputs (URLs, files, records) or run for a long time.

## Core requirements

### 1) Idempotency

Scripts must be safe to re-run:
- re-running should not corrupt outputs
- re-running should not duplicate work product

### 2) Checkpointing

Scripts must record progress to disk so an interruption does not lose work:
- store “already processed” keys/IDs
- store minimal result summaries per item

### 3) Resume

On startup, scripts should:
- load checkpoint
- skip completed items
- continue from remaining work

### 4) Deduplication

Use stable identifiers:
- a composite key (calculator|jurisdiction|path|url), or
- a content hash (sha256 of canonical input)

### 5) Failure handling

- retry transient failures with backoff and a max attempt limit
- record failures in checkpoints to avoid infinite loops

## Reference implementation

- `scripts/devbrain/lib/checkpoints.ts` and `scripts/devbrain/lib/checkpoints.mjs`
- Example adoption: `scripts/validate-statute-urls.ts` now supports resuming via `tmp/statute-link-checkpoint.json`

## “Stop and ask” triggers

Stop and ask before implementing a script that:
- writes to production databases
- mutates many files
- requires paid API calls at scale
- collects or stores sensitive data


