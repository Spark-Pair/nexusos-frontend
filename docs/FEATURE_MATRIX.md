# NexusOS Feature Matrix

## Legend

- Offline: **Yes** means local/cached behavior after initial load; **Draft/queue** means intent only; **Cached** is read-only stale data; **No** needs current backend/provider.
- Backend: **Required** means the feature cannot be presented as authoritative/complete without it; **Partial** means local behavior exists but shared/current results require it.
- Routes are canonical references from `ROUTE_MAP.md`.

## Public, customer, and shared

| Feature                                     | Role              | Route                                                                            |       Phase | Offline                    | Backend                                          |
| ------------------------------------------- | ----------------- | -------------------------------------------------------------------------------- | ----------: | -------------------------- | ------------------------------------------------ |
| Marketing/legal/help placeholders           | Public            | `/`, `/product`, `/for-*`, `/pricing`, `/help`, `/privacy`, `/terms`, `/contact` |           2 | Cached                     | No                                               |
| Sign in/create account/OTP                  | Public            | `/sign-in`, `/create-account`, `/auth/*`                                         |     2–3, 17 | Dev simulation only        | Required                                         |
| Seven-step onboarding                       | Customer          | `/app/onboarding/*`                                                              |           3 | Draft                      | Partial                                          |
| Discover/recommend/trending/new             | Customer          | `/app/discover`                                                                  |           4 | Cached                     | Required for current/shared results              |
| Nearby discovery                            | Customer          | `/app/discover`                                                                  |           4 | No                         | Required + location permission                   |
| Search/filter businesses/products/locations | Customer          | `/app/discover/search`                                                           |           4 | Cached subset              | Required server-wide                             |
| Business profile and tabs/reviews           | Customer          | `/app/businesses/:businessId/*`                                                  |         4–5 | Cached                     | Partial; ratings/reviews/current counts required |
| Follow/preferences/unfollow                 | Customer          | `/app/businesses/:businessId/follow`                                             |           4 | Draft/queue + optimistic   | Required acknowledgement                         |
| Separate Business Updates inbox             | Customer          | `/app/updates`                                                                   |           5 | Cached/read preferences    | Required broadcasts/current feed                 |
| Read/save/hide/mute/report updates          | Customer          | `/app/updates/:updateId`                                                         |           5 | Local or queue by action   | Reports/enforcement required                     |
| Product details/save/share/inquiry          | Customer          | `/app/products/:productId`                                                       |           5 | Cached/save local          | Inquiry/dynamic availability required            |
| Four-step order request                     | Customer          | `/app/order-requests/new/:productId/*`                                           |           6 | Draft/queue                | Required submit/accept/order number              |
| Customer orders/cancel/reorder/report       | Customer          | `/app/orders/*`                                                                  |           6 | Cached + queued intents    | Required authoritative lifecycle                 |
| Customer chat/drafts/attachments            | Customer          | `/app/chats/*`                                                                   |           7 | Draft/queue                | Required delivery/read/realtime                  |
| Customer profile/addresses/language/privacy | Customer          | `/app/profile/*`                                                                 |    3, 7, 13 | Local permitted edits      | Partial                                          |
| Saved products and updates                  | Customer          | `/app/saved/*`                                                                   |           5 | Yes                        | Partial cross-device                             |
| Block/unsubscribe/suppression               | Customer/shared   | profile, update, business, chat routes                                           | 4–7, 10, 17 | Queue/local UX             | Required enforcement                             |
| Shared notifications                        | All authenticated | role-specific `/notifications`                                                   |    2 onward | Cached + queued read state | Required push/current events                     |
| Global search/history                       | Customer/Business | role-specific `/search`                                                          |     5, 9–13 | Local IndexedDB subset     | Required server-wide                             |
| Accessible reusable dialogs/drawers         | All               | Contextual                                                                       |    2 onward | Yes for local actions      | Depends on action                                |
| All required component states               | All               | All feature routes                                                               | Every phase | Yes                        | Authoritative success as applicable              |

## Business

