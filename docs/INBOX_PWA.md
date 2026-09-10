# Unified inbox and offline PWA

The user approved the unified messaging/PWA increment, replacing the separate customer Updates
navigation. Keep the React/Express architecture and existing authentication/participant permissions.

Broadcasts are copied atomically into accepted recipient conversations at publish time. Membership
is a snapshot: adding members later does not reveal old broadcasts. Existing broadcasts are backfilled
once by an idempotent migration for currently eligible accepted members. Suppressed broadcasts are
hidden from inbox reads. Publishing triggers realtime refresh. No mock delivery statuses.

The app shell uses vite-plugin-pwa injectManifest with the existing push worker. Cache Storage holds
only build assets, never authenticated API responses or message images. Dexie stores actor-scoped
chat snapshots and text outbox records; tokens remain in sessionStorage. Logout/revocation purges
the actor cache. Offline restoration is a cached, non-authoritative session; reconnect revalidates it.
Text sends have client UUIDs and server idempotency. Offline messages say Queued, failed replay stays
visible with retry, and only a server acknowledgement removes the queue record. Offline media sends
and admin/business mutations require a connection. Cached content cannot learn server revocations
until reconnect. Session credentials are not persisted across browser sessions.

Use a shared toast provider for action success/failure, preserve failed composer text, keep press
feedback subtle, and expose only working actions. Desktop is navigation rail + chat list + conversation;
mobile shows one panel at a time. Modals hold secondary workflows. No calls or features without APIs.

Implementation references: [Vite PWA injectManifest](https://vite-pwa-org.netlify.app/guide/inject-manifest)
and [Dexie transactions](<https://dexie.org/docs/Dexie/Dexie.transaction()>).

## Running the unified inbox

Run `npm run db:migrate` in `backend` before starting the updated API. For the installable/offline
frontend, use `npm run build` and `npm run preview` (or an HTTPS deployment). Development mode does
not install a service worker. Install from your browser menu; on iOS use Share > Add to Home Screen.

Open chats online once to save them on this device. Offline reads keep up to 200 messages per saved
chat, up to 51 recent snapshots, and a 500-conversation list, with a seven-day cache lifetime. Unsent
text is retained separately until acknowledgement, explicit removal or sign-out. Reconnect confirms
the session before replay. A periodic check also handles browsers that miss the online event after
an offline reload. The app must be open for automatic replay; background send is not advertised.
Images and broadcast publishing require internet. Closing the browser session may require online
sign-in again because bearer tokens remain in sessionStorage.

## Verification

- Frontend unit tests cover queue persistence, replay IDs, denial, account isolation and composer errors.
- `e2e/inbox.spec.ts` uses API fixtures with the real production service worker for offline reload,
  reconnect, retries, reporting, logout cache removal and 360/768/1440px layout checks.
- `backend/scripts/check-inbox-postgres.ts` creates and cleans up its own temporary PostgreSQL schema.
  It verifies repeat migrations, recipient snapshots, consent, reads, moderation suppression and
  concurrent idempotent sends. Run with `npx tsx scripts/check-inbox-postgres.ts` in backend.
- Existing history cannot reconstruct old list membership; its one-time backfill uses eligible members
  at migration time. New broadcasts keep the exact recipient snapshot from publish time.
