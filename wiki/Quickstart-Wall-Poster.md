# Quickstart Wall Poster

Large-format onboarding poster for classroom, lab, or team spaces.

## Choose Your Path

### Student

1. Sign in
2. Plan work
3. Start focus timer
4. Run a quiz attempt
5. Export backup

### Instructor

1. Sign in with allowlisted account
2. Build/import quiz bank
3. Validate connector dry-run
4. Review Instructor analytics
5. Share lesson bundle

### Operator

1. Verify env configuration
2. Verify role allowlists
3. Run quality gates
4. Confirm access control tests
5. Confirm responsive behavior

## Role Signals

- Student: restricted instructor sections show Access Denied.
- Instructor/Admin: instructor sections and connector tools available.

## Fast Recovery

- Missing provider button: check provider env credentials.
- Wrong role: check allowlist + re-login.
- Auth loop: clear localhost cookies and re-authenticate.

## Verification Commands

```bash
npm run verify
npx playwright test tests/e2e/access-control.spec.ts --project=mobile-iphone-13-mini
npx playwright test tests/e2e/responsive.spec.ts --project=mobile-iphone-13-mini
```

## Posting Notes

- Print in A3 or tabloid for readability.
- Keep near shared workstations.
- Pair with detailed docs in the wiki for deeper guidance.
