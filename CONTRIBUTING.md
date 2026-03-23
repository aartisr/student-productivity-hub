# Contributing Guide

Thank you for your interest in contributing to Student Productivity Hub.

This project is student-centric, research-oriented, and quality-gated. Contributions should be clear, testable, and aligned with improved learner outcomes.

## Contribution Principles

- Prefer focused pull requests over broad, mixed changes.
- Explain the educational or user-impact rationale.
- Keep behavior reproducible with explicit setup and test steps.
- Preserve accessibility, responsiveness, and role-aware behavior.

## Ways to Contribute

- Improve student workflow UX and clarity.
- Improve import/export robustness and diagnostics.
- Improve tests, docs, and onboarding pathways.
- Report bugs with actionable reproduction details.
- Propose research-informed feature ideas.

## Development Setup

1. Fork and clone the repository.
2. Install dependencies.
3. Configure local environment.
4. Start the dev server.

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Branching and Commit Guidance

- Create a feature branch from `master`.
- Use concise and descriptive commit messages.
- Keep each commit logically coherent.

Recommended commit style:

- `docs: improve onboarding instructions`
- `fix: handle malformed QTI package reference`
- `feat: add quiz import validation warning`

## Pull Request Checklist

Before opening a PR, ensure:

- Scope is focused and description is clear.
- Relevant documentation is updated.
- Type checks and build checks pass.
- Relevant E2E tests were run for behavior changes.

Validation commands:

```bash
npm run typecheck
npm run verify
npm run test:e2e
```

For UI-only changes, run targeted responsive/auth suites when possible.

## PR Template Expectations

Include the following in your PR description:

- Problem statement
- Proposed solution
- Why this helps students/instructors
- Test evidence (commands run and results)
- Screenshots or notes for visible UI changes

## Reporting Issues

Please provide:

- Expected behavior
- Actual behavior
- Steps to reproduce
- Environment details (OS, browser, Node version)
- Logs or screenshots when available

## Security and Sensitive Data

- Never commit secrets or real student-sensitive data.
- Use `.env.local` for credentials.
- Treat exported snapshots as potentially sensitive.

## Academic and Research Contributions

If your change supports a research hypothesis:

- State assumptions and metrics clearly.
- Describe limitations and potential confounders.
- Prefer transparent, reproducible evaluation notes.

## Communication and Conduct

By participating, you agree to follow the project Code of Conduct in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

Questions and proposals are welcome through GitHub issues and pull requests.
