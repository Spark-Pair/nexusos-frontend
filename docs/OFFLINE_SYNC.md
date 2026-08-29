# Offline Storage and Synchronization

## Objectives

After one successful load, NexusOS should open on an unreliable or absent network, show previously available data, accept explicitly supported changes, preserve them across reloads, and explain their synchronization state. Offline capability never pretends an external action has completed.

## IndexedDB tables

Dexie schema versions will define normalized tables and indexes. Initial planned tables are:

- `users`, `customerProfiles`, `businesses`, `memberships`, `roles`
- `follows`, `updates`, `products`
- `orders`, `orderLines`
- `conversations`, `messages`
- `businessCustomers`, `customerNotes`, `segments`, `campaigns`
- `integrationConnections` and approved billing read models
- `syncMutations`, `syncConflicts`, `syncCheckpoints`
- `appMetadata` for schema/application coordination, never secrets

Scope compound indexes by user/business as appropriate. Do not store large binary media in core entity rows; define a separate quota-aware media strategy before offline attachments.

Add `communicationConsents`, `suppressions`, `blocks`, and `abuseReports` when those features begin. Every record has an account partition key and applicable workspace key; unscoped queries are invalid.

## Cache policy

- Service-worker precache: versioned application shell and build assets.
- Cache Storage: safe public static assets and explicitly approved runtime GET responses only.
- IndexedDB: structured domain data, drafts, mutation queue, checkpoints, and sync state.
- TanStack Query: in-memory coordination; never the sole durable cache.
- `localStorage`: small non-sensitive preferences only.

Each repository query defines freshness, stale display, retention, and eviction. Show last-updated and offline/stale status where it affects decisions. Enforce quota-aware cleanup for evictable caches while never deleting unsynced writes.

Browser storage is not assumed encrypted at rest and is visible to anyone using the same unlocked browser profile. Minimize personal data, store no secrets, and block production until logout/shared-device retention and purge policies are approved. Private API payloads never enter Cache Storage.

## Local write and mutation queue

For an offline-capable command, one Dexie transaction:

1. Generates a UUID for the entity/mutation as applicable.
2. Validates the command and allowed local lifecycle transition.
3. Applies an optimistic local record with dirty sync metadata.
4. Inserts an immutable-intent `SyncMutation` with actor/workspace context, base version, and dependencies.

The UI observes repository results and queue-derived status. It never writes queue rows itself. Updates to the same entity may be compacted only when semantics and audit needs allow it; creates must precede dependent updates/deletes.

## Sync worker

Synchronization runs after session restoration when online, on reconnect, on explicit retry, and at bounded foreground opportunities. A single logical worker uses a lease/lock to avoid duplicate multi-tab processing. It batches only when the server contract guarantees independent results.

`navigator.onLine` is only a hint; an API/health response establishes reachability. Do not promise background sync because browser and OS scheduling are inconsistent. Foreground resume/reconnect is the baseline.

Process eligible mutations in dependency order. Re-read current authorization context before sending. Mark an item `syncing` with a recoverable lease; an interrupted lease returns to `pending` after timeout.

## Pull synchronization and acknowledgements

Push alone is insufficient. The API must provide an ordered, scoped change feed or cursor/checkpoint protocol with upserts, tombstones, permission revocations, and cursor-expiry recovery. Advance a checkpoint only after one transaction durably applies its full page.

Apply changes and acknowledgements transactionally. Match acknowledgements by idempotency UUID, store authoritative version/state, then mark acknowledged. Duplicate acknowledgements are harmless. Gaps, invalid payloads, or out-of-order versions trigger bounded recovery/full resync rather than silent overwrite.

Pull is account/membership scoped. Revoked access blocks queued writes and applies approved cache cleanup. Full resync preserves or quarantines unacknowledged intents before replacing cached server state.

## Retry strategy

- Network failures, timeouts, server 5xx, and 429 are retryable.
- Honor `Retry-After`; otherwise use capped exponential backoff with jitter.
- Authentication failures pause affected work until session recovery.
- Offline detection does not consume an attempt. Retry budgets persist across reloads and are tracked by mutation/failure class.
- Validation/forbidden/not-found failures are permanent or require user action; do not loop.
- Version conflicts enter `conflict` and stop dependent mutations.
- Bound automatic attempts and retain a user-visible manual retry path plus sanitized diagnostics.

## Idempotency

Every mutation has a stable client-generated UUID sent as the idempotency key across every retry. The future server must atomically store/replay the result for that key within an agreed retention period. Entity creation uses a stable client UUID or an explicit client-ID mapping; retries must never create duplicates.

