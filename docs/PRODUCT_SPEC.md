# NexusOS Complete Product Specification

## 1. Product identity and positioning

- Product: **NexusOS**, a SparkPair product.
- Tagline: **Everything around your business, connected.**
- Category: Business Connection Operating System.
- Launch market: Karachi, Pakistan; long-term market: Pakistan and international.
- Initial industries: Fashion and garments, Retail, Restaurants and food, Beauty, Electronics, Home and lifestyle, Automotive, Property, Professional services, Wholesale.
- Long-term goal: support every type of business without embedding Karachi-only assumptions.
- Design: minimal, clean, aesthetic, professional, practical.

NexusOS is a business-focused communication, customer-management, broadcasting, and commerce platform—not a basic WhatsApp clone. It is positioned as a business connection, communication, management, and commerce platform.

Businesses manage conversations, followers/subscribers, profiles, segments, broadcasts, new-arrival and sale/discount updates, catalogs, inquiries, order requests/history, teams, analytics, and ERP/POS/SaaS/e-commerce integrations. Customers discover and follow without automatically exposing phone numbers; choose updates; keep broadcasts separate from personal conversations; browse/save products and updates; inquire, request/track orders, chat, unsubscribe, mute, block, and report.

## 2. Product and technical direction

This is the production frontend foundation, not a disposable prototype. Use React, Vite, strict TypeScript, Tailwind CSS, mobile-first responsive design, an installable offline-capable PWA, Vercel initially, and the quality rules below.

The future backend is Laravel REST API with PostgreSQL, Redis/queues, object storage, realtime messaging, push services, OTP, payments, and ERP/POS integrations. Pages use typed services/repositories; components never access IndexedDB, HTTP, or backend simulations directly. Offline and Laravel repositories remain replaceable without page rewrites.

Four isolated areas have separate navigation, authorization context, and route boundaries: Public/Authentication, Customer, Business Workspace, Platform Administration. See `ROUTE_MAP.md` and `FEATURE_MATRIX.md`.

## 3. Public and authentication

Routes: Welcome, Product introduction, Business introduction, Customer introduction, Pricing placeholder, Help, Privacy placeholder, Terms placeholder, Contact placeholder, Sign in, Create account. Early marketing content may be limited while routes allow expansion.

Production authentication, OTP delivery, multi-device identity, recovery, and authoritative sessions require backend. A six-digit development OTP is allowed only in a clearly labelled development adapter and never appears production-secure.

## 4. Customer application

Mobile-first and tablet/desktop usable. Mobile navigation: Discover, Updates, Orders, Chats, Profile.

### 4.1 Onboarding

Seven resumable steps:

1. **Welcome:** logo, name, tagline, explanation, Continue, Already have an account.
2. **Phone:** country selector, required phone, Continue/Back; Pakistani phone-number formatting during the initial market and visible invalid-number errors.
3. **OTP:** six digits, countdown, resend, change number, verify; real OTP needs backend.
4. **Profile:** full name, optional email, city, optional image; Back/Continue.
5. **Interests:** Fashion, Food, Beauty, Electronics, Home, Automotive, Property, Services, Wholesale, Events; initially require at least three unless changed.
6. **Location:** manual, simulated current location, or skip; Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta.
7. **Notifications:** New arrivals, Sales/discounts, Order updates, Restock alerts, Business messages, Recommended businesses; completes local onboarding.

### 4.2 Discover, profile, and follow

Discover: search, city/category, recommended/trending/new/nearby businesses, popular products, recently viewed, categories. Search business names/categories, products, locations. Filters: category, location, verified, rating, open now, delivery, price. Actions: search/apply/clear, follow/unfollow, view business/product, save/remove, share, see all. Nearby requires permission and backend data.

Business profile: logo, cover, name, verified badge, category/location/rating/followers, description/hours/contact/delivery, Follow/Message/Share/More; tabs Updates, Products, About, Reviews.

Follow opens preferences: New arrivals, Sales/discounts, Restock, Events, Daily updates, Order updates. Confirm/cancel/edit/unfollow; optimistic state/count, persisted preferences, confirmed unfollow. Following never reveals phone. Contact access needs explicit consent and authoritative permission.

### 4.3 Business Updates

Broadcasts are separate from personal conversations. Filters: All, New arrivals, Sales, Restocks, Order updates, Saved, Unread. Items show business/verification, time/type/message, product content/prices, collection/question/save/share/more. More: mute, preferences, unfollow, report, hide. Support read/unread/all-read, save/remove, pagination, filter-specific empty states.

