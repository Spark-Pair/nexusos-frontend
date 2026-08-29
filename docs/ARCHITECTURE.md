# Frontend Architecture

## Goals

The architecture supports a production-quality, mobile-first offline PWA today and a Laravel REST API later without rewriting UI features. Dependencies point inward: UI depends on application contracts, never on Dexie or HTTP details.

## Application layers

1. **Presentation:** routes, layouts, pages, view components, form adapters, and accessible design-system components.
2. **Application:** use cases/services, query definitions, commands, validation orchestration, permissions, and view-facing result types.
3. **Domain:** entities, value objects, lifecycle rules, repository interfaces, domain errors, and pure policies.
4. **Infrastructure:** Dexie repositories, future HTTP repositories, authentication adapters, sync engine, logging adapters, and environment configuration.

Composition happens at an application bootstrap boundary. Features receive repositories and services through typed factories or context; they do not instantiate infrastructure dependencies.

## Feature modules

Use a feature-first structure with restricted public entry points:

```text
src/
  app/                 # bootstrap, providers, router, role shells
  shared/              # UI primitives and truly cross-feature utilities
  domain/              # cross-feature domain contracts and identifiers
  infrastructure/      # db, repositories, HTTP, auth, sync, logging
  features/
    public/
    authentication/
    customer-onboarding/
    discovery/
    following/
    business-updates/
    catalog/
    orders/
    chats/
    business-onboarding/
    inbox/
    customers/
    segments/
    campaigns/
    analytics/
    integrations/
    team/
    billing/
    settings/
    notifications/
    global-search/
    platform-admin/
```

Each feature may contain `components`, `pages`, `application`, `domain`, `queries`, and `tests` as needed. Import through feature public APIs; avoid feature-to-feature internals and oversized global folders.

Customer, Business, and Platform Admin features may share domain contracts and UI primitives but never import one another's pages, navigation, or authorization-context internals. Public/authentication routes form a fourth boundary. Canonical route ownership is defined in `ROUTE_MAP.md`.

## Repository pattern

Domain/application code defines narrow typed interfaces such as `OrderRepository`, not a generic CRUD repository. Methods express use cases and accept explicit context. Results expose domain data and version/sync metadata where needed.

Two infrastructure families implement the same contracts:

- **Local repositories:** Dexie transactions against IndexedDB, used in frontend-only and offline paths.
- **HTTP repositories:** future REST clients that validate wire data, translate DTOs, map errors, and update the local store as the client-side source of truth.

A sync-aware facade coordinates local writes and queuing. Pages never select local versus HTTP implementations.

Local repositories are not a simulated server. They persist drafts, cached records, and queued intents, but cannot mint authoritative identities/roles, confirm external delivery/payment, enforce global uniqueness, or finalize server-governed transitions. Results expose provenance (`local | server`), freshness, and acknowledgement state.

## Service layer

Application services coordinate validation, authorization hints, domain rules, repository calls, and queue creation. They remain UI-framework independent. Pure domain policies hold lifecycle transitions and calculations. External side effects live behind capability interfaces.

## State ownership

### Zustand

Use Zustand only for small client-owned session/UI state shared across distant components: active role/workspace context, navigation state, ephemeral filters when URL state is inappropriate, and non-sensitive preferences. Keep server/domain collections out of broad stores. Persist only an explicit safe subset.

### TanStack Query

Use TanStack Query for asynchronous repository-backed reads and mutations, cache invalidation, retry coordination, and UI status. Query keys are centralized, typed, and scoped by actor/workspace. IndexedDB remains durable storage; the query cache is not the offline database. Persisting the query cache is optional and must not duplicate or conflict with repository policy.

### Forms

React Hook Form manages form interaction. Zod schemas validate user input and infrastructure DTOs at boundaries. Domain rules remain in domain/application code rather than being hidden only in form schemas.

## Authentication abstraction

Define an `AuthGateway` for session restoration, sign-in challenge, verification, sign-out, token refresh, and identity observation. An offline development adapter must state that it is simulated. The future HTTP adapter owns secure session mechanics; do not store long-lived secrets in localStorage or IndexedDB.

Route guards wait for session restoration, handle unauthenticated and unauthorized states distinctly, and preserve safe return locations.

## Roles and permissions

Separate platform roles from business membership roles and customer identity. Resolve permissions from typed grants for the active context. Pages and navigation use a central `can(action, resource, context)` policy. Repository/application methods also check expected permission for early UX feedback. The server will repeat and authoritatively enforce every check.

