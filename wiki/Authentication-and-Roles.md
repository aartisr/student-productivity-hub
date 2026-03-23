# Authentication and Roles

This application uses Auth.js (NextAuth) with provider federation.

## Supported OAuth Providers

- Google
- Microsoft Entra ID (Azure AD)
- GitHub
- Apple
- Facebook
- LinkedIn
- X (Twitter)
- Discord
- Slack
- GitLab

## Callback URL Pattern

Use this callback pattern when configuring each provider:

`http://localhost:3000/api/auth/callback/<provider-id>`

Examples:

- Google: `google`
- Microsoft Entra ID: `azure-ad`
- X: `twitter`

## Google Provider Configuration

Use this checklist to enable Google sign-in:

1. In Google Cloud Console, configure OAuth consent screen and add your test user email.
1. Create an OAuth client of type **Web application**.
1. Add redirect URI:

- `http://localhost:3000/api/auth/callback/google`

1. Add JavaScript origin:

- `http://localhost:3000`

1. Set environment variables in `.env.local`:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=replace_with_long_random_value
```

The app enables providers dynamically, so Google appears only when both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are present.

## Session Model

- Session strategy: JWT.
- Browser session is managed through secure HTTP-only cookie paths.
- The app syncs authenticated identity into the internal user context for feature data scoping.

## Role Model

Three roles are recognized:

- `student`
- `instructor`
- `admin`

Default behavior:

- Any authenticated user not in allowlists is `student`.

Role assignment behavior:

- `ADMIN_EMAILS` allowlist maps to `admin`.
- `INSTRUCTOR_EMAILS` allowlist maps to `instructor`.

## Role-Gated Features

Instructor/Admin only:

- LMS Connector dry-run controls.
- Instructor Mode analytics controls.

Student behavior:

- Sees dedicated Access Denied panels for restricted sections.
- Can still use all student-safe modules.

## Protected Module Navigation

Unauthenticated access to protected modules redirects to Auth panel with a sign-in prompt.

Protected module set includes:

- Assignments
- Planner
- Quiz Lab
- Timer
- GPA
- Analytics
- Backup
- Coach

## Security Best Practices

- Use a strong, random `AUTH_SECRET` in every environment.
- Keep production callback URLs exact and consistent.
- Use least privilege role assignments via allowlists.
- Avoid granting instructor/admin roles to broad email domains.
