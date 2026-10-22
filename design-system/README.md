Meridian is the interface of Team Ops, a request workspace for small operations teams: triage what comes in, give each request one owner, get sign-off where it is needed, and keep the history. It is a dark, dense, keyboard-first tool. Every screen answers one of six questions — what needs attention, who owns it, what is in progress, what is waiting for approval, what is blocked, what happened before. Design for someone working through a queue all day: quiet surfaces, one accent, status you can read without colour.

## Content fundamentals

- **Write in British English, sentence case.** "All requests", "Due this week", "Request changes", never Title Case. The app's locale is `en-GB`; dates read `31 Dec 2099`.
- **Address the person as "you"; say what they can do next.** "Your approval is needed". "Ready to start". "Waiting on Lena for approval". Use first names in sentences, full names in fields.
- **Short verbs on actions, one idea per button.** Accept, Decline, Start, Submit for approval, Approve, Request changes, Reopen, Comment. Never "OK" or "Submit".
- **Explain the rule in the empty or blocked state, in one sentence.** "Accept it with an owner, or decline it with a reason." "Every request has been accepted or declined." "Try removing a filter or searching for something else."
- **Prompts ask for what is useful.** Placeholders are questions or instructions: "What do you need, by when, and why?", "Be specific so it can be fixed in one pass", "What is it waiting on?".
- **Name requests by their key.** `OPS-1042`, set in `text-meta` with tabular numerals.
- **Shortcuts appear in tooltips and hints, not in labels.** "Back (Esc)", "Search (/)", "Next (J)"; in the composer, `Kbd` keys ⌘ ↵ then "to send".
- **No emoji, no exclamation marks, no marketing voice.** "Inbox zero" is the one light touch.

## Visual foundations

### Surfaces and lines

Surfaces step up one at a time: `color-rail` → `color-canvas` → `color-shell` → `color-panel` → `color-raised` → `color-selected`. Put the page on `color-canvas`; frame data in the **tray** (`color-shell`, `radius-tray`, 4px inset, status tabs along the top) with an inset panel (`color-panel`, `radius-panel`, `color-line` border) holding the table. Hover a row with `color-raised` at 60%; select it with `color-selected`.

Separate with 1px lines, never shadows: `color-line` by default, `color-line-soft` inside one panel, `color-line-strong` on floating layers and hovered controls. `color-line` and `color-line-strong` sit below 3:1 on every surface; that quietness is the source's choice. When a control's edge must carry meaning (an invalid field, a focused field), add the accent or danger ring rather than relying on the border.

Floating layers only — menus, pickers, the date picker, dialogs — use `color-overlay` with a `color-line-strong` border and `shadow-float`. Corners: 9px on popovers, `radius-tray` on dialogs. One floating layer at a time; opening one closes the last.

Tint a section toward a meaning without making it loud: background 5% of the status colour into `color-panel`, border 28% into `color-line` (`NextStep` with `emphasis` or `tone: "danger"`). Use it only for the next-step card and blocked notes.

### Colour

- One accent, `color-accent`, for focus, selection markers, checked boxes, charts and unread state. Its text form is `color-accent-fg`.
- The primary button is `color-fg` on `color-canvas` (near-white on dark), not blue. Use at most one primary per area.
- `color-danger` and `color-danger-fg` are reserved for blocked, urgent and overdue. Never use red for decoration or for Declined.
- Text: `color-fg` for content, `color-fg-2` for secondary, `color-fg-3` for metadata (4.7:1 on `color-selected`, more below). `color-fg-4` is decoration only and never text.
- Avatars pick one of eight muted tone pairs from the person's name; they are not tokens and carry no meaning.

### Status

Each status has exactly one colour and one glyph shape, and always shows its label. The shape alone tells the state: Triage `color-st-triage`, dashed ring; To do `color-st-todo`, ring; In progress `color-st-progress`, half; In review `color-st-review`, three-quarter; Done `color-st-done`, filled check; Declined `color-st-declined`, filled cross. Chips tint the status colour 14% into transparent with text 68% of it into white.

Blocked is a flag, not a status: a red marker beside the status (`Ban` icon and "Blocked" in `color-danger-fg` on 12% `color-danger`), never a chip in the title. Priority uses bar glyphs (one, two, three bars in `color-fg-2` over `color-line-strong`); only Urgent is filled, in `color-danger`.

### Type

