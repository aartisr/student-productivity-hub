# Operator and Admin Runbook

Use this runbook for environment setup, role governance, validation, and incident response.

## Scope

This runbook is for users operating the app environment and managing privileged access.

## Environment Configuration

Core variables:

- `NEXTAUTH_URL`
- `AUTH_SECRET`

Role allowlists:

- `INSTRUCTOR_EMAILS` (comma-separated)
- `ADMIN_EMAILS` (comma-separated)

Provider credentials are optional and additive. Any configured provider appears in Auth UI.

## Startup and Health Checks

1. Install dependencies.

```bash
npm install
```

1. Start local app.

```bash
npm run dev
```

1. Verify baseline quality gates.

```bash
npm run typecheck
npm run verify
```

1. Verify RBAC behavior.

```bash
npx playwright test tests/e2e/access-control.spec.ts --project=mobile-iphone-13-mini
```

1. Verify responsive protections.

```bash
npx playwright test tests/e2e/responsive.spec.ts --project=mobile-iphone-13-mini
```

## Role Governance Procedure

When granting privileges:

1. Add exact email to `INSTRUCTOR_EMAILS` or `ADMIN_EMAILS`.
2. Ask user to sign out and sign in again.
3. Confirm role badge and gated section access.
4. Record change in your operations log.

When revoking privileges:

1. Remove email from allowlist.
2. Restart app environment if needed.
3. Ask user to re-authenticate.
4. Confirm restricted panels now show Access Denied.

## Provider Operations Checklist

For each OAuth provider:

1. Verify client ID/secret values.
2. Verify callback URL exact match.
3. Confirm provider button appears in Auth panel.
4. Test full login flow with least-privilege account.

## Backup and Recovery Procedure

1. Export JSON snapshot before high-risk operations.
2. Keep dated backups for rollback points.
3. If data regression occurs:
   - import last known good snapshot
   - restore from local backup
   - validate key domains (assignments, planner, sessions, quiz data)

## Incident Playbook

### Incident: Users cannot log in

- Check `AUTH_SECRET` and `NEXTAUTH_URL`.
- Confirm provider callback URLs.
- Check provider credentials.
- Clear local cookies and retry.

### Incident: Wrong role assignment

- Validate allowlist env entries.
- Confirm email case and spelling.
- Re-authenticate user.

### Incident: Unauthorized feature visibility

- Confirm current session role claim.
- Hard refresh app and re-authenticate.
- Re-run access control Playwright spec.

## Change Management

Before merging auth/RBAC changes:

1. Run `npm run verify`.
2. Run access-control and responsive E2E specs.
3. Confirm docs updated in wiki and README.
4. Capture release notes for role or route behavior changes.

## Operational Best Practices

- Keep `AUTH_SECRET` unique per environment.
- Apply least privilege for instructor/admin grants.
- Use explicit allowlists, not broad domain assumptions.
- Test with separate student and instructor accounts before release.
