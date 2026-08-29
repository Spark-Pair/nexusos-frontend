# NexusOS Product Specification

## Document status

This specification records all requirements present in the initial brief. The brief referenced additional product requirements but did not include them. Items labelled **Provisional** are planning assumptions inferred from the named development phases and must not be treated as approved behavior.

## Product identity

- Product: NexusOS
- Company: SparkPair
- Tagline: Everything around your business, connected.
- Category: Business Connection Operating System
- Initial market: Karachi, Pakistan
- Long-term market: Pakistan and international
- Product quality: production foundation, not a disposable prototype

## Product vision

NexusOS connects customers, businesses, and platform operators in one reliable system. It should make a business easier to discover, follow, contact, buy from, and operate while remaining useful on unreliable or absent connectivity after the initial application load.

## Principles and non-functional requirements

- Mobile-first responsive PWA with a minimal, clean, aesthetic, professional, and practical interface.
- Core locally available workflows remain usable offline after initial load.
- Structured offline data is stored in IndexedDB; `localStorage` is limited to small preferences.
- Offline changes are durable, retryable, idempotent, and visibly synchronized.
- Customer, Business, and Platform Admin experiences have separate shells, navigation, and authorization boundaries.
- Accessibility, performance, resilience, privacy, localization readiness, and observability are release criteria.
- Frontend permission checks improve UX; a future backend enforces security.
- Privacy by default: collect only approved data, scope it to the active account/workspace, redact sensitive logs, and define retention, export, correction, and deletion before production.
- Consent and anti-spam controls are mandatory. Outbound marketing requires recorded channel-specific consent and backend-enforced suppression.
- Local success and authoritative success are distinct. Until backend acknowledgement, an operation is only a local draft or queued intent.

## Actors

### Customer

A person who creates a profile, discovers businesses, follows them, consumes their updates and catalogs, submits order requests, tracks orders, and communicates with businesses.

### Business member

A user belonging to a business workspace. Roles and permissions determine access to the dashboard, inbox, customers, campaigns, catalog, orders, analytics, integrations, team, billing, and settings.

### Platform administrator

A trusted platform operator with a dedicated experience for platform-level review and operations. Exact moderation, support, finance, and audit powers are unresolved.

## Functional scope

The following capabilities are confirmed as planned domains; detailed acceptance criteria are provisional until the missing requirements are supplied.

### Customer experience

1. Onboarding: establish a customer identity and required profile information. **Provisional:** use a resumable multi-step flow with locally persisted drafts.
2. Discovery and following: browse or search businesses and maintain followed-business relationships.
3. Updates and product catalog: view business updates and available product information.
4. Order requests and orders: create a request with a client UUID, review its local/sync status, and view lifecycle changes.
5. Chats: view locally available conversations and compose local drafts or queued delivery intents. A message is not sent or delivered until acknowledged by a backend/provider.
6. Safety and privacy: manage approved communication preferences and block or report unwanted business contact. Enforcement and report submission require the backend.

### Business experience

1. Onboarding and dashboard: establish a business workspace and display actionable operational summaries.
2. Shared inbox and customers: present locally available conversations and manage permitted customer records. A business cannot access another business's data or unrestricted customer account data.
3. Segments and campaigns: define customer groups and draft campaigns. Previews exclude known opt-outs, suppressions, and blocks. Authoritative recipient resolution, compliance, scheduling, and delivery require the backend.
4. Products and orders: manage catalog records and process order requests through defined lifecycle states.
5. Analytics and integrations: present trustworthy available metrics and integration connection states. ERP credentials and live connections are out of scope.
6. Team, billing, and settings: manage invitations, roles, preferences, and plan/billing presentation. Real payments are out of scope.

### Platform administration

Provide a separate platform-operator shell, role checks, and auditable operational workflows. Exact features require product approval before Phase 14.

## Authentication and authorization

- Authentication is accessed through a typed abstraction so an offline/demo implementation can later be replaced by the Laravel API implementation.
- Real OTP is not implemented in the frontend-only phases.
- A user may have customer access, memberships in one or more businesses, and/or a platform role. **Provisional:** the active context is explicitly selected and never inferred from the current URL alone.
- Routes, navigation, and actions are permission-aware, but only the future server is authoritative.
- The frontend-only auth adapter is a labelled development simulation. It cannot verify identity, issue authoritative roles, recover accounts, or authorize cross-device data.