### 4.4 Products

Detail: gallery, name/business, current/previous price, availability, sizes/colors/quantity, description, delivery, COD, return summary, related products. Actions: save/remove/share/ask/order/follow/view business. Validate required variants before ordering.

### 4.5 Order request and orders

Four steps: (1) size/color/quantity/variants; (2) name/phone/city/area/full address/notes; (3) Cash on delivery, bank transfer, or digital wallet preference, with no initial real processing; (4) review product, variants, quantity, price, delivery charge, estimated total, address, preference and Back/Submit.

Local submission creates UUID, IndexedDB record, queued mutation, and honestly distinguishes Saved offline, Pending synchronization, Submitted to server, Accepted by business. Backend acknowledgement supplies authoritative order number, business visibility, and optional conversation.

Orders tabs: Active, Completed, Cancelled. States: Local draft, Pending synchronization, Request sent, Awaiting confirmation, Confirmed, Processing, Shipped, Delivered, Cancellation requested, Cancelled, Rejected, Sync failed. Detail: order/local reference, business/items/prices/address/payment/timeline/sync, contact/cancel/reorder/report. Cancellation requires confirmation/reason and backend acknowledgement.

### 4.6 Chats

List: search, unread, archived, verification, last message/time/count. Conversation: text, product/order attachments, image placeholders, quick replies, timestamps, acknowledged read state, typing placeholder, search, mute/archive/block/report, confirmed local deletion.

Replies: “Is this available?”, “What is the final price?”, “Do you offer COD?”, “When will this be delivered?”, “Is this available in another size?” Drafts/pending messages save/queue offline; delivered/read requires acknowledgement; real multi-user messaging needs backend/realtime.

### 4.7 Profile

Personal information, saved products/updates, follows, notification preferences, addresses, language, privacy, blocked businesses, help/support, logout. Languages: English, Urdu, Roman Urdu. Logout is confirmed and clears/protects private shared-device data.

## 5. Business Workspace

Desktop-first, responsive/mobile-friendly. Navigation: Overview, Shared Inbox, Customers, Segments, Campaigns, Updates, Products, Orders, Analytics, Integrations, Team, Business Profile, Billing and Usage, Settings.

### 5.1 Setup and verification

Setup: basics, category, location, timings, logo/cover, contact, delivery/COD, team, customer import, system connection, review/verification. Basics: name, username, description, legal name, size, type. Types: Retail, Wholesale, Services, Restaurant, Manufacturer, Distributor, Online seller, Other.

Verification placeholders: CNIC, NTN, registration, utility bill, storefront proof. Show status, missing documents, submission/review dates/state, requested changes, rejection reason. States: Not submitted, Draft, Pending upload, Pending synchronization, Submitted, Under review, More information required, Approved, Rejected, Suspended. Real review/files require backend/object storage.

### 5.2 Overview

Metrics: followers/customers/new followers, unread conversations, campaign reach/open rate, product views/inquiries, influenced orders/revenue, subscription, fair-use usage, integration. Sections: attention, campaign performance, conversations, inquiries, orders, products, followers, integration activity, tasks. Filters Today/7/30/90/custom. Actions create update/campaign, add product, inbox, analytics, invite.

### 5.3 Shared Inbox and customers

Inbox filters: All, Unassigned, Mine, Unread, Awaiting customer, Resolved, Archived, Spam. List: customer, last message/time/unread, assignee, labels, order/product context. Conversation: history, customer/business messages, product/order cards, notes, system events, file placeholders, composer. Context: profile, follow/contact permission, segments/tags, orders/interests/opens/spend, owner.

Actions: send, attach product/order, note, assign, status, label, segment, unread, archive, block, report, delete local, history. Real synchronization/delivery/read receipts, assignments, permissions, collaboration need backend.

Customer table: customer, follow/contact, city, segments, activity, orders/spend, assignee, status; search/sort/filter/multi-select/tag/segment/assign/export/archive/block/details. Filters: follow, city/type, orders/activity/spend, interest/tags/assignee.

Details: identity/avatar/city, follow/privacy/contact/preferences, tags/segments, conversation/order history, interests/opens/spend, notes/assignee; message/note/tag/segment/assign/block/archive. Cached restricted data never grants access.

### 5.4 Segments and campaigns

