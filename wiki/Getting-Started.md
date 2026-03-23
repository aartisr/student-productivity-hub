# Getting Started

This page walks you through installation, environment setup, and your first successful run.

## Prerequisites

- Node.js 20.9 or newer.
- npm.
- A browser (Chrome, Edge, Safari, or Firefox).

## Installation

1. Install dependencies.

```bash
npm install
```

1. Create environment file.

```bash
cp .env.example .env.local
```

1. Start the app.

```bash
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000).

## Minimum Auth Configuration

To use OAuth login, configure at least one provider in `.env.local`.

Required baseline values:

- `AUTH_SECRET`
- `NEXTAUTH_URL=http://localhost:3000`

Then add one provider pair (for example Google):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## First Login Flow

1. Open the Auth tab.
2. Select an available OAuth provider.
3. Complete provider consent.
4. Return to app with authenticated session.
5. Verify top KPI row shows your email and role.

## First Session Checklist

- Confirm your default module opens correctly.
- Add one assignment.
- Add one planner task.
- Start and stop one Pomodoro session.
- Open Quiz Lab and review visible capabilities based on your role.

## Build and Verification Commands

```bash
npm run typecheck
npm run verify
npm run test:e2e
```

## Where to Go Next

- Continue to [Authentication and Roles](Authentication-and-Roles.md).
- Then follow [Core Workflows](Core-Workflows.md).
