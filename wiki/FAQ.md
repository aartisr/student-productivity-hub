# FAQ

## Do I need all OAuth providers configured?

No. Configure one or many. Only configured providers appear in the Auth panel.

## Can students use Quiz Lab?

Yes. Students can use authoring and runtime features that are not instructor-admin restricted.

## Why do I see Access Denied in some quiz sections?

Those sections are intentionally restricted to instructor/admin roles.

## Where is my data stored?

Application state is persisted in browser local storage for this app instance.

## Can I move data between users or machines?

Yes. Use export/import payloads and share packs where applicable.

## How do I become instructor/admin?

Your email must be listed in `INSTRUCTOR_EMAILS` or `ADMIN_EMAILS` in environment configuration.

## How do I test responsive behavior quickly?

Use:

```bash
npx playwright test tests/e2e/responsive.spec.ts --project=mobile-iphone-13-mini
```

## Is this app suitable for production identity patterns?

It follows standard OAuth/OIDC federation through Auth.js and supports role-based policies, but you should still add operational controls (secrets management, telemetry, and deployment hardening) for production environments.
