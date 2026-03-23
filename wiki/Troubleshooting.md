# Troubleshooting

## OAuth Button Not Visible

Possible causes:

- Provider env variables are missing.
- `.env.local` not loaded.
- Provider credentials invalid.

Actions:

1. Verify `NEXTAUTH_URL` and `AUTH_SECRET`.
2. Verify provider client ID/secret values.
3. Restart dev server.

## Redirect Loops or Auth Prompt Reappears

Possible causes:

- Session cookie unavailable.
- Secret mismatch across runs.

Actions:

1. Ensure stable `AUTH_SECRET`.
2. Clear browser cookies for localhost.
3. Re-authenticate.

## Role Is Not What You Expect

Possible causes:

- Email not present in allowlist env variables.
- Typo or case mismatch in email list.

Actions:

1. Confirm `ADMIN_EMAILS` / `INSTRUCTOR_EMAILS` in env.
2. Use lowercase exact email entries.
3. Sign out and sign in again.

## Restricted Panel Still Shows Controls

Possible causes:

- Old cached bundle.
- Session role changed mid-session.

Actions:

1. Hard refresh browser.
2. Sign out and sign in again.
3. Re-run verify/build.

## Test Fails After Security Changes

If a UI test assumed guest access to protected modules, update expectation to Auth redirect behavior.

Recommended command set:

```bash
npm run verify
npx playwright test tests/e2e/responsive.spec.ts --project=mobile-iphone-13-mini
```

## Build Warnings

If you see framework convention warnings, align to current framework guidance and re-run `npm run verify`.
