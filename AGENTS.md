# NexusOS Agent Instructions

These instructions apply to the entire repository.

## Before changing code

- Read `README.md` and every document relevant to the requested work under `docs/`.
- Inspect the existing implementation, tests, configuration, and current working-tree changes before editing.
- Preserve working code and unrelated user changes. Never discard or overwrite them for convenience.
- Work on one approved phase from `docs/DEVELOPMENT_PLAN.md` at a time. Do not silently change the approved architecture or expand scope.

## Engineering standards

- Keep TypeScript strict. Avoid `any`; use it only when genuinely unavoidable, document why, and contain it at a boundary.
- Organize code by feature and use reusable, accessible components.
- Keep business rules, persistence, networking, and simulated infrastructure outside UI components.
- UI components must never access IndexedDB or HTTP APIs directly. Use typed services and repository interfaces.
- Keep offline and future HTTP implementations interchangeable behind repository boundaries. Never replace those boundaries with direct mock data in pages.
- Use IndexedDB through Dexie for structured offline data. Use `localStorage` only for small, non-sensitive preferences.
- Give every offline mutation a client-generated UUID and persist it in the sync queue.
- Treat frontend permissions as a UX aid only; the future backend is authoritative.
- Do not implement or imply real OTP, messaging delivery, payments, campaign delivery, or ERP credential exchange until an approved backend phase.
- Distinguish `local`, `queued`, `server_accepted`, and externally completed states. Never label a local-only action as sent, verified, paid, delivered, synchronized, or authoritative.
- Enforce privacy, consent, suppression, blocking, reporting, retention, and workspace-isolation rules at application and repository boundaries as well as in the UI.
- Add or update focused tests with every feature.
- Add dependencies only when they are necessary and approved by the current phase.
- Never commit secrets, personal data, production credentials, or real integration tokens. Use documented environment-variable placeholders.

## Verification and reporting

- After implementation, run linting, strict type-checking, automated tests, and the production build. Run Playwright for every changed critical user journey, including relevant offline, denied-permission, privacy, and failure paths.
- Never claim a feature works without verifying it. If a check cannot run, state exactly why.
- Report changed files, completed work, verification commands and results, and remaining limitations.

## Git safety

- Never perform destructive Git operations such as force pushes, hard resets, or discarding unrelated changes.
- Use conventional commit messages, for example `feat(customer): add onboarding profile step` or `docs: define sync conflict policy`.
