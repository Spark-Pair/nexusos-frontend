# NexusOS design foundation

The September 2026 brief establishes a compact desktop productivity interface. Review shared
components at /design-system; its sample data remains illustrative. Product pages use existing APIs.

## Tokens

Defined in src/shared/styles/index.css:

| Token          | Light   | Dark    |
| -------------- | ------- | ------- |
| Canvas         | #F8F9F8 | #121815 |
| Surface        | #FFFFFF | #1C2420 |
| Primary text   | #1C2420 | #F1F3F2 |
| Secondary text | #626E67 | #A6B1AA |
| Subtle border  | #E3E7E5 | #28312C |
| Control border | #CDD4D0 | #39443D |

The single accent is muted teal (#287663), with darker hover/pressed shades. Reserve it for
primary actions, selected navigation, unread indicators and focus. Avatars remain neutral.
Error/warning/success colors communicate actual states.

Existing blue-* and slate-* Tailwind utilities temporarily map to the teal and neutral palettes
so existing pages participate without rewriting behavior. Prefer semantic tokens in new work;
migrate legacy names with each feature phase.

## Typography, spacing and shape

Keep the existing Inter/system sans-serif stack without a remote dependency. Prefer 14px body
text, 12px metadata and approximately 20px page titles. Controls use medium weight; headings and
unread information use semibold. Spacing tokens are 4, 8, 12, 16, 20, 24 and 32px.
Controls use 12px corners and large surfaces 16px, following the updated user preference. Avatars, radios and switches may be circular.
Retain usable touch targets and visible keyboard focus.

## Interaction and reuse

Reuse Button, IconButton, Field, SearchField, Combobox, Avatar, DataTable, Dialog, Drawer, Tabs,
MessageComposer, MediaPicker, SchedulePicker and state panels. Borders precede shadows; only
overlays use subtle shadows. Avoid blur, gradients, bouncing, tilting and scaling controls.
Transitions take approximately 180-200ms and honor reduced motion.

Existing field validation behavior is retained. A later form pass should make actionable errors
persistently visible rather than relying solely on tooltips. Keep named icons, native semantics,
keyboard interaction, disabled states and dialog focus restoration.

## Phased rollout

Never invent counts, scheduling capability or delivery status. Server acknowledgements determine
outcomes. Preserve privacy, suppression and roles when broadcasts later move into direct messages.
See [the audit and plan](UI_REDESIGN_AUDIT.md) for remaining work. This foundation increment does
not represent a completed application redesign.