| Feature                               | Role              | Route                                           |      Phase | Offline                        | Backend                                         |
| ------------------------------------- | ----------------- | ----------------------------------------------- | ---------: | ------------------------------ | ----------------------------------------------- |
| Eleven-step Business Setup            | Business          | `/business/setup/*`                             |          8 | Draft                          | Required creation/import/integration/submission |
| Verification documents/status         | Business          | `/business/:businessId/verification`            |          8 | Metadata draft/cached          | Required secure files/review                    |
| Overview metrics/actions/date filters | Business          | `/business/:businessId/overview`                |          8 | Cached                         | Required shared/current analytics               |
| Shared Inbox/filter/context/actions   | Business          | `/business/:businessId/inbox/*`                 |          9 | Cached + notes/message intents | Required collaboration/delivery/permissions     |
| Customer table/filter/bulk actions    | Business          | `/business/:businessId/customers`               |          9 | Cached + permitted drafts      | Required shared data/export/assign              |
| Customer detail/history/privacy       | Business          | `/business/:businessId/customers/:customerId`   |          9 | Cached within scope            | Required permission/current data                |
| Segment rules/examples/AND-OR         | Business          | `/business/:businessId/segments/*`              |         10 | Draft/preview                  | Required final membership                       |
| Campaign list/lifecycle/actions       | Business          | `/business/:businessId/campaigns/*`             |         10 | Draft/cached                   | Required schedule/send/pause/cancel             |
| Six-step campaign creation            | Business          | `/business/:businessId/campaigns/new/*`         |         10 | Draft/queue                    | Required test/send/schedule/audience            |
| Frequency/fair-use/suppression        | Business/platform | campaign routes                                 | 10, 14, 17 | Local warning only             | Required enforcement                            |
| Campaign analytics/export             | Business          | `/business/:businessId/campaigns/:id/analytics` |         10 | Cached                         | Required computation/export                     |
| Business Update management            | Business          | `/business/:businessId/updates/*`               |         11 | Draft/queue                    | Required publish/schedule/pin shared state      |
| Product catalog/table/grid/bulk       | Business          | `/business/:businessId/products`                |         11 | Cached + drafts                | Partial                                         |
| Product form/validation/media/quota   | Business          | `/business/:businessId/products/*`              |         11 | Draft within quota             | Required publish/files/current inventory        |
| Business order queues/actions         | Business          | `/business/:businessId/orders`                  |         11 | Cached + queue                 | Required canonical status/assignment            |
| Order details/timeline/tracking/ERP   | Business          | `/business/:businessId/orders/:id`              |      11–12 | Cached + intent                | Required shared state/ERP                       |
| Business analytics and filters        | Business          | `/business/:businessId/analytics`               |         12 | Cached                         | Required computation                            |
| Integration catalog/setup/status/logs | Business          | `/business/:businessId/integrations/*`          |         12 | Connection draft only          | Required secure credentials/sync                |
| Team roles/invitations/permissions    | Business          | `/business/:businessId/team/*`                  |         13 | UI/draft only                  | Required                                        |
| Editable Business Profile             | Business          | `/business/:businessId/profile`                 |      8, 13 | Local changes/queue            | Required publish/verification                   |
| Plans, billing, usage, invoices       | Business          | `/business/:businessId/billing`                 |         13 | Cached                         | Required                                        |
| Settings/export/deactivate/delete     | Business          | `/business/:businessId/settings/*`              |         13 | Permitted local settings       | Required export/destructive/security            |

## Platform Administration

| Feature                             | Role           | Route                    | Phase | Offline                  | Backend                         |
| ----------------------------------- | -------------- | ------------------------ | ----: | ------------------------ | ------------------------------- |
| Admin Dashboard                     | Platform Admin | `/admin`                 |    14 | Cached at most           | Required                        |
| Verification queue/review/actions   | Platform Admin | `/admin/verifications/*` |    14 | Cached view only         | Required permission/audit/files |
| Moderation/report/spam actions      | Platform Admin | `/admin/moderation/*`    |    14 | Cached view only         | Required permission/audit       |
| User administration                 | Platform Admin | `/admin/users/*`         |    14 | No authoritative actions | Required                        |
| Business administration/restriction | Platform Admin | `/admin/businesses/*`    |    14 | No authoritative actions | Required                        |
| Plans/Fair Use administration       | Platform Admin | `/admin/plans/*`         |    14 | No authoritative actions | Required                        |

## Foundations, privacy, and delivery

| Feature                                     | Role              | Route                          |        Phase | Offline                     | Backend                     |
| ------------------------------------------- | ----------------- | ------------------------------ | -----------: | --------------------------- | --------------------------- |
| PWA shell/install/update/nested refresh     | All               | All                            |        1, 16 | Yes after warm load         | No                          |
| IndexedDB scoped cache/drafts/temp metadata | All               | N/A                            |     1 onward | Yes                         | No locally                  |
| Persistent UUID mutation queue              | All               | N/A                            |        1, 15 | Yes                         | Required to acknowledge     |
| Retry/dependencies/idempotency/conflicts    | All               | N/A                            |       15, 17 | Local coordination          | Required end-to-end         |
| Pull/checkpoints/tombstones/full resync     | All               | N/A                            |       15, 17 | Cached until reconnect      | Required                    |
| Account/workspace isolation and revocation  | All               | All protected                  | 1, 2, 15, 17 | Local partitioning          | Required authority          |
| Consent history/contact permission          | Customer/Business | profile/follow/customer routes | 4, 9, 10, 17 | Cached/queued               | Required enforcement        |
| Export/deletion/shared-device safety        | All               | profile/settings/admin routes  |        13–17 | No authoritative completion | Required                    |
| Demo data isolation/Karachi examples        | Development       | N/A                            |    Per phase | Yes                         | No                          |
| Repository/API contract and migration tests | Engineering       | N/A                            |  Every phase | N/A                         | Contract server in Phase 17 |
| Required customer journey                   | Customer          | Customer routes                |      3–7, 17 | Partial                     | Required end-to-end         |
| Required business journey                   | Business          | Business routes                |     8–13, 17 | Partial                     | Required end-to-end         |
| Required admin journey                      | Platform Admin    | Admin routes                   |       14, 17 | No authoritative actions    | Required                    |

## Explicitly excluded from initial phases

Voice/video calls, personal status stories, personal social groups, real payments, real SMS/OTP, real logistics, production backend, production ERP credentials, production file storage, and production WebSocket infrastructure have no implementation routes in the initial frontend phases.
