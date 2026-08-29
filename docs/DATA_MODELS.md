# Data Models

## Modeling conventions

- Use strict TypeScript types and opaque/branded IDs where practical.
- Every locally created mutable entity has a UUID `id`, timestamps, a monotonic or opaque `version`, and sync metadata where required.
- Store timestamps as ISO 8601 UTC strings; format in the user's locale at presentation time.
- Use string unions/discriminated unions for lifecycle states and exhaustive transitions.
- Validate persisted and network data at infrastructure boundaries.
- Prefer tombstones for synchronized deletion until server acknowledgement and retention expiry.

These models reflect the supplied product requirements. Exact legal retention, monetary/tax rules, permissions, and provider DTOs remain unresolved.

## Identity and access

### User

`id`, `displayName`, optional approved contact handles, `status`, `createdAt`, `updatedAt`.

Status: `pending | active | suspended | deleted`.

`deleted` is server-confirmed; a local deletion request must not assert completion. Recovery/anonymization states require approval.

### AuthSession

Runtime-only representation of `userId`, assurance/authentication state, expiry, and available contexts. Credentials and long-lived secrets are never persisted by feature code.

State: `restoring | unauthenticated | challenge_pending | authenticated | refresh_required | expired`. Development sessions are explicitly simulated.

### CustomerProfile

`id`, `userId`, full name, optional email/image, city, interests, language, location preference, `onboardingStatus`, timestamps, version.

Onboarding: `not_started | in_progress | locally_completed | submitted | completed | changes_required`.

### Business

`id`, name, username/slug, description, legal name, size/type, category, location, timings, logo/cover, contact details, delivery areas/COD/return/social settings, verification reference, `status`, timestamps, version.

Status: `draft | submission_pending | pending_review | active | changes_required | suspension_pending | suspended | archival_pending | archived`. Server acknowledgement controls review, suspension, and archival outcomes.

### BusinessMembership

`id`, `businessId`, `userId`, `roleId`, `status`, invitation metadata, timestamps, version.

Status: `invitation_draft | invited | accepted | active | suspended | revoked | declined | expired | removed`. Authoritative access changes require the server.

### Role and PermissionGrant

Role: `id`, scope (`business | platform`), name, and grants. Initial business roles: Owner, Admin, Manager, Marketing, Sales, Customer support, Catalog manager, Analyst, Custom. Grants cover Inbox, Customers, Campaigns, Products, Orders, Analytics, Integrations, Team, Billing, Settings. Backend grants are authoritative.

### Address

`id`, `customerId`, name, phone, city, area, complete address, delivery notes, status, timestamps, version. Status: `local_draft | pending_sync | active | archived`.

### NotificationPreference and FollowPreference

Scoped preferences for new arrivals, sales/discounts, order updates, restocks, messages, recommendations, events, and daily updates. A FollowPreference never grants phone visibility or general marketing consent.

## Customer relationships and content

### Follow

`id`, `customerId`, `businessId`, `status`, timestamps, version.

Status: `follow_pending | active | unfollow_pending | removed | rejected`. Unique logical relationship: customer plus business; `active` and `removed` require server acknowledgement.

### BusinessReview

Server-owned read model for business/customer, rating, approved review content, moderation state, timestamps/version. Authenticity, eligibility, lifecycle, and moderation rules remain unresolved.

### BusinessUpdate

`id`, `businessId`, type, message/product/media references, pin/read metadata, `status`, publication time, timestamps, version.

Type: `new_arrival | sale | restock | announcement | event | order_notice`.

Status: `local_draft | pending_sync | draft | scheduling_pending | scheduled | publishing | published | archived | failed`.

### SavedProduct and SavedUpdate

Account-scoped joins with UUID, target ID, timestamps, and sync metadata. Saved state works locally; cross-device state requires acknowledgement.

### Product

`id`, `businessId`, name, description, category, SKU, regular/sale/cost price subject to permission, stock settings/count/threshold, variants, media, delivery/COD/return information, metrics read model, `status`, timestamps, version.

Status: `local_draft | pending_sync | draft | publication_pending | active | out_of_stock | archived | rejected | sync_failed | deletion_pending | deleted`.

### ProductVariant and TemporaryFile

ProductVariant represents size, color, or other option groups with availability and optional stock. TemporaryFile stores account/workspace, local blob reference/metadata, purpose, size/type, compression/upload state, timestamps. Verification documents never use ordinary offline media storage.

## Orders

### OrderRequest / Order

`id`, `businessId`, `customerId`, line snapshots, totals when approved, customer note, `status`, timestamps, version.

Status: `local_draft | pending_sync | request_sent | awaiting_confirmation | confirmed | processing | shipped | delivered | cancellation_requested | cancelled | rejected | sync_failed`.

`pending_sync` and `cancellation_requested` can represent local intents; `request_sent`, `confirmed`, `cancelled`, and all later shared transitions require server acknowledgement.

