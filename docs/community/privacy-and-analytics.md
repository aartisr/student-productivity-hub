# Privacy and Optional Analytics

Student Productivity Hub is designed to keep learning work understandable and portable. This page describes the repository's telemetry boundaries honestly.

## Default Behavior

The application does not load Microsoft Clarity or PostHog unless a deployment operator configures a project ID. Even when an operator configures one, the application asks each visitor before loading either script.

Choosing **No thanks** stores a local browser preference and no analytics script is loaded by this application.

## What The Built-In Adapters Do Not Send

This repository does not call either provider with:

- student emails or account IDs
- names or role assignments
- assignment titles or planner task text
- lesson content, quiz prompts, answers, or scores
- backup payloads or custom session data

The PostHog adapter also disables autocapture and session recording. It uses page-level product measurement only after consent.

## Deployment Operator Responsibilities

Analytics providers process data outside this repository. Before enabling either service, the deployment operator should:

1. Review the provider's current privacy and data-processing terms.
2. Publish an appropriate privacy notice for the deployment.
3. Obtain consent where required, especially for classroom or minor users.
4. Configure retention, masking, and regional hosting settings in the provider dashboard.
5. Avoid adding custom telemetry that includes student work or identifiers without a documented review.

## Change A Choice

The analytics choice is stored only in the browser under the key `student-productivity-hub-analytics-consent`. Clearing site storage resets the prompt. A future product privacy-settings screen can expose this preference directly.

## Questions and Improvements

Privacy feedback is welcome. Open an issue or contribute a focused improvement through the [Contributing Guide](contributing.md).
