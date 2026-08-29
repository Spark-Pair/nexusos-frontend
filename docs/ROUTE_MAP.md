# NexusOS Route Map

## Conventions

- Canonical URLs use lowercase kebab-case and stable resource IDs.
- Public routes have no actor prefix. Customer routes use `/app`, business routes use `/business/:businessId`, and platform routes use `/admin`.
- Wizard step names are child routes so refresh, history, validation, and analytics remain explicit.
- Route availability does not imply backend capability. Guards, authoritative permissions, and backend dependencies are defined in `FEATURE_MATRIX.md`.
- Dialogs/drawers normally use URL-backed search parameters or nested modal routes only when deep-linking is valuable; they do not create duplicate pages.

## Public and authentication

| Route             | Purpose                    |
| ----------------- | -------------------------- |
| `/`               | Welcome                    |
| `/product`        | Product introduction       |
| `/for-businesses` | Business introduction      |
| `/for-customers`  | Customer introduction      |
| `/pricing`        | Pricing placeholder        |
| `/help`           | Help                       |
| `/privacy`        | Privacy policy placeholder |
| `/terms`          | Terms placeholder          |
| `/contact`        | Contact placeholder        |
| `/sign-in`        | Sign in                    |
| `/create-account` | Create account             |
| `/auth/phone`     | Phone challenge            |
| `/auth/verify`    | OTP verification           |

## Customer

| Route                                         | Purpose                         |
| --------------------------------------------- | ------------------------------- |
| `/app/onboarding/welcome`                     | Welcome step                    |
| `/app/onboarding/phone`                       | Phone step                      |
| `/app/onboarding/verify`                      | OTP step                        |
| `/app/onboarding/profile`                     | Customer profile step           |
| `/app/onboarding/interests`                   | Interests step                  |
| `/app/onboarding/location`                    | Location step                   |
| `/app/onboarding/notifications`               | Notification-preference step    |
| `/app/discover`                               | Customer Discover               |
| `/app/discover/search`                        | Search results and filters      |
| `/app/businesses/:businessId`                 | Business profile                |
| `/app/businesses/:businessId/updates`         | Business Updates tab            |
| `/app/businesses/:businessId/products`        | Products tab                    |
| `/app/businesses/:businessId/about`           | About tab                       |
| `/app/businesses/:businessId/reviews`         | Reviews tab                     |
| `/app/businesses/:businessId/follow`          | Follow preference flow          |
| `/app/updates`                                | Separate Business Updates inbox |
| `/app/updates/:updateId`                      | Update detail                   |
| `/app/products/:productId`                    | Product detail                  |
| `/app/saved/products`                         | Saved products                  |
| `/app/saved/updates`                          | Saved updates                   |
| `/app/order-requests/new/:productId/options`  | Product options                 |
| `/app/order-requests/new/:productId/delivery` | Delivery details                |
| `/app/order-requests/new/:productId/payment`  | Payment preference              |
| `/app/order-requests/new/:productId/review`   | Request review/submission       |
| `/app/orders`                                 | Customer order tabs             |
| `/app/orders/:orderId`                        | Customer order detail           |
| `/app/chats`                                  | Customer conversation list      |
| `/app/chats/:conversationId`                  | Customer conversation           |
| `/app/profile`                                | Profile overview                |
| `/app/profile/personal-information`           | Personal information            |
| `/app/profile/following`                      | Followed businesses             |
| `/app/profile/notifications`                  | Notification preferences        |
| `/app/profile/addresses`                      | Addresses                       |
| `/app/profile/language`                       | English/Urdu/Roman Urdu         |
| `/app/profile/privacy`                        | Privacy/contact controls        |
| `/app/profile/blocked-businesses`             | Block list                      |
| `/app/profile/help`                           | Customer help/support           |
| `/app/notifications`                          | Customer notifications          |
| `/app/search`                                 | Customer global search          |

## Business Workspace

All routes require an active business context; frontend guards are UX-only and backend permissions remain authoritative.

