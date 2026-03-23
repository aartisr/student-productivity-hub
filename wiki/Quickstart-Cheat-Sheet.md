# Quickstart Cheat Sheet (Printable)

Use this single-page guide to pick your role flow and start fast.

## Role Selection

- If you are learning/studying: follow Student flow.
- If you are teaching/content-authoring: follow Instructor flow.
- If you manage access and operations: follow Operator checks.

## Student Flow (10 Minutes)

1. Sign in from Auth using any available provider.
2. Add assignments and planner tasks.
3. Run one Timer focus cycle.
4. Enter GPA sample values.
5. Open Quiz Lab, create small bank, run one attempt.
6. Export backup snapshot.

Student notes:

- Access Denied in instructor sections is expected.
- Daily rhythm: plan -> focus -> review.

## Instructor Flow (10 Minutes)

1. Sign in with instructor/admin allowlisted account.
2. Create/import quiz bank in Quiz Lab.
3. Validate adapter export.
4. Run LMS connector dry-run diagnostics.
5. Review Instructor Mode item and mastery analytics.
6. Share lesson/quiz bundle.

Instructor notes:

- If instructor sections are blocked, check role mapping and re-authenticate.

## Operator Checks (5 Minutes)

1. Confirm env vars: `NEXTAUTH_URL`, `AUTH_SECRET`.
1. Confirm role allowlists: `INSTRUCTOR_EMAILS`, `ADMIN_EMAILS`.
1. Validate quality gates:

```bash
npm run verify
npx playwright test tests/e2e/access-control.spec.ts --project=mobile-iphone-13-mini
```

1. Validate responsive gate:

```bash
npx playwright test tests/e2e/responsive.spec.ts --project=mobile-iphone-13-mini
```

## Fast Troubleshooting

- No provider button: missing provider env credentials.
- Role mismatch: incorrect allowlist entry or no re-login.
- Auth loops: cookie/secret mismatch; clear cookies and retry.

## Print Tips

- Print in portrait mode.
- Keep this page next to your first-week onboarding checklist.
