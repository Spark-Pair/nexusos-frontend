# NexusOS

**Everything around your business, connected.**

NexusOS is a SparkPair product: a mobile-first Business Connection Operating System initially designed for Karachi, Pakistan, with a path to broader Pakistani and international markets.

This repository is currently in its planning phase. It intentionally contains no React scaffold or installed dependencies yet.

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

## Current status

The next recommended step is Phase 1 in `docs/DEVELOPMENT_PLAN.md`: establish tooling and the production foundation, then verify linting, type-checking, tests, and a production build before adding product pages.

## Product-input notice

The initial brief referred to a complete product specification “supplied below,” but that detailed specification was not included. `docs/PRODUCT_SPEC.md` therefore distinguishes confirmed requirements from provisional assumptions and open decisions. Those decisions should be resolved before their implementation phase.

