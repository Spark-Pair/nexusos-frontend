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

- Add all Public/Authentication placeholders from `ROUTE_MAP.md`, providers, and separate Customer/Business/Admin shells with responsive navigation and not-found/forbidden states.
- Implement a visibly development-only authentication adapter, active-context selection, typed roles, and permission policy. Never describe it as verified or production-secure.
- Persist only safe active-context preferences.
- Establish accessible URL-aware dialog/drawer foundations with Escape, focus trap/restore, duplicate-submit protection, and stronger destructive confirmation.

Exit: permitted contexts route correctly and remain visually and structurally separated.

## 3. Customer onboarding

- Implement the specified seven steps: Welcome, Pakistani phone validation, labelled development OTP, profile, at-least-three interests, location/cities, notification preferences.
- Add resumable drafts, local-versus-authoritative completion, repository/service boundaries, and accessible forms.
- Test offline completion and recovery.

## 4. Customer discovery and following

- Add all specified Discover sections, search scopes/filters, business profile/tabs, saved/recent content, location-permission and empty/offline states.
- Add follow preferences, optimistic count/state, confirmed unfollow, and phone-privacy tests. Only backend acknowledgement marks synchronization.

## 5. Updates and product catalog

- Add the separate Business Updates inbox with specified filters/actions/read/save/mute/hide/report behavior and filter-specific empty states.
- Add product gallery, price/availability/variants/delivery/COD/return/related content and saved products.

## 6. Order request and customer orders

- Approve pricing and order semantics.
- Add all four request steps, delivery/payment/review fields, variant/price validation, UUID local reference, queue, and honest acknowledgement states.
- Add order tabs/details/timeline/actions, reasoned cancellation, reorder/report, and conflicts. Server governs acceptance/final cancellation.

## 7. Customer chats

- Add specified list metadata/filters and conversation text, product/order attachments, image placeholders, quick replies, search/mute/archive/local-delete, and durable message drafts/intents.
- Clearly label simulated delivery; define attachment policy before implementing attachments.
- Block/report controls remain unavailable backend capabilities or local drafts; never claim submission.
- Complete Customer Profile saved content, follows, addresses, languages, privacy, blocked businesses, help, and safe confirmed logout.

## 8. Business onboarding and dashboard

- Implement all eleven setup steps, supplied fields/types, verification placeholders/statuses, secure-file boundary, and queued submission.
- Add every Overview metric/section/date filter/action with cached/stale/empty states.

## 9. Shared inbox and customers

- Add specified inbox filters/list/history/context/actions and customer table/detail/filter/bulk contracts.
- Enforce contact/privacy visibility and workspace isolation; shared assignments, exports, permissions, and realtime remain backend-bound.

## 10. Segments and campaigns

- Add default segments, full condition set, simulated AND/OR, and non-authoritative previews.
- Add campaign tabs/fields/actions, six-step creation, product/media ordering, exclusions, frequency/fair-use warnings, confirmations, and analytics.
- Model consent, suppression, opt-out, block, frequency-cap, and duplicate-recipient precedence; local counts are non-authoritative.
- Do not implement real campaign delivery.

## 11. Business products and orders

- Add Business Update types/lifecycles/actions, catalog table/grid/bulk actions, and specified product form/validation/media-quota behavior.
- Add all Business Order tabs/table/detail/actions, confirmations, timeline/tracking/assignment/print/export, and acknowledgement-gated shared transitions.

## 12. Analytics and integrations

- Add every analytics section/filter and loading/empty/error/cached/populated state; exact metric definitions remain unresolved.
- Add specified providers, statuses, capabilities, setup placeholders, logs, and secure-credential boundary.
- Do not collect real ERP credentials.

## 13. Team, billing and settings

- Add specified team roles/fields/invites/actions/permission areas, editable profile, four plan concepts, fair-use/usage/billing, and every Settings section.
- Do not capture payments.
- Invitations, permission/subscription changes, exports, and deletion are backend-bound; local UI cannot claim completion.

## 14. Platform admin

- Implement only the supplied Dashboard, Verification, Moderation, Users, Businesses, and Plans/Fair Use routes/actions.
- Require confirmation/reason/permission/backend acknowledgement/audit for verification, moderation, account, restriction, plan, and deletion actions.

## 15. Offline synchronization hardening

- Integrate the Laravel sync contract or a contract-faithful test server.
- Harden queue ordering, dependencies, leases, backoff, idempotency, conflict UI, tombstones, migrations, observability, and recovery.
- Implement pull/checkpoint sync, atomic acknowledgements, scope-revocation cleanup, and safe full-resync recovery.
- Test interrupted push/pull, multi-tab behavior, clock skew, duplicate acknowledgement, out-of-order events, deletion, revoked access, quota, corruption, and every supported schema upgrade.

## 16. Accessibility, performance and release preparation

- Audit keyboard/screen-reader flows, contrast, motion preferences, touch targets, and target WCAG level.
- Set and enforce bundle/runtime budgets, test low-end mobile and poor networks, review caching/privacy/security, and rehearse rollback/update behavior.
- Approve the privacy notice, retention/deletion matrix, shared-device/logout policy, consent evidence, anti-spam rules, abuse workflow, and data-subject requests.
- Verify every reusable-dialog behavior and component state, English/Urdu/Roman Urdu behavior, touch targets, and all three required end-state journeys.
- Complete production monitoring, legal content, release checklist, and Vercel configuration.

## 17. Future Laravel API integration

- Finalize OpenAPI/API contracts, authentication/session strategy, server-authoritative permissions, pagination, versioning, and error format.
- Finalize push/pull sync, idempotency retention, tombstones, consent/suppression enforcement, rate/frequency limits, auditing, and authoritative statuses.
- Implement HTTP repositories and sync endpoints behind existing contracts.
- Add contract tests, staging end-to-end tests, data migration, progressive rollout, and removal of explicitly simulated adapters.