Inter, from Google Fonts, through `sans`. Operational UI is 13px (`text-ui`); metadata 12px (`text-meta`); reading text in descriptions and comments 14px (`text-read`); pane titles 15px medium (`text-title`); request titles 19px semibold with -0.015em tracking (`text-heading`); hints 11px (`text-micro`). Regular and medium carry the screen; semibold is for titles only. Set IDs, counts and dates with tabular numerals.

### Spacing, size and layout

Spacing follows the 4px steps `space-1` to `space-8` (4, 8, 12, 16, 20, 24, 32), with 6px and 10px half-steps inside controls. Controls are 28px (`sm`) or 32px (`md`) tall; nav rows and menu options 32px; table rows sit under a 36px sticky header; every pane starts with a 48px header on one shared baseline.

At 1440px: sidebar 220px (Work / Views / Types, New request at the top), queue `clamp(300px, 24vw, 380px)`, reading column ≈ 586px, inspector 288px. Under 840px of request width the inspector folds into a Details strip above the description (label above value). Queues put the list beside the request; tables open a request full width with Back and `j`/`k`.

### Radii

`radius-control` (6px) on buttons, fields, nav rows and menu options; `radius-chip` (5px) on chips and count pills; `radius-panel` (10px) on panels, comments and the composer; `radius-tray` (12px) on trays and dialogs. Checkboxes are 4px.

### Focus and states

Focus is a solid 2px `color-accent` outline, 1px offset, on every interactive element (4.8:1 or better on every surface). Fields instead take an accent-mixed border plus a 3px accent halo at 22%. Disabled controls drop to 45% opacity and stop taking pointer events. Invalid fields mix `color-danger` into the border.

### Motion

Motion is restrained and never on navigation. Ease `cubic-bezier(0.23, 1, 0.32, 1)`; 120ms press (scale 0.97, buttons only), 150ms popovers and the decision dock, 180ms dialog and state changes, 100ms exits, 320ms sidebar width. Popovers fade and settle 4px from their trigger's side; the dialog 6px. Switching view or request swaps content in one frame; a single sliding indicator carries continuity for the nav, queue selection and table row. Under reduced motion everything is instant and the press scale is dropped.

## Iconography

Use Lucide at 1.75 stroke: 15–16px in navigation, 14px inline, 12px in chips and timeline events. Icons sit in `color-fg-3` at rest and `color-fg-2` or `color-fg` when active; they never carry a colour of their own except status and danger. Each request type has one icon: Access & accounts `KeyRound`, Equipment `Laptop`, Purchasing `Receipt`, Facilities `Building2`, Vendors & contracts `FileSignature`, Finance `Landmark`, otherwise `Tag`.

Status and priority glyphs are Meridian's own 14px drawings, not Lucide; they are in the **Status glyphs** and **Priority glyphs** asset groups and in `StatusIcon` and `PriorityIcon`. There is no logo: the workspace mark is the letter "M" in 11px bold `color-canvas` on a 20px `color-fg` square with 5px corners. Do not draw one.

## Components

Build screens from the `Meridian` components: `PaneHeader` on every pane, `NavItem` in the sidebar, `Tray` with `Tabs` and `RequestTable` for lists, and on a request `WorkflowStepper`, `NextStep`, `PropertyList`, `Timeline` and `Composer`. Status always goes through `StatusChip` or `StatusIcon`; actions through `Button`; choices through `Menu`. Wrap any markup of your own in `.mr-root` so the base styles and focus ring apply.

## Not synced

- Components are hand-written renditions of the app's React components, not a build of them: Tailwind classes translated to `mr-` classes, sizes and colours copied exactly. The app's behaviour is described in each guideline but not carried — the shared popover layer and positioning, the native `<dialog>`, the date picker, Motion springs and sliding indicators, keyboard navigation. Not rendered: `DatePicker` (`src/components/ui/date-picker.tsx`), the decision dock (`next-step.tsx`), the queue list (`src/prototypes/unified/queue.tsx`), the new-request dialog's form (`new-request-dialog.tsx`), and the table's Type, Approval and Updated columns.
- Values the token format cannot hold stay in `bundle.css`: every `color-mix()` tint (status chips, tinted cards, danger button, focus halo, selection), the motion durations and easing, and layout widths (sidebar 220px, inspector 288px).
- Inter loads from Google Fonts, as the app loads it through `next/font/google`; there are no font files.
- Light theme: none in the source.