Allowed transitions must be encoded as domain policy after order semantics are approved. Order lines snapshot commercial data so later product edits do not rewrite history.

### OrderLine

`id`, `orderId`, optional `productId`, product-name snapshot, quantity, selected options, approved money fields.

### OrderAddress and OrderTimelineEvent

OrderAddress snapshots name, phone, city, area, address, and delivery notes. OrderTimelineEvent records transition, actor context, local/server provenance, time, and optional reason/tracking data. Only acknowledged events change shared state.

## Conversations

### Conversation

`id`, `businessId`, `customerId`, assignment, labels, product/order context, unread/latest-message metadata, mute/archive/spam state, `status`, timestamps, version.

Status: `open | pending | resolution_pending | resolved | reopen_pending | archival_pending | archived | spam`. Pending action states are local intents; canonical state is server-owned.

### Message

`id`, `conversationId`, sender identity/context, content representation, `deliveryStatus`, client-created time, optional server time, version.

Local state: `draft | queued | submitting | failed`. Backend/provider delivery state: `accepted | sent | delivered | undeliverable`. A frontend-only adapter cannot manufacture delivery state.

Attachment references are `product | order | image_placeholder`. Read/typing states are backend-derived.

## Customer management and campaigns

### BusinessCustomer

`id`, `businessId`, `customerId`, business-owned metadata, city, tags/segments, activity/order/spend/interests/engagement read models, assignee, contact/phone grants, timestamps/version. This is not a duplicate auth user.

Status: `prospect | active | inactive | blocked | archived`. Relationship status does not grant marketing consent.

### CustomerNote

`id`, `businessId`, `businessCustomerId`, author membership, content, timestamps, version.

Status: `active | deletion_pending | deleted`. Notes are private to the owning business.

### Segment

`id`, `businessId`, name, typed AND/OR rule tree, exclusions, preview metadata, `status`, timestamps/version. Conditions cover city, follow date, activity, orders/spend, product category/purchase, engagement, tags, and customer status.

Status: `draft | active | stale | archived`. Membership is a computed read model, not consent.

### Campaign

`id`, `businessId`, type, name/internal description, title/body/CTA, ordered product/media references, audience/exclusions, timezone/schedule, frequency/fair-use metadata, creator, `status`, timestamps/version.

Local state: `draft | approval_pending | approved_local | archived`. Backend execution state: `scheduled | processing | paused | completed | cancelled | failed`. `approved_local` is not compliance approval.

### CampaignAnalytics

Backend-derived read model for sent/delivered/opened and rates, views/clicks, conversations/orders/revenue influenced, unsubscribes/reports, timeline, device/city/product/audience breakdowns, and conversion funnel. Offline values are cached/stale.

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

### BusinessVerification

`id`, `businessId`, document-placeholder metadata, missing keys, submission data, changes/rejection reason, status, timestamps/version. Status: `not_submitted | draft | pending_upload | pending_sync | submitted | under_review | more_information_required | approved | rejected | suspended`. Secure documents/review are backend-owned.

### TeamInvitation

`id`, business, name/email/role/message, status, timestamps/version. Status: `draft | request_pending | invited | accepted | declined | expired | revoked`. Non-draft authority belongs to the backend.

### Notification

`id`, account/workspace scope, type, title/body-safe references, target route, read/archive/delete state, provenance, occurred/created/updated times. Types cover message, follower, campaign completion/warning, order request/status, low stock, integration error, verification, invitation, billing, sync failure, application update.

### SearchHistoryEntry

Small non-sensitive actor-scoped query/route/time preference suitable for localStorage. Searchable entity indexes remain in IndexedDB and obey permissions.

### Subscription

`id`, `businessId`, plan reference, status, period/cancellation metadata, timestamps, version. Status: `unknown | trialing | active | past_due | paused | cancellation_pending | cancelled | expired`. This is a server-owned read model.

### PlanDefinition and FairUsePolicy

Server-owned plan entitlements, campaign/audience allowance, team/integration allowance, warning thresholds, and restrictions. Initial concepts: Free Trial, Business, Business Pro, Enterprise. Exact prices/limits remain unresolved.

### BillingRecord

Server-owned read model with identity, business, type, amount/currency when approved, period/reference, timestamps, and status: `draft | open | paid | void | uncollectible | refunded`. The frontend cannot generate authoritative billing records.

### AuditEvent

`id`, actor reference/context, typed action, target reference, sanitized metadata, occurred time. The future server is authoritative; local events are diagnostic only.

Status: `local_diagnostic | server_recorded`.

### ModerationCase

Server-owned report/target references, category/risk indicators, notes, assignee, status, decision/reason, audit references, timestamps/version. Status: `open | reviewing | information_requested | dismissed | actioned | closed`.

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