Segments examples: All followers, VIP, New, Repeat, Inactive, Karachi, women’s-fashion interest, purchased in 30 days, waitlists. Create/edit/duplicate/delete/preview/campaign. AND/OR conditions: city, follow date, activity, order count/spend, product category/purchase, engagement, tags, status. Local membership is simulated; shared is server-authoritative.

Campaign tabs: All, Draft, Scheduled, Sending, Completed, Failed, Cancelled. Fields: title, audience/type/status/time, sent/delivered/opened, clicks/conversations/orders influenced, creator. Create/open/duplicate/edit/pause/cancel/delete draft/analytics/export.

Creation: (1) New arrival, Sale/discount, Restock, Announcement, Event, Recommendation; (2) name/internal description/title/body/CTA; (3) image placeholders, products reorder/remove, price/discount; (4) all followers/saved segment/custom/exclusions/estimated size; (5) now/schedule/timezone/frequency/recent-contact exclusion/test; (6) preview/audience/reach/time/fair-use/warnings/missing data and draft/back/test/schedule/send request.

Before send/schedule confirm and show audience, fair-use impact, frequency warning. Drafts/media work offline within quota; actions queue requests and never imply delivery. Backend workers send.

Analytics: sent/delivered/rates/opened/open rate, views/clicks, conversations/orders, unsubscribes/reports/revenue, timeline/device/city/product/audience/funnel, export. Backend-derived; cached history only offline.

### 5.5 Updates and catalog

Updates: create/edit/preview/publish request/schedule request/archive/delete draft/duplicate/pin/unpin. Types New arrival, Sale, Restock, Announcement, Event, Order notice. States Local draft, Pending sync, Draft, Scheduled, Publishing, Published, Archived, Failed.

Catalog table/grid fields: image/name/SKU/category/prices/cost where permitted/stock/variants/status/views/inquiries/orders. States Local draft, Pending sync, Draft, Active, Out of stock, Archived, Rejected, Sync failed. Search/filter/sort/add/edit/duplicate/archive/delete draft/out-of-stock/restock/campaign/share/bulk.

Product form: name, description, category, SKU, regular/sale/cost price, stock toggle/count/low-stock threshold, sizes/colors/variants/images, delivery/COD/return/status. Draft/preview/publish/cancel. Validate name, valid prices, sale below regular, nonnegative stock, image before publish. Draft products/images offline with compression/quota; publishing queues.

### 5.6 Business orders

Tabs All, New requests, Awaiting confirmation, Confirmed, Processing, Shipped, Delivered, Cancelled, Rejected, Sync issues. Table order/customer/product/quantity/amount/payment/status/assignee/time/sync. Search/filter/sort/open/confirm/reject/status/assign/message/print/export.

Detail customer/contact/address/items/variants/quantity/prices/payment/timeline/notes/conversation/ERP/employee/sync. Confirm/reject/request info/process/ship/tracking/deliver/cancel/message/ERP/print. Confirmation where appropriate creates timeline and queued intent; customer-visible state changes after server acknowledgement.

### 5.7 Analytics and integrations

Analytics: business/follower growth, engagement, campaigns, products, order funnel, response/team performance, revenue, retention, city/category-interest; date/location/category/campaign/segment/team filters; loading/empty/error/cached-offline/populated states.

Integrations: SparkPair ERP/products, Shopify, WooCommerce, Retail POS, Custom ERP/API, Webhooks. States Available, Connection draft, Pending connection, Connected, Syncing, Error, Disconnected. Description/capabilities/status/last sync, connect/configure/sync/disconnect/logs. Setup placeholders: store/API URL, API key, username/password, direction/frequency, product/inventory/customer/order sync. Never store secrets locally/source; backend credentials; labelled demos.

### 5.8 Team, profile, billing, settings

Roles Owner, Admin, Manager, Marketing, Sales, Customer support, Catalog manager, Analyst, Custom role. Fields name/email/role/status/last active/assigned conversations/permissions. Invite/edit/suspend/reactivate/remove/resend/activity. Invite name/email/role/message. Permissions: Inbox, Customers, Campaigns, Products, Orders, Analytics, Integrations, Team, Billing, Settings. Backend enforcement.

Business Profile: logo/cover/name/username/description/category/location/contact/hours/delivery/COD/return/social/verification; customer preview, local save, sync state.

