# Quickstart (Instructor)

This one-page guide helps instructors run teaching workflows quickly.

## 0 to 2 Minutes: Sign In and Confirm Role

1. Open Auth.
2. Sign in with your instructor account.
3. Confirm role badge shows `instructor` (or `admin`).

If role is incorrect, verify allowlists in environment settings.

## 2 to 4 Minutes: Set Up Learning Content

1. Open Quiz Lab.
2. Create or import a question bank.
3. Validate question types and answer keys.
4. Optionally prepare lesson content in Lesson Studio.

## 4 to 6 Minutes: Validate Export and LMS Payloads

1. Export using desired adapter (QTI/GIFT/AIKEN/CSV/TSV).
2. Open connector section and run dry-run validation.
3. Review diagnostics before sharing or publishing.

## 6 to 8 Minutes: Review Instructional Signals

1. Open Instructor Mode.
2. Inspect item performance and mastery bands.
3. Identify low-performing objectives.
4. Update blueprint constraints and question mix.

## 8 to 10 Minutes: Share and Iterate

1. Use Share Exchange to distribute lesson/quiz bundles.
2. Import peer-created bundles and merge intentionally.
3. Run one sample attempt to sanity check learner path.

## Instructor Daily Loop

- Start day: review analytics and weak concept areas.
- During day: refine quiz banks and lesson alignment.
- End day: export or snapshot key content state.

## Instructor Access Notes

- Instructor-only sections are available for `instructor` and `admin`.
- Student users are intentionally blocked from these controls.

## Quick Commands

```bash
npm run dev
npx playwright test tests/e2e/access-control.spec.ts --project=mobile-iphone-13-mini
```