Durable records and query keys are partitioned by account and, where applicable, workspace. Context switches cancel in-flight work and prevent previous-scope data rendering. Membership removal requires a server signal and an approved local-cache cleanup policy.

Business roles begin with Owner, Admin, Manager, Marketing, Sales, Customer support, Catalog manager, Analyst, and Custom; the exact grant matrix remains unresolved. Permission areas are Inbox, Customers, Campaigns, Products, Orders, Analytics, Integrations, Team, Billing, and Settings. Platform grants are separate and never implied by a business role.

## Privacy and abuse-prevention boundaries

Define typed `ConsentRepository`, `SuppressionRepository`, `BlockRepository`, and `AbuseReportGateway` contracts. Local campaign previews evaluate known consent and suppression data, but only the backend authorizes recipient resolution and delivery. Suppression always wins over consent or segment inclusion.

Data minimization belongs in schemas and services, not just forms. Account fields, business CRM notes, consent evidence, and audit data remain separate aggregates with separate permissions and retention. Export, deletion, and report workflows require backend capabilities and appear unavailable—not locally completed—without them.

## Errors

Use a discriminated application error model: validation, unauthenticated, forbidden, not found, conflict, offline unavailable, rate limited, transient infrastructure, and unexpected. Translate infrastructure errors at adapters. Error boundaries handle render failures; route-level and field-level messages remain actionable. Never expose stack traces or secrets to users.

## Logging and observability

UI code may report semantic events through a logger interface but does not call vendor SDKs. Infrastructure logs request/sync timing and sanitized failure metadata. Never log OTPs, tokens, credentials, message bodies, or unnecessary personal data. Development logs are human-readable; production reporting is configurable and consent/privacy aware.

## Environment configuration

Read `import.meta.env` only in one configuration module. Validate public values at startup and expose a typed config object. Separate development, test, preview, and production modes. Client variables are public by definition; secrets belong on the future server. Keep `.env.example`, but ignore real `.env*` files except documented examples.

## PWA and caching

`vite-plugin-pwa` owns manifest and service-worker generation. Cache immutable build assets precache-first. Apply explicit runtime strategies only to safe public assets and API GETs. Never cache authentication responses or sensitive data in Cache Storage. Version service worker and IndexedDB migrations independently and provide a safe update experience.

Product/campaign image drafts use a dedicated quota-aware media repository, not entity rows or Cache Storage. It enforces approved type/size/compression limits, exposes quota failures, and never claims secure upload. Verification documents and integration credentials never use this browser media path.

## Notifications, search, and demo data

Shared notifications support actor-scoped local read state; push and event creation remain backend capabilities. Global search uses actor-specific indexes/result groups, never an unrestricted shared index. Small search history may use localStorage; searchable structured data stays in scoped IndexedDB repositories.

Karachi examples use a distinct development dataset namespace/source. Reset Demo Data affects only that namespace. Demo configuration must be unavailable in production and never mix with synchronized records.

## Testing strategy

- Unit tests: domain policies, validators, permission rules, transformations, retry calculations.
- Repository contract tests: run shared behavior suites against Dexie and later HTTP-backed implementations where applicable.
- Component tests: interaction, accessibility semantics, form states, permissions, and errors with repositories mocked at their interfaces.
- Integration tests: application services with fake/IndexedDB adapters, queue and migration behavior.
- Playwright: critical customer, business, admin, offline reload, reconnect, and update flows.
- Static gates: strict TypeScript, ESLint, formatting policy, dependency review, and production build.
- Privacy/security: scope isolation, denial paths, log redaction, cache exclusions, purge policy, consent revocation, suppression precedence, blocks, and export/deletion authorization.
- Offline/sync: reload durability, pull checkpoints, dependencies, duplicate acknowledgements, conflicts, tombstones, retries, leases, multi-tab contention, quota, corruption, migrations, and service-worker/schema compatibility.
- API contracts: validation, idempotency, versions, pagination, auth expiry, rate limits, partial failures, and authoritative status mapping against a contract-faithful server.
- Accessibility/performance: automated checks plus keyboard/screen-reader review and measured bundle, rendering, and poor-network budgets.

Tests must be deterministic, isolate databases/caches per test, and require no production credentials or real providers. Each phase records applicable, passing, and not-yet-applicable cases. Coverage percentage alone is not acceptance.

## Architectural decision control

Material changes to storage ownership, repository contracts, sync semantics, authentication, roles, or feature boundaries require a documented decision and updates to all affected docs before implementation.
