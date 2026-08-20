# Deploying to Vercel

> **Live workspace:** [Open Student Productivity Hub](https://sph.ai-aarti.com/).

Student Productivity Hub is a Next.js application and deploys directly to Vercel. The repository includes [vercel.json](../../../vercel.json) so Vercel installs dependencies with `npm ci` and builds with `npm run build`.

The Vercel install command explicitly uses `https://registry.npmjs.org`. The checked-in lockfile is cross-platform and does not contain private registry download URLs. The Vercel build command runs [scripts/vercel-build.mjs](../../../scripts/vercel-build.mjs), which replaces blank Auth.js URL variables with the canonical HTTPS URL before Next.js compiles the application.

## Before You Deploy

1. Push the desired branch to GitHub.
2. Import the repository in the Vercel dashboard.
3. Select the default Next.js framework preset.
4. Add the production environment variables below.
5. Add and verify the custom domain `sph.ai-aarti.com` in Vercel.
6. Update each OAuth provider with the production callback URL.
7. Remove any inherited `NPM_CONFIG_REGISTRY`, `NPM_TOKEN`, or `NODE_AUTH_TOKEN` values that point to a private package registry.
8. Deploy, then complete the smoke check.

## Required Production Environment Variables

| Variable | Required | Notes |
| --- | --- | --- |
| `AUTH_SECRET` | Yes | Generate a strong random value. Never commit it. |
| `NEXTAUTH_URL` | Yes | Set to `https://sph.ai-aarti.com`. |
| OAuth provider credentials | At least one provider | Configure only the providers you intend to offer. |
| `INSTRUCTOR_EMAILS` | Recommended | Comma-separated instructor allowlist. |
| `ADMIN_EMAILS` | Recommended | Comma-separated admin allowlist. |

Do not configure a private npm registry or registry token in Vercel for this public project. Vercel should use the public npm registry specified by [vercel.json](../../../vercel.json).

Do not leave `NEXTAUTH_URL`, `AUTH_URL`, `NEXTAUTH_URL_INTERNAL`, or `AUTH_URL_INTERNAL` as blank strings. A blank value can cause Auth.js to throw `Invalid URL` during static prerendering. The repository build command safely falls back to `https://sph.ai-aarti.com`, but production settings should still contain the canonical URL explicitly.

The application intentionally refuses to run at production runtime without `AUTH_SECRET`.

## OAuth Callback URLs

For each enabled provider, register this callback URL:

```text
https://sph.ai-aarti.com/api/auth/callback/<provider-id>
```

For example, Google uses:

```text
https://sph.ai-aarti.com/api/auth/callback/google
```

Use the Vercel preview URL only for a separate preview OAuth application or provider configuration. Do not silently reuse production credentials for untrusted preview deployments.

## Custom Domain

The canonical product URL is [https://sph.ai-aarti.com](https://sph.ai-aarti.com/).

In Vercel:

1. Open **Project Settings → Domains**.
2. Add `sph.ai-aarti.com`.
3. Add the DNS record Vercel provides at your DNS host.
4. Wait for Vercel to verify the domain and provision TLS.
5. Set `NEXTAUTH_URL` to the canonical HTTPS URL.
6. Confirm the OAuth callback URLs match the verified domain exactly.

GitHub Pages intentionally links to this canonical site. It is an informational companion, not the application host.

## Deployment Checks

Run locally before opening a deployment PR:

```bash
npm ci
npm run verify
npm run test:e2e
```

After a Vercel deployment:

1. Open `/` and confirm the compact app shell loads.
2. Sign in through one enabled OAuth provider.
3. Verify the browser returns to the requested protected route.
4. Add an assignment and confirm it survives a page refresh.
5. Create or import a quiz bank, then complete one attempt.
6. Generate and import a backup payload in a non-production account.
7. Check the browser console for Content Security Policy or OAuth callback errors.

## Preview Deployments

Vercel preview deployments are valuable for UI and workflow review. The application build is safe without production OAuth secrets, but a preview instance without a configured provider will show no sign-in providers. That is expected.

For authenticated preview testing, use a dedicated OAuth application with preview callback URLs or test through the repository's mocked browser tests. Never copy production secrets into an untrusted preview context.

## Troubleshooting

| Symptom | Likely cause | What to check |
| --- | --- | --- |
| Deployment build fails | Dependencies or type errors | Run `npm ci` and `npm run verify` locally. |
| Runtime error about `AUTH_SECRET` | Missing Vercel environment variable | Add `AUTH_SECRET` to Production in Vercel. |
| OAuth returns to the wrong domain | `NEXTAUTH_URL` mismatch | Set it to `https://sph.ai-aarti.com`. |
| OAuth callback rejected | Provider configuration mismatch | Verify the exact provider callback URL. |
| No sign-in provider shown | Provider variables are absent or incomplete | Check client ID, secret, and tenant values. |
| Session cannot access a protected page | Cookie or canonical host mismatch | Verify the custom domain, HTTPS, and `NEXTAUTH_URL`. |
| `npm ci` returns `E401` | Stale private npm registry or token in Vercel | Remove `NPM_CONFIG_REGISTRY`, `NPM_TOKEN`, and `NODE_AUTH_TOKEN` from Vercel project settings, then redeploy. |
| `npm ci` reports missing `@next/swc` or `sharp` packages | Old lockfile was deployed | Ensure the latest `package-lock.json` is pushed, then redeploy. |
| Build fails on `/_not-found` with `Invalid URL` | An Auth.js URL variable is blank | Set `NEXTAUTH_URL` to `https://sph.ai-aarti.com` and remove blank `AUTH_URL`/internal URL variables, then redeploy. |

For operational context beyond deployment, see the [Operator and Admin Runbook](Operator-and-Admin-Runbook.md) and [Authentication and Roles](Authentication-and-Roles.md).
