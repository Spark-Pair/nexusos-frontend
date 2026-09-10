# NexusOS interface audit and implementation plan

Audited September 8, 2026. Changes are restricted to frontend and backend.
This describes the current runtime, not the historical offline/Laravel proposal.

## Architecture

| Area              | Current implementation                                                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework         | React 19, Vite 7, strict TypeScript, lazy-loaded feature pages                                                                                                         |
| Styling           | Tailwind 4, shared CSS tokens/classes, Lucide, some Framer Motion                                                                                                      |
| Routes            | React Router 7, signed-out/protected/customer/business/admin guards                                                                                                    |
| State             | React state/context; useMessaging owns API state, Socket.IO subscriptions and 30-second polling                                                                        |
| Authentication    | Email/password, configured Google, phone challenge/verification; sessionStorage bearer token restored through /auth/me                                                 |
| API               | Feature API modules with Zod validation; Express/TypeScript, PostgreSQL and memory repository tests                                                                    |
| Pages             | Sign in, signup, phone, verification, chats/detail, profile/settings, business broadcasts/lists/drafts, customer updates, admin users/reports, catalogue               |
| Shared components | Buttons, icons, fields, search, combobox, choices, badges, avatar, table, tabs, pagination, dialog/drawer, media, scheduling preview, chat list/composer, state panels |
| Verification      | Vitest/Testing Library, backend tests, Playwright catalogue/responsive/unauthenticated-route tests                                                                     |

There are extensive pre-existing working-tree modifications and deletions. Preserve them.
Historical docs mention Dexie, Zustand, TanStack Query and Laravel; those are not the current
runtime. ApplicationFrame is a catalogue preview, not a routed shell. The push service worker
is not an offline synchronization implementation.

## UI findings

Large radii, bordered conversation cards, floating headers, saturated blue treatments, repeated
bold typography and spring/scale effects conflict with the new brief. Navigation is independently
assembled on each page. Chats have a width-limited two-pane layout without a business sidebar.
Mobile navigation also appears on desktop. Root semantic colors previously remained light in dark mode.

Keep the working accessible primitives: labelled controls, dialog focus trapping/restoration,
keyboard tabs, searchable combobox and loading/disabled buttons. Loading and failure states are
uneven across pages. Message composition clears before persistence is awaited. Some async actions
have no visible failure state. Broadcast composition combines lists, editing and history and needs
searchable selection, preview, duplicate-submit protection and confirmed destructive actions.

## Product gaps

| Requested behavior              | Current behavior / follow-up                                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Admin-provisioned businesses    | Public signup exposes business choice; admin provisioning requires a server-authorized operation.                                |
| Required phone without OTP      | Registration permits missing phone; existing phone routes use verification. Coordinate schema, profile, registration and guards. |
| Add by phone                    | Directory/invitation and accepted-conversation rules exist; define a privacy-safe phone lookup/add contract.                     |
| Image DMs                       | Direct-message schema is text-only; broadcast image upload exists.                                                               |
| Broadcasts in DMs               | Broadcasts are persisted separately and displayed in Updates. Requires server-side delivery changes.                             |
| Scheduled/image-only broadcasts | Publish currently requires title/body; no scheduled delivery worker/contract. SchedulePicker is a preview only.                  |
| Admin overview/plans            | User/report operations and basic API health exist; no integrated subscription/metric screens. Never invent metrics.              |

## Implementation plan

The user's September redesign brief supplies this phase order, superseding historical visual
instructions and offline-first phase numbering for this work.

1. Audit and foundation (this increment): neutral colors, one muted teal accent, 8px controls,
   12px surfaces, spacing, restrained motion, shared styling and accurate catalogue.
2. Shared routed app shell: role-specific sidebar, compact headers, full-width desktop, mobile navigation.
3. Messaging: three-column workspace, list rows, readable messages, reliable async composer,
   loading/error/empty/offline states, image API support.
4. Users: searchable business user screen and scoped phone lookup/confirmation API with privacy tests.
5. Broadcast lists: separate list/detail views, searchable selection, counts, rename and confirmed deletion.
6. Broadcast composition: recipient count, media preview, history, scheduling persistence/worker,
   delivery into DMs, suppression and idempotency checks.
7. Auth/admin/profile: simple normal signup, business provisioning, unified tables and settings.
8. Full UX audit: responsive widths, keyboard, contrast, themes, scrolling, states and critical journeys.

## Foundation acceptance

Preserve component contracts, requests, authentication and permissions. Update shared tokens and
styles without claiming later workflows are implemented. Run lint, strict types, component tests,
production build and applicable Playwright checks. Record pre-existing failures separately.

## Verification of the foundation increment

- npm run lint: ESLint and Prettier passed.
- npm run typecheck: strict TypeScript passed.
- npm run test:run: 25 files, 40 tests passed.
- npm run test:e2e: four Chromium tests passed, including responsive widths of 360, 768 and
  1440px, theme switching, unauthenticated route protection and reduced-motion keyboard controls.
- npm run build: production build passed. Zod emits non-blocking Rollup comment-annotation warnings.
- Visually inspected catalogue screenshots for desktop light/dark and mobile. Corrected dark-mode
  example backgrounds and heading contrast found during review.

Changes cover shared styles/components, the catalogue, its browser tests and these documents.
No backend code was changed in this foundation phase. No live authenticated business/customer/admin
journey or backend migration was exercised; those remain part of their implementation phases.
