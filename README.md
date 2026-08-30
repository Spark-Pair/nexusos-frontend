# NexusOS

**Everything around your business, connected.**

NexusOS is a SparkPair product: a mobile-first Business Connection Operating System initially designed for Karachi, Pakistan, with a path to broader Pakistani and international markets.

The repository contains the Phase 1 production foundation and Phase 2 application-shell foundation. Product routes intentionally render practical placeholders until their approved feature phases.

## Intended stack

- React, Vite, and strict TypeScript
- Tailwind CSS and React Router
- Zustand and TanStack Query
- React Hook Form and Zod
- Dexie-backed IndexedDB storage
- `vite-plugin-pwa`
- Vitest, React Testing Library, and Playwright
- Vercel frontend deployment
- Future Laravel REST API

## Product surfaces

NexusOS will keep three experiences separated:

- Customer: discover and follow businesses, view updates and products, submit order requests, and manage conversations.
- Business: establish a presence, manage customers and a shared inbox, publish products and updates, handle orders, run segments and campaigns, and access operational settings.
- Platform Admin: operate and govern the platform without sharing customer or business navigation and permissions.

These are planning boundaries, not yet implemented functionality. Real OTP, external messaging, payments, campaign delivery, ERP connections, and credentials are explicitly out of scope until backend integrations are approved.

## Documentation

- [Product specification](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Development plan](docs/DEVELOPMENT_PLAN.md)
- [Data models](docs/DATA_MODELS.md)
- [Offline synchronization](docs/OFFLINE_SYNC.md)
- [Route map](docs/ROUTE_MAP.md)
- [Feature matrix](docs/FEATURE_MATRIX.md)

## Current status

Phase 1 provides strict tooling, typed configuration, global error handling, versioned IndexedDB, mutation-queue and PWA foundations. Phase 2 adds centralized routes, simulated development identities, role and permission guards, isolated Customer/Business/Admin shells, route search, scoped local notifications, and shell-level connectivity/sync/PWA status.

The next recommended step is Phase 3 in `docs/DEVELOPMENT_PLAN.md`: Customer onboarding.

## Requirements

- Node.js 22 or newer
- npm 11 or newer (npm is the repository package manager)

## Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

On macOS or Linux, replace the `copy` command with `cp .env.example .env.local`.

All `VITE_*` values are embedded in the browser bundle and must never contain secrets. Defaults allow local development without an environment file.

`VITE_ENABLE_DEMO_IDENTITY=true` explicitly enables the simulated identity switcher. It is intended only for development, review, or an isolated demo deployment and is disabled in a default production build.

## Commands

```bash
npm run dev        # Start the Vite development server
npm run build      # Type-check and create the production build in dist/
npm run preview    # Serve the production build locally
npm run lint       # Run ESLint and verify Prettier formatting
npm run typecheck  # Run strict TypeScript project checks
npm run test       # Run Vitest in watch mode
npm run test:run   # Run unit/component tests once
npm run test:e2e   # Build first, then run the Playwright smoke suite against preview
```

Install Playwright's Chromium browser once on a new development machine:

```bash
npx playwright install chromium
```

## Architecture foundation

- `src/app`: application bootstrap, providers, centralized routing, guards, and role shells
- `src/domain`: framework-independent contracts and sync mutation types
- `src/infrastructure`: typed environment, Dexie, repositories, service composition, logging, and future HTTP boundary
- `src/features`: Phase-scoped public, authentication, search, and notification foundations
- `src/shared`: accessible UI primitives, hooks, ephemeral state, and global styling
- `e2e`: Playwright smoke coverage, including nested-route refresh

Vercel uses `vercel.json` to rewrite client-side routes to `index.html`. The service worker precaches the application shell so warmed routes can reopen offline. IndexedDB remains the durable structured-data boundary; the TanStack Query cache is not used as a database.

## Product documentation status

The complete product specification is recorded in `docs/PRODUCT_SPEC.md`, with canonical routes and feature traceability in `docs/ROUTE_MAP.md` and `docs/FEATURE_MATRIX.md`. Genuinely unresolved provider, policy, legal, pricing, permission, and protocol decisions remain listed without invented answers.
