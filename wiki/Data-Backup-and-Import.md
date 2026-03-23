# Data Backup and Import

This page explains export/import and local backup restore behavior.

## Data Boundaries

User data is scoped per authenticated email identity in local app state.

Main scoped domains:

- Assignments
- Planner
- Sessions
- Lessons
- GPA history
- Quiz banks
- Quiz attempts
- Quiz reviews

## Export Snapshot

1. Open Backup panel.
2. Click Generate export JSON.
3. Copy payload and store securely.

## Import Snapshot

1. Open Backup panel.
2. Paste snapshot JSON in import area.
3. Click Import JSON.
4. Confirm status message.

## Local Backup Restore

1. Click Create backup.
2. Backups appear in list with timestamp.
3. Click Restore on desired snapshot.

## Safety Recommendations

- Export before major edits.
- Keep multiple dated snapshots.
- Validate imported JSON shape before applying in production-like workflows.

## Common Recovery Pattern

1. Export current state.
2. Import candidate payload.
3. If result is incorrect, restore previous backup.
