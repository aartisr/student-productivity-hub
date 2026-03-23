# Student Productivity Hub

A standalone, mobile-first study operating system inspired by your AppLab `code.js`.

## Owner

- Repository owner: Arti Sri Ravikumar (@aartisr)
- Canonical repository: https://github.com/aartisr/student-productivity-hub

## Documentation and Wiki

Detailed usage documentation is available in the in-repo wiki:

- `wiki/Home.md`
- `wiki/Getting-Started.md`
- `wiki/Quickstart-Cheat-Sheet.md`
- `wiki/Quickstart-Wall-Poster.md`
- `wiki/Quickstart-Student.md`
- `wiki/Quickstart-Instructor.md`
- `wiki/Authentication-and-Roles.md`
- `wiki/Core-Workflows.md`
- `wiki/Quiz-Lab-Guide.md`
- `wiki/Data-Backup-and-Import.md`
- `wiki/Operator-and-Admin-Runbook.md`
- `wiki/Release-Gates-and-SLA.md`
- `wiki/Troubleshooting.md`
- `wiki/FAQ.md`

## Architecture

- `app/page.tsx`: app shell and orchestration layer
- `app/domain.ts`: shared domain types, constants, profiles, and pure utility helpers
- `app/persistence.ts`: localStorage persistence boundary for loading/saving app state
- `app/quizEngine.ts`: generic quiz model, import/export adapters, scoring and compatibility mapping
- `app/lmsConnectors.ts`: connector presets and dry-run request validation

This separation keeps feature logic plug-and-play while reducing coupling to the UI container.

## Features

- OAuth-based authentication with Auth.js (NextAuth) and provider federation
- Multi-provider OAuth support (configure any or all): Google, Microsoft Entra ID, GitHub, Apple, Facebook, LinkedIn, X, Discord, Slack, GitLab
- Assignment and planner task management
- Pomodoro timer with study and break session logs
- GPA calculator with weighted credits
- Motivation quotes
- Analytics cards for sessions and productivity
- Export/import JSON snapshots
- Local backups with restore
- Pluggable module workspace per user:
  - Enable/disable any module page
  - Reorder nav modules
  - Set default landing module
  - Apply one-click module profiles (Exam Prep, Daily Planner, Minimal Focus)
  - Save, apply, and delete custom named module profiles
  - Export and import custom module profile packs (JSON) with replace/merge and duplicate handling
  - Import dry-run preview showing add/rename/overwrite/skip actions before apply
  - Persist module layout and preferences per account
- Extensible Quiz Lab with:
  - Lesson Studio for creating custom lessons, tagging, and linking quiz banks
  - Share Exchange for lesson/quiz/bundle JSON sharing and importing between users
  - Normalized question-bank model (single, multi, true/false, short-answer)
  - Adapter imports for Generic JSON, Moodle GIFT, AIKEN, CSV MCQ, TSV flashcards, and QTI 2.1 XML
  - Adapter exports for Generic JSON, Moodle GIFT, AIKEN, CSV MCQ, TSV flashcards, and QTI 2.1 XML
  - QTI 2.1 package bundle support with manifest + item file structure for LMS-style packaging
  - QTI package integrity checks (manifest/file reference validation and parseability guardrails)
  - Compatibility targeting for common education platforms (Moodle, Canvas, Blackboard, Kahoot, Quizizz, Quizlet, Anki, Google Forms, Microsoft Forms, Schoology)
  - Built-in quiz runtime with scoring history and mastery metrics
  - Adaptive difficulty progression and spaced repetition review scheduler
  - Instructor mode with blueprint constraints, item analysis, and mastery bands
  - LMS connector stubs with format presets, mock auth toggles, dry-run payload validation, and request-log diagnostics

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## OAuth Setup

This project uses Auth.js with secure HTTP-only session cookies and JWT session strategy.

1. Add provider credentials in `.env.local` (see `.env.example`).

1. For each provider, add callback URL:

- `http://localhost:3000/api/auth/callback/<provider-id>`

1. Generate a strong `AUTH_SECRET`.

Production note:

- The app fails fast in production when `AUTH_SECRET` is missing.

### Google OAuth Quick Setup

1. Open Google Cloud Console and create or select a project.
1. Go to **APIs & Services -> OAuth consent screen**.
1. Configure the consent screen (external or internal), then add your test user email while in testing mode.
1. Go to **APIs & Services -> Credentials -> Create Credentials -> OAuth client ID**.
1. Choose **Web application** and set:

- Authorized JavaScript origins:
  - `http://localhost:3000`
- Authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google`

1. Copy client ID and client secret into `.env.local`:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
AUTH_SECRET=replace_with_long_random_value
NEXTAUTH_URL=http://localhost:3000
```

1. Restart the app:

```bash
npm run dev:restart
```

When these variables are set, the Google button appears automatically in the auth panel.

## Authorization Policy

- Default role: `student`
- Elevated roles by email allowlist:
  - `INSTRUCTOR_EMAILS` -> `instructor`
  - `ADMIN_EMAILS` -> `admin`
- Role-gated features:
  - LMS Connector dry-run controls require `instructor` or `admin`
  - Instructor Mode controls require `instructor` or `admin`

Examples of callback IDs:

- Google: `google`
- Microsoft Entra ID: `azure-ad`
- GitHub: `github`
- Apple: `apple`
- Facebook: `facebook`
- LinkedIn: `linkedin`
- X: `twitter`
- Discord: `discord`
- Slack: `slack`
- GitLab: `gitlab`

## Responsive E2E Checks

The project includes Playwright tests that validate responsive behavior across:

- `375x812` (iPhone 13 mini)
- `412x915` (Pixel 7)
- `768x1024` (iPad)
- `1366x768` (Laptop)
- `1920x1080` (Desktop)

Run:

```bash
npx playwright install chromium
npm run test:e2e
```

Run the CI-equivalent mobile smoke suite:

```bash
npx playwright test tests/e2e/auth-ux.spec.ts tests/e2e/access-control.spec.ts tests/e2e/responsive.spec.ts tests/e2e/responsive-visual.spec.ts --project=mobile-iphone-13-mini
```

Generate or refresh visual baselines:

```bash
npx playwright test tests/e2e/responsive-visual.spec.ts --update-snapshots
```

For production-readiness checks:

```bash
npm run typecheck
npm run verify
```

Open the latest report:

```bash
npx playwright show-report
```

## Production Readiness Checklist

- Configure `AUTH_SECRET` and `NEXTAUTH_URL` per environment.
- Configure at least one OAuth provider and verify callback URLs.
- Set `INSTRUCTOR_EMAILS` and `ADMIN_EMAILS` with least privilege.
- Run `npm run verify` before release.
- Run auth UX, responsive, responsive visual, and access-control E2E smoke checks.
- Keep backup/export routines part of operations for rollback safety.

Security defaults enabled in `next.config.js`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` denying camera/microphone/geolocation by default
