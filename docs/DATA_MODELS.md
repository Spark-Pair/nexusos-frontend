# Data Models

## Modeling conventions

- Use strict TypeScript types and opaque/branded IDs where practical.
- Every locally created mutable entity has a UUID `id`, timestamps, a monotonic or opaque `version`, and sync metadata where required.
- Store timestamps as ISO 8601 UTC strings; format in the user's locale at presentation time.
- Use string unions/discriminated unions for lifecycle states and exhaustive transitions.
- Validate persisted and network data at infrastructure boundaries.
- Prefer tombstones for synchronized deletion until server acknowledgement and retention expiry.

The fields below are architectural minimums, not final product schemas. Personally identifiable, pricing, location, and compliance fields await product approval.

## Identity and access

### User

`id`, `displayName`, optional approved contact handles, `status`, `createdAt`, `updatedAt`.

Status: `pending | active | suspended | deleted`.

`deleted` is server-confirmed; a local deletion request must not assert completion. Recovery/anonymization states require approval.

### AuthSession

Runtime-only representation of `userId`, assurance/authentication state, expiry, and available contexts. Credentials and long-lived secrets are never persisted by feature code.

State: `restoring | unauthenticated | challenge_pending | authenticated | refresh_required | expired`. Development sessions are explicitly simulated.

### CustomerProfile

`id`, `userId`, approved profile fields, `onboardingStatus`, timestamps, version.

Onboarding: `not_started | in_progress | locally_completed | submitted | completed | changes_required`.

### Business

`id`, `name`, `slug`, approved profile/location/category fields, `status`, timestamps, version.

Status: `draft | submission_pending | pending_review | active | changes_required | suspension_pending | suspended | archival_pending | archived` (provisional). Server acknowledgement controls review, suspension, and archival outcomes.

### BusinessMembership

`id`, `businessId`, `userId`, `roleId`, `status`, invitation metadata, timestamps, version.

Status: `invitation_draft | invited | accepted | active | suspended | revoked | declined | expired | removed`. Authoritative access changes require the server.

### Role and PermissionGrant

Role: `id`, scope (`business | platform`), name, and grants. A grant identifies a typed action/resource pair. Backend-issued grants will be authoritative.

## Customer relationships and content

### Follow

`id`, `customerId`, `businessId`, `status`, timestamps, version.

Status: `follow_pending | active | unfollow_pending | removed | rejected`. Unique logical relationship: customer plus business; `active` and `removed` require server acknowledgement.

### BusinessUpdate

`id`, `businessId`, content references, `status`, publication time, timestamps, version.

Status: `draft | publication_pending | published | unpublication_pending | archived`.

### Product

`id`, `businessId`, name, description, media references, approved pricing/availability fields, `status`, timestamps, version.

Status: `draft | publication_pending | published | unavailable | archived | deletion_pending | deleted`.

Variants, inventory, tax, and currency models remain unresolved.

## Orders

### Order

`id`, `businessId`, `customerId`, line snapshots, totals when approved, customer note, `status`, timestamps, version.

Provisional status: `draft | submission_pending | requested | acknowledged | accepted | rejected | in_progress | ready | completed | cancellation_pending | cancelled | expired`.

`submission_pending` and `cancellation_pending` are local intents. Other non-draft transitions require server acknowledgement.

Allowed transitions must be encoded as domain policy after order semantics are approved. Order lines snapshot commercial data so later product edits do not rewrite history.

### OrderLine

`id`, `orderId`, optional `productId`, product-name snapshot, quantity, selected options, approved money fields.

## Conversations

### Conversation

`id`, `businessId`, `customerId`, assignment metadata, `status`, latest-message metadata, timestamps, version.

Status: `open | pending | resolution_pending | resolved | reopen_pending | archival_pending | archived` (provisional). Pending action states are local intents; canonical state is server-owned.

### Message

`id`, `conversationId`, sender identity/context, content representation, `deliveryStatus`, client-created time, optional server time, version.

Local state: `draft | queued | submitting | failed`. Backend/provider delivery state: `accepted | sent | delivered | undeliverable`. A frontend-only adapter cannot manufacture delivery state.

## Customer management and campaigns

### BusinessCustomer

