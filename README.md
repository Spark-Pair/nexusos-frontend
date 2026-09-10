# NexusOS Design System

**Everything around your business, connected.**

This frontend includes the reusable NexusOS Design System, backend-connected authentication,
business discovery and following, connection invitations, and accepted two-way conversations.
Trusted administrators configured by the API can manage accounts at `/admin/users`.

The current `public/icons/nexusos.svg` asset is a generic NexusOS placeholder and must be replaced
after the final brand identity is approved.

## Included stack

- React and Vite
- Strict TypeScript
- Tailwind CSS
- Zod for centralized form validation
- Vitest and React Testing Library
- Playwright
- ESLint and Prettier

## Setup

Requirements: Node.js 22 or newer and npm 11 or newer.

```bash
npm install
npm run dev
```

The development server listens on the local network. On the current machine it is available from
another device at `http://192.168.100.7:5173`; Windows Firewall must allow Node.js/private-network
traffic. `/api` is proxied to the local Express server on port 4000.

Open `http://localhost:5173/` for sign in. The reusable component catalogue is available at
`http://localhost:5173/design-system`, and the authenticated Chats application is at
`http://localhost:5173/app/chats`.

Chats are loaded from the Express API and update live over authenticated Socket.IO connections,
with periodic refresh as a connectivity fallback. Businesses invite customers with an initial message;
customers can accept or reject before two-way messaging is enabled. Customer-started conversations
require following the business first.

## Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
npm run test
npm run test:run
npm run test:e2e
```

Install Playwright Chromium once on a new machine:

```bash
npx playwright install chromium
```

## Source structure

- `src/features/design-system`: the reusable component review page at `/design-system`
- `src/features/authentication`: backend-connected sign-in, account-type, phone, and OTP screens
- `src/features/chats`: business discovery, invitations, and conversations at `/app/chats`
- `src/shared/components`: reusable UI primitives and foundation states
- `src/shared/styles`: global tokens and interaction styling
- `src/shared/validation`: centralized Zod rules and casing normalization
- `docs`: retained NexusOS product and architecture planning documents

The documents describe future product direction only. Their planned product features are not
implemented in the current source tree.

## Documentation

- [Product specification](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Development plan](docs/DEVELOPMENT_PLAN.md)
- [Data models](docs/DATA_MODELS.md)
- [Offline synchronization](docs/OFFLINE_SYNC.md)
- [Route map](docs/ROUTE_MAP.md)
- [Feature matrix](docs/FEATURE_MATRIX.md)
- [Design system](docs/DESIGN_SYSTEM.md)

## Inbox and offline PWA

Broadcasts now appear inside customer conversations; the old Updates URL redirects to Chats.
See [Unified inbox and PWA](docs/INBOX_PWA.md) for cache limits, install instructions, reconnect
behavior and verification. Run the backend migration before using the updated inbox.
