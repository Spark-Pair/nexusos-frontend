# Development Plan

## Phase discipline

Complete one approved phase at a time. Each phase starts with traceable acceptance criteria and ends only when formatting, linting, strict type-checking, applicable unit/component/integration/contract/end-to-end tests, and the production build pass. Critical journeys require Playwright coverage, including applicable offline, reconnect, denied, privacy, stale-data, and failure paths.

## 1. Tooling and production foundation

- Scaffold React, Vite, and strict TypeScript.
- Configure Tailwind CSS, linting, formatting policy, Vitest, React Testing Library, and Playwright.
- Establish aliases, feature boundaries, environment validation, error boundary, logger contract, and test utilities.
- Configure PWA manifest/service worker and Dexie database bootstrap with migration tests.
- Establish account/workspace storage partitioning, provenance/acknowledgement types, logging redaction, and deterministic IndexedDB/service-worker test harnesses.
- Add CI-equivalent scripts and verify a Vercel-compatible production build.

Exit: a minimal accessible boot screen works online and after a warmed offline reload; all quality commands pass.

## 2. Application shell and role switcher

- Add providers, routes, separate Customer/Business/Admin shells, responsive navigation, and not-found/forbidden states.
- Implement a visibly development-only authentication adapter, active-context selection, typed roles, and permission policy. Never describe it as verified or production-secure.
- Persist only safe active-context preferences.

Exit: permitted contexts route correctly and remain visually and structurally separated.

## 3. Customer onboarding

- Approve fields and validation first.
- Add resumable local drafts, completion state, repository/service boundaries, and accessible form steps.
- Test offline completion and recovery.

## 4. Customer discovery and following

- Add discovery/search contracts, cached results, business summary/detail, and local follow/unfollow intents. Only backend acknowledgement marks a relationship synchronized.
- Define location/category filters and empty/offline behavior.

## 5. Updates and product catalog

- Add update feed and business product browsing with detail views, pagination policy, cache freshness, and offline states.

## 6. Order request and customer orders

- Approve pricing and order semantics.
- Add UUID-backed local order drafts/requests, acknowledgement-aware status, lifecycle timeline, validation, cancellation rules, and conflicts. Backend-governed transitions remain pending until accepted.

## 7. Customer chats

- Add conversation list/detail and durable message drafts/queued delivery intents.
- Clearly label simulated delivery; define attachment policy before implementing attachments.
- Block/report controls remain unavailable backend capabilities or local drafts; never claim submission.

## 8. Business onboarding and dashboard

- Approve business fields and verification states.
- Add workspace creation draft, business profile, and repository-backed actionable dashboard summaries.

## 9. Shared inbox and customers

- Add permission-aware inbox queues, conversation assignment/status, customer directory/detail, notes, and safe offline edits.

## 10. Segments and campaigns

- Add typed segment rules, provisional preview counts, campaign drafts, validation, approval requirements, and scheduling representation.
- Model consent, suppression, opt-out, block, frequency-cap, and duplicate-recipient precedence; local counts are non-authoritative.
- Do not implement real campaign delivery.

## 11. Business products and orders

- Add catalog CRUD, publication lifecycle, inventory representation if approved, order queues/detail, and allowed status transitions.

## 12. Analytics and integrations

- Approve metric definitions.
- Add period/filter controls, trustworthy empty states, and integration capability/status abstractions.
- Do not collect real ERP credentials.

## 13. Team, billing and settings

- Add team invitations, role grants, membership states, preferences, business settings, plans, and billing presentation.
- Do not capture payments.
- Invitations, permission/subscription changes, exports, and deletion are backend-bound; local UI cannot claim completion.

## 14. Platform admin

- Approve admin powers and audit requirements first.
- Add dedicated admin routes, operational queues, account/business review tools, and audit presentation with strict permissions.

## 15. Offline synchronization hardening

- Integrate the Laravel sync contract or a contract-faithful test server.
- Harden queue ordering, dependencies, leases, backoff, idempotency, conflict UI, tombstones, migrations, observability, and recovery.
- Implement pull/checkpoint sync, atomic acknowledgements, scope-revocation cleanup, and safe full-resync recovery.
- Test interrupted push/pull, multi-tab behavior, clock skew, duplicate acknowledgement, out-of-order events, deletion, revoked access, quota, corruption, and every supported schema upgrade.

## 16. Accessibility, performance and release preparation

- Audit keyboard/screen-reader flows, contrast, motion preferences, touch targets, and target WCAG level.
- Set and enforce bundle/runtime budgets, test low-end mobile and poor networks, review caching/privacy/security, and rehearse rollback/update behavior.
- Approve the privacy notice, retention/deletion matrix, shared-device/logout policy, consent evidence, anti-spam rules, abuse workflow, and data-subject requests.
- Complete production monitoring, legal content, release checklist, and Vercel configuration.

## 17. Future Laravel API integration

- Finalize OpenAPI/API contracts, authentication/session strategy, server-authoritative permissions, pagination, versioning, and error format.
- Finalize push/pull sync, idempotency retention, tombstones, consent/suppression enforcement, rate/frequency limits, auditing, and authoritative statuses.
- Implement HTTP repositories and sync endpoints behind existing contracts.
- Add contract tests, staging end-to-end tests, data migration, progressive rollout, and removal of explicitly simulated adapters.
