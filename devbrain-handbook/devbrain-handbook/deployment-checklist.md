# Production Deployment Checklist

This checklist is used for production-facing releases and significant feature rollouts.

## Pre-Deployment Quality Gates (Required)

### Testing requirements

- [ ] Core functionality tests passing (prefer integration coverage for real flows)
- [ ] No TypeScript errors and no lint errors/warnings (per `docs/testing-and-quality-strategy.md`)
- [ ] Key user journeys verified (manual or scripted)
- [ ] Database migrations tested in a staging-like environment (if applicable)
- [ ] Environment variables documented and validated

### Documentation standards

- [ ] Architecture notes updated for significant structural changes (see `devbrain-handbook/architecture-ops.md` once added)
- [ ] Behavior changes documented (what changed, why, risk scope)
- [ ] Breaking changes highlighted with a migration path

### Security and performance

- [ ] No hardcoded secrets or API keys in codebase
- [ ] Input validation implemented for user-facing interfaces
- [ ] Error handling is graceful with appropriate user messaging
- [ ] Resource usage is reasonable (memory/CPU/DB)

### Deployment readiness

- [ ] Rollback plan is documented for critical changes
- [ ] Monitoring/alerts updated for new feature failure modes (if applicable)
- [ ] Feature flags used for gradual rollout when appropriate

## Post-Deployment Verification (Required)

### Functional verification

- [ ] Core feature works in production environment
- [ ] Integration points are functional (APIs, DB, external services)
- [ ] User flows complete without critical errors
- [ ] Error rates normal compared to baseline

### Monitoring and observability

- [ ] Application logs are clean (no unexpected errors)
- [ ] Dashboards/alerts functioning for critical failure modes
- [ ] User feedback channels monitored for regressions

## End-of-Work Cleanup (Required)

### Code quality

- [ ] Temporary files removed (debug scripts, scratch files)
- [ ] No raw `console.*` left in production code
- [ ] TODO comments addressed or converted to tracked work items
- [ ] Dead code eliminated (unused imports/functions/files)

### Knowledge management

- [ ] Learning loop updated if a recurring failure occurred (`devbrain-handbook/learning-loop.md`)
- [ ] Common errors registry updated if a new signature/fix pattern was discovered (`devbrain-handbook/registries/common-errors.md`)

## Emergency procedures

### Rollback protocol

1. Stop traffic to the affected feature (feature flag if available).
2. Revert migrations if schema changes are problematic (if applicable).
3. Deploy previous stable version.
4. Verify rollback restored expected functionality.
5. Communicate status and next steps.
