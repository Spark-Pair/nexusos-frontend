# Broadcast workspace repair

## Cause

BroadcastPage used shared Button components without type="submit" for list creation and publishing.
The shared Button intentionally defaults to type="button", so clicks never submitted either form.
The fix uses explicit submit buttons and retains the existing authenticated APIs.

## Updated workflow

- Desktop business navigation and mobile Lists / Compose / History tabs.
- Searchable list rows with separate use, edit and delete actions.
- Focused member editor, search, select all shown, selected count and sticky save/cancel actions.
- Empty lists can be created as supported by the API; publishing requires members.
- Separate composition workspace with audience selection, text/image editing, preview and clear actions.
- Mobile audience selection precedes message composition; desktop uses a side panel.
- Draft and publish state persists when switching views. Pending clicks are guarded, failures retain input,
  image preview URLs are released, and failed draft cleanup cannot report a successful publish as failed.
- Independent API failures no longer prevent the rest of the workspace from loading.
- List deletion explicitly explains the existing PostgreSQL cascade into published broadcasts.
- Shared controls use 12px corners and surfaces 16px, per the updated user preference.

## Changed source

BroadcastPage.tsx, BroadcastListEditor.tsx, BroadcastComposer.tsx and broadcastApi.ts under
src/features/broadcasts; reusable WorkspaceShell.tsx; shared CSS tokens and workspace styles.
No backend implementation or schema change was needed for the submit-button defect.

## Verification

Coverage includes actual create/edit/publish button clicks, mocked API persistence across reload,
empty lists, failed/offline retries, isolated history failures, duplicate-submit prevention,
confirmed deletion, customer-role denial, and 360/768/1440px screenshots in light/dark modes.
Backend tests separately exercise real Express handlers against the memory repository.
Browser tests use intercepted API fixtures; production PostgreSQL was not mutated or independently
verified during this repair.
