# Student Productivity Hub

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-85%20browser%20checks-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> A quiet, capable study workspace for turning intention into progress.

**Canonical website:** [https://sph.ai-aarti.com](https://sph.ai-aarti.com/)

I started this project with a simple frustration: students are often asked to do deeply demanding work with a scattered collection of tools that do not talk to one another. A deadline lives in one place, focus lives in another, revision lives somewhere else, and the feeling of progress is left to memory.

Student Productivity Hub is an attempt to make that experience more humane. It brings planning, focused study, quiz practice, reflection, data portability, and role-aware support into one mobile-first workspace. It is not a claim to have solved learning. It is an invitation to keep improving the small conditions that make sustained learning more possible.

## Start Here

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`, sign in with an OAuth provider, then add one deadline, capture one next step, and begin a focus session. The app is designed to get out of the way after that.

For a complete guided start, read [Getting Started](docs/guides/wiki/Getting-Started.md).

## What It Helps With

| When you need to... | Use... |
| --- | --- |
| Protect a deadline | Assignments and Planner |
| Make a small, realistic study plan | Study Coach and Pomodoro |
| Practice with purpose | Quiz Lab and adaptive review |
| See what is changing | Progress and Analytics |
| Move or recover your work | Export, Import, and Backups |
| Teach or support a group | Instructor tools and compatibility workflows |

The interface deliberately uses task-focused workspaces, clear empty states, portable data, and responsive behavior so the next useful action is always easier to find than the next distraction.

## Built With Care

- **Next.js + TypeScript** for a maintainable application foundation.
- **Auth.js** for OAuth-based identity and role-aware access.
- **Playwright** for browser validation across phone, tablet, laptop, and desktop layouts.
- **Portable quiz formats** including JSON, GIFT, AIKEN, CSV, TSV, and QTI-oriented workflows.
- **Local-first persistence and backups** so users can inspect, export, and recover their work.

The project currently validates **85 browser checks** across five viewport profiles, alongside strict type and production-build verification.

```bash
npm run verify
npm run test:e2e
```

## IndexNow

The IndexNow verification key is published at [https://sph.ai-aarti.com/3450b713-fc17-4791-b160-f2c11b46f896.txt](https://sph.ai-aarti.com/3450b713-fc17-4791-b160-f2c11b46f896.txt). After the next production deployment, review the URLs without making a request:

```bash
npm run indexnow:submit
```

Submit the canonical sitemap URLs to IndexNow only when they have materially changed:

```bash
npm run indexnow:submit -- --submit
```

## Documentation

Everything beyond this orientation lives in one place: **[docs/README.md](docs/README.md)**.

- New here? Begin with [Getting Started](docs/guides/wiki/Getting-Started.md).
- Using the product? Explore [Core Workflows](docs/guides/wiki/Core-Workflows.md) and the [Quiz Lab Guide](docs/guides/wiki/Quiz-Lab-Guide.md).
- Contributing? Read the [Contributing Guide](docs/community/contributing.md).
- Operating a deployment? Use the [Operator and Admin Runbook](docs/guides/wiki/Operator-and-Admin-Runbook.md).
- Deploying to production? Follow the [Vercel Deployment Guide](docs/guides/wiki/Vercel-Deployment.md).
- Studying or extending the design? Visit [Research Notes](docs/research/RESEARCH_NOTES.md).

## An Open Invitation

The most valuable contribution may be a bug report, a sharper empty state, a better accessibility observation, a classroom workflow we have not considered, or a small test that prevents a future student from losing time.

Please use the repository, question its assumptions, and help make it more useful. Good learning tools should earn trust through clarity, restraint, and a willingness to improve in public.

- Share ideas and issues in the repository.
- Open focused pull requests with the student or educator outcome in mind.
- Improve the docs when you improve a workflow.
- Help test with real devices, real constraints, and respectful skepticism.

Community participation is governed by the [Code of Conduct](docs/community/code-of-conduct.md).

## License

This project is available under the [MIT License](LICENSE).
