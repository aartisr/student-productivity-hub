# Release Gates and Incident SLA

This checklist is the operational contract for shipping and support.

## Release Gates (Must Pass)

1. Build gate: `npm run verify` passes.
1. Security gate: runtime dependency scan shows no new unresolved critical findings.
1. Access control gate: RBAC smoke test passes.
1. UX gate: responsive smoke test passes on mobile profile.
1. Docs gate: release-impacting behavior changes reflected in wiki and README.

## Required Pre-Release Commands

```bash
npm run verify
npx playwright test tests/e2e/access-control.spec.ts --project=mobile-iphone-13-mini
npx playwright test tests/e2e/responsive.spec.ts --project=mobile-iphone-13-mini
npm audit --omit=dev
```

## Deployment Readiness

1. `NEXTAUTH_URL` configured for target environment.
1. Strong `AUTH_SECRET` configured from secrets manager.
1. Provider callback URLs match deployed host exactly.
1. `INSTRUCTOR_EMAILS` and `ADMIN_EMAILS` reviewed with least privilege.
1. Backup/export recovery path validated before rollout.

## Incident Severity and SLA

### Sev-1 (Platform Unusable)

Definition:

- Users cannot authenticate, or core app unavailable for majority of users.

Targets:

- Acknowledge: 15 minutes.
- Mitigation start: 30 minutes.
- Service restoration target: 4 hours.

### Sev-2 (Major Feature Degraded)

Definition:

- Core workflow partially degraded (for example, quiz runtime or backup import failures) with workaround unavailable.

Targets:

- Acknowledge: 30 minutes.
- Mitigation start: 2 hours.
- Restoration target: 1 business day.

### Sev-3 (Minor/Non-Blocking)

Definition:

- Limited functional impact; workaround exists.

Targets:

- Acknowledge: 1 business day.
- Fix target: next planned release.

## Incident Response Workflow

1. Triage and severity assignment.
1. Freeze risky deployments for Sev-1 and Sev-2.
1. Capture logs, failing route/module, and repro steps.
1. Mitigate with rollback or config hotfix.
1. Validate via release gate commands.
1. Publish incident summary and corrective actions.

## Post-Incident Review Checklist

1. Root cause documented.
1. Detection gap identified.
1. Preventive action owner assigned.
1. Regression test added where applicable.
1. Runbook/wiki updated.