Plans: Free Trial (limited setup, basic catalog/inbox/campaigns); Business (more campaigns, segments, team, analytics, orders); Business Pro (higher fair-use, advanced analytics, automations, ERP/POS, more team); Enterprise (custom reach/integrations/API, priority support/onboarding). Predictable monthly subscriptions, not primary per-message charging; fair-use usage/warnings/upgrades; prototype prices not final.

Billing: plan, renewal, broadcast/team/integration usage, history, upgrade/change/cancel, invoice request. Backend-authoritative.

Settings: General, Notifications, Inbox, Campaign rules, Privacy, Security, Languages, Export, Blocked customers, Danger zone. Save/reset/export/deactivate/delete. Destructive operations need confirmation; deletion typed and backend-acknowledged.

## 6. Platform Administration

Separate protected experience:

- **Dashboard:** users/businesses/verified/pending, campaigns, messages, reports, suspensions, platform/infrastructure usage.
- **Verification:** business/owner/category/city/documents/date/risk/status; open/approve/request info/reject/suspend/note. Reject/suspend needs confirmation/reason/acknowledgement/audit.
- **Moderation:** reported businesses/updates/products/conversations, Spam signals, blocked accounts; dismiss/warn/remove/restrict/suspend/ban. Permission and audit required.
- **Users:** search/filter/view/reports/suspend/restore/delete; permanent delete needs strict confirmation/backend.
- **Businesses:** search and verification/category/location filters; view business/usage/violations; restrict/suspend/restore.
- **Plans/Fair Use:** plan names, campaign allowance/reach, team/integration allowances, warning thresholds, temporary restrictions; backend permission/persistence.

## 7. Shared capabilities

### Notifications

Types: message, follower, campaign completed/warning, order request/status, low stock, integration error, verification, invitation, billing reminder, sync failure, app update. Open/read/unread/all-read/delete/filter/empty. Local read mutations may queue; push needs backend/browser permission.

### Global search

Business: customers, conversations, campaigns, products, orders, team. Customer: businesses, products, updates, conversations, orders. Keyboard shortcut, history/clear, empty/recent/grouped results, correct navigation. Small history in localStorage; structured data in IndexedDB; server-wide search needs backend.

### Dialogs and drawers

Reusable delete/archive/unfollow/cancel or reject order/assign team/tags/segment/schedule-send-test campaign/upgrade/connect-disconnect/invite/block customer or business/report/logout/Reset Demo Data flows. Open correctly; Cancel/close/Escape; trap/restore focus; validate; prevent duplicates; show success/failure; update state; strengthen destructive confirmation.

### Component states

Default, Hover, Focus, Selected, Disabled, Loading, Empty, Error, Success, Unread, Archived, Blocked, Offline, Pending synchronization, Synchronization failed, Conflict, Permission denied.

## 8. Demo data

Karachi examples may use Studio One—Fashion, Nori Bakehouse—Food, Mysa Living—Home, Glow Theory—Beauty, Tech Junction—Electronics, Urban Auto Care—Automotive; Ayesha Malik, Hamza Usman, Noor Sheikh, Zoya Khan, Bilal Ahmed, Sara Ali, Danish Khan, Hira Ahmed; DHA, Clifton, Gulshan-e-Iqbal, North Nazimabad, Tariq Road, PECHS, Saddar, Korangi; Rs 2,499, Rs 3,650, Rs 4,290, Rs 12,500. Demo and production data remain isolated.

## 9. Privacy, consent, anti-spam

Phone numbers are not exposed by following; contact is permission-based. Customers explicitly follow, choose preferences, easily unsubscribe/mute/block/report. Campaigns apply frequency protection, fair-use warnings, verification, moderation, suppression, consent history, export/deletion, scope isolation, shared-device safety. Never build unrestricted anonymous bulk messaging. Blocked, unsubscribed, or suppressed customers receive no marketing; suppression overrides consent/follow/segment/queued delivery. Backend enforcement is authoritative.

## 10. Offline-first requirements

After initial load, cached routes/data work where possible. Offline: product/campaign/message drafts, queued outbound-message/order intents, locally permitted settings, saved products/updates, preferences, cached notifications, supported mutations.

IndexedDB: scoped accounts/workspaces, cached profiles/businesses/products, saved products, updates/saved updates, conversations, message drafts/pending messages, order drafts/requests, campaign drafts, notifications, queue/sync metadata, temporary-file metadata. localStorage only theme, language, last safe preference, dismissed guidance, appropriate search history.