Idempotency retention must exceed the maximum offline/retry window, or client entity IDs must be permanently deduplicated. A timeout after commit is an unknown result and retries with the same key. Payments and delivery need provider-level as well as API idempotency.

## Conflict resolution

Every mutable synchronized record carries the last known server version. Mutations send that base version and the server performs conditional updates.

- Append-only records such as new messages can normally merge by unique ID.
- Independent preference fields may use a documented field-level merge.
- Lifecycle transitions, permissions, orders, campaign state, and destructive edits require server validation and must not use blind last-write-wins.
- Consent, suppression, blocks, membership/roles, billing, delivery, and abuse reports are server-governed and never auto-merged.
- On conflict, persist the local intent and safe server representation, mark dependent work blocked, and show an explicit resolution flow.
- Resolution creates a new mutation against the latest version; it never rewrites history silently.

Server time/version is authoritative. Client clocks are display hints, not ordering authority.

## Temporary IDs

Prefer UUIDs generated on the client as permanent public identifiers. If the Laravel database also uses internal numeric IDs, keep them behind DTO mapping. If a provider forces server IDs, store an explicit local-to-server mapping and transactionally rewrite references after acknowledgement; never expose temporary IDs as business meaning.

## Sync status

Expose local draft, queued, sending, retry scheduled, blocked, conflict, server acknowledged, stale/offline, and up-to-date-at-checkpoint states. Provide separate last successful push/pull times. Never use sent, delivered, verified, paid, or synchronized for local persistence.

## Failure recovery

- App/process interruption: expired worker leases make mutations eligible again.
- Corrupt/invalid queue item: quarantine as permanent failure; retain exportable sanitized diagnostics.
- Storage quota: stop cache growth, evict approved cached reads/media, preserve unsynced user data, and warn the user.
- Logout/account switch: partition data by account. Never send one account's queue under another session. Production is blocked until retain-versus-purge behavior is approved and tested.
- Remote deletion or permission loss: quarantine local intent, block dependents, remove inaccessible cache per policy, and prevent cross-scope export.
- Service-worker update: do not activate an incompatible client over an active mutation transaction; coordinate refresh messaging.

Never offer “clear all data” as the only recovery for unsynced work without an export/explicit destructive confirmation path.

## Data migrations

- Increment Dexie versions; migrations are forward-only, deterministic, and tested against representative prior databases.
- Back up or transform unsynced queue payloads before changing their shape.
- Use additive, resumable migrations for large datasets and record migration checkpoints.
- Keep app/schema/API compatibility ranges explicit. If an update cannot safely migrate, block the affected feature and provide recovery guidance.
- Test upgrade, interrupted migration, quota failure, and rollback compatibility before release.
- Never downgrade IndexedDB in place. Rollback uses a schema-compatible client or a tested forward migration.

## Offline capability matrix

Can work offline after relevant data/app assets were loaded:

- Open application shells and cached routes.
- Read retained business, product, update, order, conversation, and customer data within permission scope.
- Resume approved onboarding drafts.
- Save supported drafts and queue allowed intents such as follows, profile edits, order submissions, notes, catalog edits, status-change requests, and message delivery requests.
- View queue and conflict status and retry eligible local failures.

Cannot be completed offline:

- First-ever application load or uncached assets/data.
- Real authentication/OTP verification or session recovery requiring the server.
- Authoritative permission changes or account verification.
- Real message/campaign delivery, payments, refunds, or ERP/provider operations.
- Fetching never-cached search results, remote media, or current analytics.
- Resolving conflicts that require the latest server state.
- Confirming follows, onboarding, orders, invitations, roles, blocks, reports, consent, campaign schedules, subscriptions, deletion, or other server-governed transitions.

Queued external intents must be labelled pending and revalidated before the backend performs an irreversible action.

## Required server contract before live sync

Agree on idempotency retention, atomic acknowledgements, versions, conditional requests, push dependencies, partial failures, ordered pull cursors, cursor expiry/full resync, tombstones, permission revocation, server time, authorization, consent/suppression, provider idempotency, rate/frequency limits, and safe conflicts before live sync.

## Required sync test matrix

- Fresh install, warmed offline reload, reconnect, and intermittent connectivity.
- Duplicate sends/acknowledgements, timeout after commit, dependencies, partial batches, and out-of-order pull events.
- Concurrent tabs, expired leases, termination, token expiry, account switch, membership revocation, and remote deletion.
- Ordinary and server-governed conflicts; suppression must beat a queued campaign intent.
- Quota, corrupt records, cursor expiry, full resync with pending writes, and every supported migration.
- Service-worker update with pending work and app/schema/API incompatibility.
- Private responses never enter Cache Storage; logs are redacted; scopes do not leak; local states never appear authoritative.