## Privacy, consent, and anti-spam

- Define a lawful basis and purpose for each personal-data field; optional fields remain optional in UI and storage.
- Separate customer account data from business-owned CRM notes. Businesses see only approved shared/interaction data in their own workspace.
- Record consent by customer, business, channel, purpose, source, policy version, and time. Consent is specific, revocable, and never inferred from a follow, order, or service conversation.
- Business and platform suppressions, opt-outs, blocks, and revoked consent override segment membership and scheduling.
- Every marketing channel needs a clear unsubscribe path. The backend must apply suppression before accepting delivery; frontend filtering is insufficient.
- Approve rate limits, quiet hours, frequency caps, duplicate prevention, sender identity, and applicable law before delivery.
- Customers can block a business and submit an abuse/spam report. Blocking must not destroy required transaction history.
- Customer access, exports, consent changes, campaign approvals, and admin actions require authoritative permissions and audit records.
- Define retention/deletion separately for accounts, CRM notes, conversations, orders, consent/suppression evidence, audit events, and device caches.
- Production use on shared devices is blocked until logout, account-removal, membership-loss, and device-handoff cache policies are approved.

## Offline behavior

- The installed application shell and previously cached resources should load offline after an initial successful load.
- Locally available reads remain accessible according to the cache policy.
- Supported writes are applied optimistically to IndexedDB and added to a persistent mutation queue.
- Users can see pending, syncing, failed, and conflict states and can retry recoverable failures.
- Network-only or external-provider functions explain why they are unavailable; they never pretend to have completed.
- Full policy is defined in `OFFLINE_SYNC.md`.
- Optimistic writes are not authoritative acceptance. Identity, permission, compliance, money, delivery, destructive account actions, and irreversible transitions may be draft-only offline.

## Explicit exclusions for frontend-only phases

- Real OTP verification
- Real SMS, WhatsApp, email, push, or chat delivery
- Payment capture, refunds, or billing-provider operations
- Campaign delivery
- ERP credential collection or live ERP synchronization
- A production backend or authoritative authorization enforcement
- Authoritative synchronization, global-search freshness, abuse-report submission, consent enforcement, or audit recording

## Release quality bar

Every phase must pass formatting, linting, strict type-checking, automated tests, and a production build. Critical flows require Playwright coverage for the main path and applicable offline, reconnect, unauthorized, forbidden, stale, conflict, and failure paths. Features define empty, loading, local/queued, offline, error, denied, conflict, and authoritative-success states.

Required coverage includes lifecycle transitions, repository contracts, schema validation, migrations, queue durability, idempotent replay, dependency ordering, retries, multi-tab exclusion, account/workspace isolation, cache and log redaction, consent/suppression precedence, service-worker upgrades, and accessibility. Backend capabilities require contract tests against a contract-faithful server; UI simulation cannot satisfy acceptance.

## Open product decisions

The following must be supplied or approved before the relevant phase:

- Detailed personas, user journeys, and acceptance criteria
- Authentication identifiers, OTP provider, session policy, and account recovery
- Customer and business onboarding fields and verification rules
- Discovery ranking, location model, categories, and search behavior
- Product pricing, variants, inventory, taxes, currency, delivery, and order semantics
- Chat participants, attachments, retention, read receipts, and delivery channels
- Customer ownership, consent, segmentation operators, and campaign approval rules
- Business roles, permissions, invitations, workspace limits, and multi-business behavior
- Analytics definitions and reporting periods
- Subscription plans, billing rules, and entitlement behavior
- Platform-admin workflows, moderation policy, audit retention, and support tooling
- Urdu support, locale/date/number formats, timezone rules, and accessibility target
- Data retention, export/deletion, privacy, legal, and regulatory requirements
- Sync conflict ownership and server versioning contract
- Consent evidence, suppression scope, frequency caps, quiet hours, reporting workflow, and applicable anti-spam law
- Shared-device threat model, cache purge, offline-encryption decision, and device-loss response
- Status definitions distinguishing queued, accepted, delivered, paid, verified, and synchronized
