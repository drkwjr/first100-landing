# Build vs Buy: Repo Evaluation Rubric (Adopt Safely)

This rubric standardizes how we evaluate OSS repos/design packs before adoption.

## Repo scoring rubric (0–2 each)

Score each category 0 (bad/unknown), 1 (acceptable), 2 (strong). Prefer options scoring high in the categories that matter most for the subsystem.

1. **License fit**
2. **Maintenance activity**
   - Recent commits/releases, active issues/PRs
3. **Security posture**
   - Security policy, responsible disclosure, track record
4. **Documentation quality**
   - Clear setup, examples, migration notes
5. **Test quality**
   - Tests exist, CI is present, release process is stable
6. **API stability**
   - Semver, changelog, compatibility notes
7. **Ecosystem fit**
   - TypeScript types, Node/React compatibility, SSR support if needed
8. **Operational fit**
   - Requires keys? paid API? vendor lock-in? data residency concerns?

## Adopt safely checklist (required)

- Pin versions (or lockfile) and document upgrade cadence.
- Wrap external dependencies minimally (don’t leak vendor types across the codebase unless intentional).
- Add verification (tests + runtime verification for UI flows).
- Avoid introducing new secrets. If keys are required, document how they are provisioned and stored.
- Add an ADR-lite if the decision is long-lived or high-impact (`docs/architecture/decisions/`).

## “Stop and ask” triggers

Stop and ask before adopting if:
- License is unclear or incompatible.
- The repo is unmaintained or has major unresolved security concerns.
- Adoption would require extensive custom patching (high maintenance burden).


