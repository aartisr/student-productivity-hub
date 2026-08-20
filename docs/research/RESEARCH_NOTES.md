# UX Research Notes (Mobile-First)

This project applies mobile-first principles derived from public design guidance.

## Sources Consulted

- web.dev: Responsive web design basics
  - [Responsive web design basics](https://web.dev/articles/responsive-web-design-basics)
- Apple Human Interface Guidelines: Layout
  - [Apple HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- Material 3: Gestures
  - [Material 3 Gestures](https://m3.material.io/foundations/interaction/gestures)
- Dunlosky et al. (2013): Improving Students' Learning With Effective Learning Techniques
  - [Dunlosky et al. 2013](https://journals.sagepub.com/doi/10.1177/1529100612453266)
- Cepeda et al. (2006): Distributed practice in verbal recall tasks
  - [Cepeda et al. 2006](https://pubmed.ncbi.nlm.nih.gov/16507066/)
- Rohrer (2012): Interleaving helps students distinguish among similar concepts
  - [Rohrer 2012](https://www.apa.org/pubs/journals/releases/xlm-a0028602.pdf)
- Locke & Latham goal-setting theory summary
  - [Locke & Latham summary](https://psycnet.apa.org/record/2002-17386-005)

## Principles Applied In Laureate Forge

- Start with compact screens first and scale up with content-based breakpoints.
- Prevent horizontal scroll and keep controls thumb-friendly with generous spacing.
- Group related controls and metrics into visually distinct cards for scanability.
- Use progressive disclosure through section tabs to reduce cognitive overload.
- Keep critical signals visible at the top: active assignments, tasks, study time, current user.
- Maintain adaptive layout behavior using CSS grid transitions at desktop widths.
- Preserve all core content across screen sizes instead of hiding functionality.
- Prefer clear hierarchy with expressive typography and strong contrast.
- Include motion sparingly: card reveal animation and stateful, responsive controls.

## Mapping to Your AppLab Code.js

- Auth: login/signup/password reset flow retained (demo local mode).
- Assignments: add, prioritize, complete, delete.
- Planner: add, toggle done, delete.
- Pomodoro: study/break cycles, mode switch, session logging.
- GPA: weighted grade parsing and history snapshots.
- Motivation: random quote module.
- Analytics: totals, average, max/min session views.
- Export/Import/Backup: JSON snapshot generation, import, local backup restore.

## Evidence-Backed Productivity Extensions Added

- Home Command Center:
  - Prioritizes the single highest-leverage next action to reduce decision fatigue.
  - Uses urgency + load indicators (overdue, due soon, pending tasks) to surface workload risk.
- Study Coach:
  - Adapts recommended focus cycles to current energy and available time.
  - Generates plan structure around retrieval practice, interleaving, and spaced effort.
  - Pushes directly into timer-ready execution so planning transitions into action quickly.
- UX simplification:
  - Home now acts as a strategic dashboard, while each module has a focused dedicated tab.
  - Reduces cognitive overload from seeing all modules at once.

## Authentication UX References Applied

The current OAuth sign-in flow implements patterns consistently recommended across major UX research sources:

- Nielsen Norman Group (NN/g):
  - Keep sign-in entry clear, reduce ambiguity, and use explicit status feedback during auth handoff.
- Baymard Institute checkout/login findings:
  - Reduce cognitive load by prioritizing primary options and removing unnecessary choice friction.
- Google Material Design (Sign in and account selection patterns):
  - Make progress and system state visible, especially during redirects and cross-domain transitions.
- GOV.UK and enterprise service design guidance:
  - Provide clear return-context so users know what action will resume after authentication.

Implementation mapping in this app:

- Return-to context is shown when auth is required (users see where they will continue after sign-in).
- OAuth provider buttons are prioritized for common providers to improve choice speed.
- In-progress state is explicit (button state changes to connecting and all providers are temporarily disabled).
- Session/account/role state is visible in one compact scan block to reduce uncertainty.