Every local entity uses UUID. Queue fields: mutation/idempotency ID, account/workspace, entity type/ID, operation/payload, created/updated, retry/next retry, dependencies, current status, safe failure details. Product statuses map to Pending, Processing, Blocked, Failed, Conflict, Completed/acknowledged without calling local completion server completion.

Sync requires exponential backoff/limits, dependencies, scope isolation, atomic acknowledgements, idempotency, conflicts, full resync, tombstones, migrations, multi-tab coordination, permission revocation, quota handling. `OFFLINE_SYNC.md` defines the protocol.

## 11. Backend-required and excluded

Backend-required: production auth/OTP, multi-device identity, realtime/message delivery/read receipts, broadcasts, campaign scheduling/delivery, push, shared orders/acceptance, team collaboration/permissions, verification, moderation, billing/payments, imports/exports, shared analytics, ERP/POS/e-commerce, secure files/credentials, audit, cross-device sync. Frontend only prepares, validates, persists, queues, and reports honest status.

Initial exclusions: voice/video, personal status stories/groups, real payments/SMS/OTP/logistics, production backend/ERP credentials/file storage/WebSockets.

## 12. Architecture, quality, and testing

Feature layers: bootstrap/routing, domain, services, repository contracts, IndexedDB/future HTTP, sync, shared UI, isolated role features. Pages never query IndexedDB/HTTP; UI has no backend simulation; rules live in domain/services; typed replaceable contracts; auth abstraction; frontend role UX only; no circular feature dependencies.

Use strict TypeScript; justify unavoidable `any`; reuse components; keep logic outside UI; avoid duplication/unnecessary dependencies; clear naming; semantic HTML/labels/keyboard/focus/reduced motion/touch targets; visible errors; no console warnings/errors; tests and docs with features.

Vitest, React Testing Library, Playwright cover repositories, IndexedDB/migrations/queue/retry/isolation/offline, roles/guards/permissions/privacy/follow/unsubscribe/block/suppression, forms/dialog keyboard, product/campaign/order/message drafts, conflicts/multi-tab/service-worker upgrades/nested refresh/PWA offline/accessibility/critical journeys. Every phase passes lint, typecheck, unit tests, build, relevant E2E, diff validation.

## 13. Required journeys

- **Customer:** open → onboard → discover Studio One → profile → follow/preferences → update → product → size/color → request → honest status → order → linked conversation when available → send/queue.
- **Business:** workspace → setup → dashboard → order request → customer → reply/queue → backend confirm → status → product → segment → new-arrival campaign/products/audience → schedule/send request → analytics → integrations → SparkPair ERP when supported.
- **Admin:** workspace → verification queue/review → approve/request info → report/moderation → fair-use → users/businesses → permitted suspend/restore.

## 14. Product success

Businesses reach customers without unpredictable per-message prices, organize communication, manage products/inquiries, turn updates into orders, understand engagement, connect systems, reduce scattered tools, preserve consent/privacy. Customers discover relevant businesses, get useful separated updates without spam, browse, communicate, control preferences, protect contact details.

## 15. Unresolved decisions

- Providers/contracts for OTP, messaging, push, payment, logistics, storage, realtime, analytics, integrations.
- Prices, fair-use quotas/warnings/restrictions, trial duration, entitlements, taxes/refunds/invoices.
- Exact business/custom/admin permission matrix.
- Verification security/retention/risk/reviewer/legal rules.
- Consent wording/version, lawful bases, retention/deletion/export SLAs, shared-device purge, applicable law.
- Search/recommendation/trending/rating/open-now algorithms and review moderation.
- Location precision/fallback/maps, delivery areas, international addresses.
- Media limits/compression, inventory reservation, variants, tax/shipping/returns/COD, authoritative order transitions.
- Campaign channels, frequency/quiet hours/timezones/test send/attribution/analytics definitions.
- Chat retention/attachments/local deletion/read/typing/encryption.
- Urdu/Roman Urdu translation/fallback/formatting and final accessibility target.
- Import formats/deduplication/consent proof; export formats; audit retention.
- Sync API/version/idempotency/conflict/checkpoint/tombstone policies and maximum offline window.

## 16. Delivery

Use the 17 controlled phases in `DEVELOPMENT_PLAN.md`. Each reads docs/code, scopes one phase, tests, verifies, reports limitations, and commits separately only after approval.