`id`, `businessId`, `customerId`, business-owned display/metadata, consent flags when approved, timestamps, version. This is a business-context relationship, not a duplicate authentication user.

Status: `prospect | active | inactive | blocked | archived`. Relationship status does not grant marketing consent.

### CustomerNote

`id`, `businessId`, `businessCustomerId`, author membership, content, timestamps, version.

Status: `active | deletion_pending | deleted`. Notes are private to the owning business.

### Segment

`id`, `businessId`, name, typed rule tree, `status`, timestamps, version.

Status: `draft | active | stale | archived`. Membership is a computed read model, not consent.

### Campaign

`id`, `businessId`, optional `segmentId`, channel representation, content, schedule, `status`, timestamps, version.

Local state: `draft | approval_pending | approved_local | archived`. Backend execution state: `scheduled | processing | paused | completed | cancelled | failed`. `approved_local` is not compliance approval.

### CommunicationConsent

`id`, `customerId`, `businessId`, channel, purpose, status, source, policy/version evidence, captured time, optional expiry/revocation time, timestamps, version.

Status: `unknown | granted | revoked | expired`. Unknown is treated as not granted for marketing.

### SuppressionEntry

`id`, subject/contact reference, optional `businessId`, channel, scope, reason, source, status, effective time, optional expiry, timestamps, version.

Status: `active | expired | revoked`. Active suppression overrides consent, following, and segmentation.

### BlockRelationship

`id`, `customerId`, `businessId`, initiator, status, timestamps, version.

Status: `block_pending | blocked | unblock_pending | unblocked`. Enforcement requires server acknowledgement.

### AbuseReport

`id`, reporter reference, reported subject/content reference, category, approved evidence references, status, timestamps, version.

Local: `draft | submission_pending | submission_failed`. Server: `submitted | triaged | actioned | dismissed | closed`.

## Operations

### IntegrationConnection

`id`, `businessId`, provider key, capability list, `status`, sanitized metadata, timestamps, version. Secrets belong on the backend.

Status: `not_connected | connection_pending | connected | degraded | disconnection_pending | disconnected | revoked | error`. Confirmation is backend/provider-owned.

### Subscription

`id`, `businessId`, plan reference, status, period/cancellation metadata, timestamps, version. Status: `unknown | trialing | active | past_due | paused | cancellation_pending | cancelled | expired`. This is a server-owned read model.

### BillingRecord

Server-owned read model with identity, business, type, amount/currency when approved, period/reference, timestamps, and status: `draft | open | paid | void | uncollectible | refunded`. The frontend cannot generate authoritative billing records.

### AuditEvent

`id`, actor reference/context, typed action, target reference, sanitized metadata, occurred time. The future server is authoritative; local events are diagnostic only.

Status: `local_diagnostic | server_recorded`.

## Offline and synchronization

### SyncMutation

`id` (idempotency UUID), `entityType`, `entityId`, operation, validated payload or patch, base version, dependency IDs, actor/workspace context, attempt count, `status`, next-attempt time, timestamps, and last sanitized error.

Status: `pending | leased | sending | retry_wait | blocked_dependency | blocked_auth | conflict | acknowledged | failed_permanent | superseded`.

### SyncMetadata

Per entity: local revision, last known server version, dirty/tombstone flags, last synchronized time, and conflict reference.

### SyncConflict

`id`, mutation ID, entity reference, base/local/server versions, field-safe snapshots or references, resolution state, timestamps.

Resolution: `unresolved | keep_local | accept_server | merged | superseded`.

## Relationships

- A User has zero or one CustomerProfile and zero or more BusinessMemberships.
- A Business has memberships, followers, updates, products, business customers, conversations, orders, segments, campaigns, and integrations.
- A CustomerProfile follows many businesses and has conversations and orders with businesses.
- An Order owns immutable/historical OrderLine snapshots.
- A Segment selects BusinessCustomer records; a Campaign may target one approved segment snapshot.
- Consent permits a purpose/channel; SuppressionEntry and BlockRelationship override it. Recipient resolution evaluates all three on the server.
- AbuseReport and BlockRelationship are separate; a customer may use either or both.
- SyncMutation records refer to entities by type and ID without coupling UI code to storage tables.