| Route                                                   | Purpose                                  |
| ------------------------------------------------------- | ---------------------------------------- |
| `/business/select`                                      | Select a business workspace              |
| `/business/setup/basics`                                | Business basics                          |
| `/business/setup/category`                              | Category                                 |
| `/business/setup/location`                              | Location                                 |
| `/business/setup/timings`                               | Timings                                  |
| `/business/setup/branding`                              | Logo and cover                           |
| `/business/setup/contact`                               | Contact information                      |
| `/business/setup/delivery`                              | Delivery and COD                         |
| `/business/setup/team`                                  | Team setup                               |
| `/business/setup/customer-import`                       | Customer-import request                  |
| `/business/setup/integration`                           | Existing-system connection draft         |
| `/business/setup/review`                                | Review and verification submission       |
| `/business/:businessId/overview`                        | Dashboard                                |
| `/business/:businessId/verification`                    | Verification status/documents            |
| `/business/:businessId/inbox`                           | Shared Inbox                             |
| `/business/:businessId/inbox/:conversationId`           | Shared conversation and customer context |
| `/business/:businessId/customers`                       | Customer table                           |
| `/business/:businessId/customers/:customerId`           | Customer detail/history                  |
| `/business/:businessId/segments`                        | Segment list                             |
| `/business/:businessId/segments/new`                    | Create segment                           |
| `/business/:businessId/segments/:segmentId`             | Segment detail/edit/preview              |
| `/business/:businessId/campaigns`                       | Campaign list                            |
| `/business/:businessId/campaigns/new/type`              | Campaign type                            |
| `/business/:businessId/campaigns/new/details`           | Campaign details                         |
| `/business/:businessId/campaigns/new/content`           | Campaign products/media                  |
| `/business/:businessId/campaigns/new/audience`          | Campaign audience                        |
| `/business/:businessId/campaigns/new/delivery`          | Delivery request                         |
| `/business/:businessId/campaigns/new/review`            | Campaign review                          |
| `/business/:businessId/campaigns/:campaignId`           | Campaign detail                          |
| `/business/:businessId/campaigns/:campaignId/analytics` | Campaign analytics                       |
| `/business/:businessId/updates`                         | Business Update management               |
| `/business/:businessId/updates/new`                     | Create update draft                      |
| `/business/:businessId/updates/:updateId`               | Update edit/preview                      |
| `/business/:businessId/products`                        | Catalog table/grid                       |
| `/business/:businessId/products/new`                    | Add product                              |
| `/business/:businessId/products/:productId`             | Product edit/preview                     |
| `/business/:businessId/orders`                          | Business order queues                    |
| `/business/:businessId/orders/:orderId`                 | Business order detail                    |
| `/business/:businessId/analytics`                       | Business analytics                       |
| `/business/:businessId/integrations`                    | Integration catalog                      |
| `/business/:businessId/integrations/:providerKey`       | Integration status/setup                 |
| `/business/:businessId/team`                            | Team list                                |
| `/business/:businessId/team/invite`                     | Invitation request                       |
| `/business/:businessId/team/:membershipId`              | Membership/permissions                   |
| `/business/:businessId/profile`                         | Editable Business Profile                |
| `/business/:businessId/billing`                         | Billing and Usage                        |
| `/business/:businessId/settings`                        | Settings overview                        |
| `/business/:businessId/settings/general`                | General                                  |
| `/business/:businessId/settings/notifications`          | Notifications                            |
| `/business/:businessId/settings/inbox`                  | Inbox                                    |
| `/business/:businessId/settings/campaigns`              | Campaign rules                           |
| `/business/:businessId/settings/privacy`                | Privacy                                  |
| `/business/:businessId/settings/security`               | Security                                 |
| `/business/:businessId/settings/languages`              | Languages                                |
| `/business/:businessId/settings/export`                 | Export request                           |
| `/business/:businessId/settings/blocked-customers`      | Blocked customers                        |
| `/business/:businessId/settings/danger-zone`            | Deactivate/delete requests               |
| `/business/:businessId/notifications`                   | Business notifications                   |
| `/business/:businessId/search`                          | Business global search                   |

## Platform Administration

| Route                                 | Purpose                                 |
| ------------------------------------- | --------------------------------------- |
| `/admin`                              | Admin Dashboard                         |
| `/admin/verifications`                | Verification queue                      |
| `/admin/verifications/:businessId`    | Business verification review            |
| `/admin/moderation`                   | Moderation queues                       |
| `/admin/moderation/reports/:reportId` | Report review                           |
| `/admin/users`                        | User administration                     |
| `/admin/users/:userId`                | User detail/reports                     |
| `/admin/businesses`                   | Business administration                 |
| `/admin/businesses/:businessId`       | Business usage/violations               |
| `/admin/plans`                        | Plans and Fair Use                      |
| `/admin/plans/:planId`                | Plan allowances/restrictions            |
| `/admin/notifications`                | Admin notifications                     |
| `/admin/search`                       | Admin search, limited to approved scope |

## Route-level behavior

All protected routes define restoring/loading, unauthenticated, forbidden, offline/stale, error, and success states. Customer, Business, and Admin layouts never share navigation. Nested route refreshes must resolve on Vercel and through the warmed PWA shell. Return URLs are restricted to same-origin known routes.
