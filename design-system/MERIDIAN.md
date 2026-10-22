# Meridian design system

The design system of Team Ops (Meridian), a dark, keyboard-first request workspace for small operations teams. Use it to design or build UI that matches the product. Everything you need is in this file: the brand book, every token, and every component's guidelines and props. Follow the rules as written; values are exact.

If you can run code, the companion files `tokens.css`, `components/bundle.css` and `components/bundle.js` (a React 18 script that sets `window.Meridian`) render the components; `components/index.d.ts` types them.

---

## Brand book

Meridian is the interface of Team Ops, a request workspace for small operations teams: triage what comes in, give each request one owner, get sign-off where it is needed, and keep the history. It is a dark, dense, keyboard-first tool. Every screen answers one of six questions — what needs attention, who owns it, what is in progress, what is waiting for approval, what is blocked, what happened before. Design for someone working through a queue all day: quiet surfaces, one accent, status you can read without colour.

### Content fundamentals

- **Write in British English, sentence case.** "All requests", "Due this week", "Request changes", never Title Case. The app's locale is `en-GB`; dates read `31 Dec 2099`.
- **Address the person as "you"; say what they can do next.** "Your approval is needed". "Ready to start". "Waiting on Lena for approval". Use first names in sentences, full names in fields.
- **Short verbs on actions, one idea per button.** Accept, Decline, Start, Submit for approval, Approve, Request changes, Reopen, Comment. Never "OK" or "Submit".
- **Explain the rule in the empty or blocked state, in one sentence.** "Accept it with an owner, or decline it with a reason." "Every request has been accepted or declined." "Try removing a filter or searching for something else."
- **Prompts ask for what is useful.** Placeholders are questions or instructions: "What do you need, by when, and why?", "Be specific so it can be fixed in one pass", "What is it waiting on?".
- **Name requests by their key.** `OPS-1042`, set in `text-meta` with tabular numerals.
- **Shortcuts appear in tooltips and hints, not in labels.** "Back (Esc)", "Search (/)", "Next (J)"; in the composer, `Kbd` keys ⌘ ↵ then "to send".
- **No emoji, no exclamation marks, no marketing voice.** "Inbox zero" is the one light touch.

### Visual foundations

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

### Iconography

Use Lucide at 1.75 stroke: 15–16px in navigation, 14px inline, 12px in chips and timeline events. Icons sit in `color-fg-3` at rest and `color-fg-2` or `color-fg` when active; they never carry a colour of their own except status and danger. Each request type has one icon: Access & accounts `KeyRound`, Equipment `Laptop`, Purchasing `Receipt`, Facilities `Building2`, Vendors & contracts `FileSignature`, Finance `Landmark`, otherwise `Tag`.

Status and priority glyphs are Meridian's own 14px drawings, not Lucide; they are in the **Status glyphs** and **Priority glyphs** asset groups and in `StatusIcon` and `PriorityIcon`. There is no logo: the workspace mark is the letter "M" in 11px bold `color-canvas` on a 20px `color-fg` square with 5px corners. Do not draw one.

### Components

Build screens from the `Meridian` components: `PaneHeader` on every pane, `NavItem` in the sidebar, `Tray` with `Tabs` and `RequestTable` for lists, and on a request `WorkflowStepper`, `NextStep`, `PropertyList`, `Timeline` and `Composer`. Status always goes through `StatusChip` or `StatusIcon`; actions through `Button`; choices through `Menu`. Wrap any markup of your own in `.mr-root` so the base styles and focus ring apply.

### Not synced

- Components are hand-written renditions of the app's React components, not a build of them: Tailwind classes translated to `mr-` classes, sizes and colours copied exactly. The app's behaviour is described in each guideline but not carried — the shared popover layer and positioning, the native `<dialog>`, the date picker, Motion springs and sliding indicators, keyboard navigation. Not rendered: `DatePicker` (`src/components/ui/date-picker.tsx`), the decision dock (`next-step.tsx`), the queue list (`src/prototypes/unified/queue.tsx`), the new-request dialog's form (`new-request-dialog.tsx`), and the table's Type, Approval and Updated columns.
- Values the token format cannot hold stay in `bundle.css`: every `color-mix()` tint (status chips, tinted cards, danger button, focus halo, selection), the motion durations and easing, and layout widths (sidebar 220px, inspector 288px).
- Inter loads from Google Fonts, as the app loads it through `next/font/google`; there are no font files.
- Light theme: none in the source.

---

## Tokens

CSS custom properties: each token is `--<name>` (for example `var(--color-canvas)`). Only a dark theme exists.

### Colour

| Token | Value | Use |
|---|---|---|
| `color-rail` | `#0c0c0c` | Deepest surface: an icon rail or the area behind the shell. Darker than canvas; nothing interactive sits directly on it. |
| `color-canvas` | `#121212` | Page background, inputs (`.field`, search, checkbox) and the primary button's label. The ground every other surface steps up from. |
| `color-shell` | `#161616` | The tray: the outer frame that holds status tabs around an inset panel; also resting filter chips. |
| `color-panel` | `#191919` | Panels inside the tray, the table, sticky table headers, comment cards, the composer. |
| `color-raised` | `#1f1f1f` | Secondary button fill, hover on nav rows and ghost buttons, count pills, Kbd keys. |
| `color-selected` | `#252525` | Selected row, active nav item, highlighted menu option, the active tab's count pill. The top of the surface ladder. |
| `color-overlay` | `#1c1c1c` | Floating layers only: menus, pickers, the date picker and dialogs, always with `shadow-float` and a `color-line-strong` border. |
| `color-line` | `#262626` | Default 1px hairline: panel, field and pane-header borders, table row separators, the timeline spine. Below 3:1 on every surface by design; the source keeps separation quiet. |
| `color-line-soft` | `#1f1f1f` | The faintest divider, between sections inside one panel. |
| `color-line-strong` | `#333333` | Borders on floating layers, hovered fields and controls, unfilled progress segments, unselected checkbox outline. |
| `color-fg` | `#ededed` | Primary text and the primary button's fill. 13:1 or better on every surface. |
| `color-fg-2` | `#ababab` | Secondary text: unselected nav and tab labels, table cells of closed requests, body of a next-step card. 6.6:1 or better on every surface. |
| `color-fg-3` | `#8f8f8f` | Metadata: labels in property rows, timestamps, IDs, placeholders, counts. 4.7:1 on `color-selected`, more on lower surfaces. |
| `color-fg-4` | `#5e5e5e` | Decoration only, never text (2.4–3.0:1): completed stepper marks, the unassigned avatar's dashed ring, hovered checkbox outline. |
| `color-accent` | `#4f8cff` | The one accent: focus ring (2px, 4.8:1 or better), selection markers, checked checkboxes, chart lines, unread state. Never the primary button. |
| `color-accent-fg` | `#8fb5ff` | Accent as text: @mentions, unread counts on `accent` at 18% tint. |
| `color-danger` | `#eb5a5a` | Reserved for blocked, urgent and overdue. Fills the urgent priority glyph; tints the danger button and blocked chip. |
| `color-danger-fg` | `#f39a9a` | Danger as text: blocked labels, inline errors, overdue dates, danger button label. |
| `color-success` | `#4fb67f` | Positive confirmation fills. |
| `color-success-fg` | `#86d2a6` | Success as text. |
| `color-st-triage` | `#5e9bff` | Status Triage: dashed ring glyph, chip tint. Always with its glyph and label. |
| `color-st-todo` | `#8f8f8f` | Status To do: open ring glyph, chip tint. |
| `color-st-progress` | `#e2b53e` | Status In progress: half-filled glyph, chip tint. |
| `color-st-review` | `#9b87f5` | Status In review: three-quarter glyph, chip tint; the request-changes event icon. |
| `color-st-done` | `#4fb67f` | Status Done: filled check glyph, chip tint, the stepper's finished mark. |
| `color-st-declined` | `#6f6f6f` | Status Declined: filled cross glyph, chip tint. 3.0–3.9:1, enough for a glyph, not for small text alone. |

### Type

Family `--font-sans`: `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` (Inter from Google Fonts, weights 400, 500, 600). Each style is also a CSS class of the same name.

| Style | Size | Line height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `text-heading` | 19px | 26px | 600 | -0.015em | Request titles on the request page. Semibold is for titles only. |
| `text-title` | 15px | 20px | 500 | — | Pane and page titles in the 48px header. |
| `text-read` | 14px | 22px | 400 | — | Reading text: request descriptions and comments. |
| `text-ui` | 13px | 18px | 400 | — | The base size: buttons, nav rows, table cells, menu options, inputs. Medium (500) for labels that act. |
| `text-meta` | 12px | 16px | 400 | — | Metadata: property labels, timestamps, IDs, status chips, table headers. Tabular numerals for IDs, counts and dates. |
| `text-micro` | 11px | 14px | 400 | — | Keyboard hints, Kbd keys, picker section titles, count badges. |

### Spacing

Tailwind's 4px step. DESIGN.md names 4 / 8 / 12 / 16 / 20 / 24 / 32 as the scale; components also use 6px and 10px half-steps (gap-1.5, px-2.5).

| Token | Value | Use |
|---|---|---|
| `space-1` | 4px | Tray inset (p-1), gap between tabs, menu list padding. |
| `space-2` | 8px | Gap in toolbars and button rows; nav row horizontal padding; property row gap. |
| `space-3` | 12px | Gap between avatar and comment; button horizontal padding at md; footer padding. |
| `space-4` | 16px | Pane horizontal padding on mobile; dialog header and footer inset. |
| `space-5` | 20px | Pane horizontal padding on desktop; gap above a sidebar section label. |
| `space-6` | 24px | Gap between facts in the inline details strip; empty-state side padding. |
| `space-8` | 32px | Largest step: separation between independent request sections. |

### Radius

| Token | Value | Use |
|---|---|---|
| `radius-control` | 6px | Buttons, fields, nav rows, filter chips, menu options. |
| `radius-chip` | 5px | Status chips, blocked chip, count pills. |
| `radius-panel` | 10px | Panels inside the tray, comment cards, the composer, next-step cards. |
| `radius-tray` | 12px | The tray and dialogs. |

### Shadow

Shadow only on floating layers (menus, dialogs). Everything else separates by 1px lines.

| Token | Value | Use |
|---|---|---|
| `shadow-float` | `0 0 0 1px rgb(0 0 0 / 0.4), 0 12px 32px -8px rgb(0 0 0 / 0.6)` | Menus, pickers, the date picker and dialogs, on `color-overlay`. |
| `shadow-sheet` | `-12px 0 32px -12px rgb(0 0 0 / 0.7)` | A sheet sliding over content from the right (the folded inspector on narrow screens). |

### Values outside the tokens

- Status chip: background `color-mix(in oklab, <status colour> 14%, transparent)`, text `color-mix(in oklab, <status colour> 68%, white)`.
- Tinted card (next step, blocked): background `color-mix(in oklab, <colour> 5%, var(--color-panel))`, border `color-mix(in oklab, <colour> 28%, var(--color-line))`.
- Danger button: border 30%, fill 10% of `--color-danger` (50% and 15% on hover); text `--color-danger-fg`.
- Field focus: border `color-mix(in oklab, var(--color-accent) 70%, var(--color-line))` plus `0 0 0 3px` accent at 22%.
- Focus ring everywhere else: `2px solid var(--color-accent)`, offset 1px.
- Motion: ease `cubic-bezier(0.23, 1, 0.32, 1)`; 120ms press (scale 0.97), 150ms popovers, 180ms dialog, 100ms exits, 320ms sidebar.
- Layout at 1440px: sidebar 220px, queue `clamp(300px, 24vw, 380px)`, reading column about 586px, inspector 288px, pane header 48px.

---

## Components

Guidelines for each component, then the props of all of them.

### Avatar

A round initials badge in one of eight muted tone pairs, chosen from the person's name so the same person is always the same colour.

Hand-written from `src/components/ui/avatar.tsx`. `AvatarStack` (same file) overlaps several by 6px with a 2px `color-panel` ring.

**Use** beside a visible name (owner, approver, comment author). Sizes 16, 18, 20, 24, 28, 32px; 18px and below show one initial. A missing person (`name` null) is a dashed `color-fg-4` ring — "Unassigned". Tone pairs are identity only and never carry meaning; they are not tokens.

**Consumer provides** `name`, `size`, and `decorative: false` when no name is shown next to it, so the avatar gets an accessible label. Avatars are never photos.

### Button

The one button: four variants, two heights and two square icon sizes, all medium-weight 13px with `radius-control` corners.

Hand-written from `src/components/ui/button.tsx`.

**Use**
- `primary` (`color-fg` fill, `color-canvas` label) for the single action the person most likely takes: Accept, Approve, Comment, New request. One per area. It is near-white, never blue.
- `secondary` (the default; `color-raised` with a `color-line` border) for everything else that acts.
- `ghost` for dismissals and toolbar actions that should recede: Cancel, Close, Clear.
- `danger` only for Decline and destructive confirmations; it is a tint of `color-danger`, not a solid red.
- `sm` (28px) in toolbars, rows and cards; `md` (32px) in pane headers and dialogs. `icon-sm` / `icon-md` for square icon buttons, which need an `aria-label`.

**Consumer provides** the label (and an optional leading 14px icon as a child), `onClick`, and any native button attribute. `type` defaults to `button`.

**States** Hover steps the fill up one surface. Press scales to 0.97 over 120ms (dropped under reduced motion). Disabled is 45% opacity and ignores the pointer — the composer's Comment button stays `secondary` and disabled until there is text, then turns `primary`.

### Checkbox

A 14px square checkbox with 4px corners that fills with `color-accent` and a white check when ticked.

Hand-written from `.checkbox` in `src/app/globals.css`.

**Use** for row selection in tables and "select all" in the header (indeterminate when some rows are ticked). Ticking rows reveals the bulk bar (Assign, Priority). Not for settings toggles — the product has none.

**Consumer provides** native checkbox props, an optional `label`, and `indeterminate`. A ticked table row also shows a 2px `color-accent` marker on its left edge.

### Composer

The comment box pinned under the timeline: an auto-growing textarea (40–200px) on `color-panel` with `radius-panel`, a ⌘ ↵ "to send" hint and the Comment button.

Hand-written from `src/components/request/composer.tsx`.

**Use** once, pinned at the bottom of the request's reading column. Placeholder "Leave a comment…". The Comment button is a disabled `secondary` while empty and becomes `primary` once there is text. ⌘/Ctrl + Enter sends. The border goes `color-line-strong` while focused; the textarea itself shows no outline.

**Consumer provides** `onSubmit(body)`, `placeholder`, `submitLabel`, `defaultValue`.

### EmptyState

A centred title and one sentence for a list with nothing in it, with an optional action.

Hand-written from `EmptyState` in `src/prototypes/unified/table-view.tsx`.

**Use** whenever a queue, table or filter result is empty. Title: 13px medium `color-fg`, a short fact ("No decisions waiting", "No open requests"). Body: 12px `color-fg-3`, at most 320px, saying what will appear here or how to get results ("Requests due in the next 7 days will appear here."). No illustrations.

**Consumer provides** `title`, `body`, and an optional `action` (usually a secondary `Button`).

### Field

The text input and textarea: `color-canvas` fill, `color-line` border, 6px × 10px padding, 13px text.

Hand-written from `.field` in `src/app/globals.css`, as used in `src/components/request/new-request-dialog.tsx` and `next-step.tsx`.

**Use** for every free-text entry: request title, description, decline and change-request reasons. Put a 12px medium `color-fg-2` label 8px above it. Placeholders ask the useful question ("Be specific so it can be fixed in one pass"). `multiline` gives a textarea that grows with its content from 64px to 240px.

**Consumer provides** `label`, `value`/`onChange` (or `defaultValue`), `placeholder`, `multiline`, and `error` (or `invalid`) — an error message sits 8px below in `color-danger-fg` with `role="alert"`.

**States** Hover: `color-line-strong` border. Focus: accent-mixed border with a 3px accent halo at 22% (no outline). Invalid: danger mixed into the border.

### FilterChip

A 28px filter trigger: icon, label, and an up-down chevron. When set it shows "Label: value" on a raised fill.

Hand-written from `FilterPicker` in `src/prototypes/unified/table-view.tsx`.

**Use** in the toolbar row under the pane header, after search. Clicking opens a `Menu` whose first option is "Any …". Resting: `color-shell` fill, `color-line` border, `color-fg-2` text. Set: `color-raised`, `color-line-strong`, `color-fg`, the label in `color-fg-3`.

**Consumer provides** `icon` (a Lucide name or node), `label`, `value` (empty for unset) and `onClick` to open the menu.

### Icon

The Lucide icons Meridian uses, drawn from Lucide 1.48 path data at 1.75 stroke in `currentColor`.

Copied from `lucide-react@1.48.0` (ISC licence) for the icons imported across `src/`.

**Use** 15–16px in navigation, 14px inline, 12px in chips and timeline events. Colour comes from the text colour: `color-fg-3` at rest, `color-fg-2`/`color-fg` when active, `color-danger-fg` for blocked. Request types: Access & accounts `key-round`, Equipment `laptop`, Purchasing `receipt`, Facilities `building-2`, Vendors & contracts `file-signature`, Finance `landmark`, anything else `tag`. In an app, import from `lucide-react` directly; this component carries only the set shown.

**Consumer provides** `name`, `size`, `className`/`style`, and `label` when the icon stands alone and means something.

### Kbd

A keyboard key: an 18px `color-raised` cap with a `color-line-strong` border and 11px `color-fg-3` text.

Hand-written from `src/components/ui/kbd.tsx`.

Use it for keyboard hints beside a control — the `/` in search, ⌘ ↵ "to send" under the composer. In tooltips, write the shortcut in brackets instead: "Back (Esc)", "Next (J)". The consumer provides the key text as children. Meridian's shortcuts: `j`/`k` move, `Enter` opens, `Esc` goes back, `c` creates, `/` searches, `[` hides the sidebar.

### Menu

The picker list on the floating surface: `color-overlay`, 9px corners, `color-line-strong` border and `shadow-float`, with 32px options.

Hand-written from `src/components/ui/picker.tsx` and `PopoverSurface` in `src/components/ui/popover.tsx`.

**Use** for every choice from a list: owner, approver, priority, type, filters, sort, the account menu. Optional 11px title and a search row for long lists. The highlighted option is `color-selected`; the chosen one has a check on the right. Options can carry a 16px leading icon or avatar, a right-aligned `color-fg-3` hint, and a separator above.

**Behaviour in the app** One floating layer at a time, in the browser's top layer (no z-index); it opens on the side with room, fades and settles 4px over 150ms when opened by pointer (instantly by keyboard), closes instantly. Escape or choosing returns focus to the trigger. This rendition draws the surface in place; positioning is the consumer's.

**Consumer provides** `options` (`{value, label, icon?, hint?, separated?}`), `value`/`onChange` (or `defaultValue`), `title`, `searchable`, `width`.

### Modal

The dialog surface: up to 560px wide, `radius-tray` corners, `color-overlay` with `shadow-float`, a 48px header with the title and a close button, a scrolling body and a right-aligned footer.

Hand-written from `src/components/ui/modal.tsx` (shown in place here; the app renders a native `<dialog>` with `showModal()`).

**Use** sparingly — New request is the main one. The footer holds a ghost Cancel and one primary action. On phones it becomes a bottom sheet with square bottom corners. The backdrop is black at 60%.

**Behaviour in the app** The platform supplies focus containment, Escape and the inert background. Opening it closes any open menu. It enters with a 6px rise and fade over 180ms when opened by pointer, instantly by keyboard; it closes instantly.

**Consumer provides** `title`, children (pad them 16px), `footer`, `onClose`.

### NavItem

A 32px sidebar row: 15px icon, label and an optional count or unread badge. The active row sits on `color-selected`.

Hand-written from `NavItem` in `src/prototypes/unified/sidebar.tsx`.

**Use** in the 220px sidebar, grouped under Work (Inbox, My work, Approvals), Views and Types, with New request at the top. Section labels are 12px `color-fg-3`, sentence case, 20px above the group. Counts are 12px tabular `color-fg-3`; Inbox's unread count is an 18px `color-accent` pill at 18% with `color-accent-fg` text.

**Consumer provides** `icon`, `label`, `active`, `count` or `unread` (or a custom `trailing` node), `onClick`.

**Motion** In the app one shared indicator slides beneath the rows to the chosen view; navigation itself never animates.

### NextStep

The card that says what happens next and what *you* can do about it: a status glyph, a 13px medium title, optional meta on the right, one line of `color-fg-2` body and the actions.

Hand-written from `NextStepCard` in `src/components/request/next-step.tsx`, with `.tinted-card` from `globals.css`.

**Use** once per request, in the state block under the stepper. Tint it toward the status (`emphasis`) only when the current person must act — triage, an approval they owe — and toward `color-danger` (`tone: "danger"`) when blocked. Otherwise it stays a plain `color-panel` card ("Waiting on Lena for approval"). The title is the situation in the person's terms; the body explains the rule. One primary action at most.

**Consumer provides** `title`, `body`, `meta`, `status` or `icon`, `tone`, `emphasis`, and `actions` (buttons). Reasons for declining, blocking or requesting changes go in a `Field` inside the card (children).

**In the app** When this card scrolls out of view and the decision is yours, a compact decision dock appears above the composer.

### PaneHeader

The 48px bar that starts every pane, with a bottom `color-line` rule: a 24px icon tile, the 15px medium title, a count, an optional description and right-aligned actions.

Hand-written from `PaneHeader` and `ViewHeader` in `src/prototypes/unified/view-header.tsx`.

**Use** at the top of the sidebar, queue, table and request panes so all headers share one baseline. Padding is 20px (16px on mobile). Never move or blank the header when the content below changes.

**Consumer provides** `icon`, `title`, `count`, `description`, and actions as children.

### PriorityIcon

Priority as a 14px glyph: three rising bars for High, Medium and Low, three dashes for No priority, and a filled `color-danger` square with an exclamation mark for Urgent.

Hand-written from `src/components/request/glyphs.tsx`.

**Use** in the narrow priority column of the request table (centred, no header label), and before the value in the Priority property. Filled bars are `color-fg-2`, empty bars `color-line-strong`. Only Urgent is red. The glyph has its own `aria-label` ("Priority: High").

### PropertyList

Label / value rows for a request's details: 12px `color-fg-3` labels in an 88px column, 13px values in 32px rows; editable values are buttons whose hover fill extends 8px past the text.

Hand-written from `src/components/request/properties.tsx`.

**Use** `layout: "list"` in the 288px inspector beside the reading column: Status, Priority, Owner, Approver, Due date, Type, Requester, Created. Under 840px of request width use `layout: "facts"`: a compact strip, label above value, columns sized to content. Empty values read in `color-fg-3` ("Not required", "Set due date"). Editing opens a `Menu` or the date picker in place.

**Consumer provides** `rows` (`{label, value, editable?}`) and `layout`.

### RequestTable

The dense request table: checkbox, priority glyph, ID, request title, status, owner and due date, 40px rows under a 36px sticky header.

Hand-written from `src/prototypes/unified/request-table.tsx` (a subset of its columns: Type, Approval and Updated are omitted here).

**Use** inside a `Tray` panel. Headers are 12px regular `color-fg-3` with an inset bottom line. Rows are 13px `color-fg-2` with the title in `color-fg` (`color-fg-2` once closed); hover is `color-raised` at 60%, the opened row `color-selected`, a ticked row gets a 2px accent marker. Blocked is a `Ban` icon in the Status cell, never a chip in the title. Overdue dates are `color-danger-fg`. In the app, fixed columns are sized to their longest value (ID 78, Status 136, Owner 148, Due 96) and drop by container width, least important first.

**Consumer provides** `rows` (`{key, title, status, priority, owner, due, blocked?, overdue?, checked?, comments?}`), `selected`/`onOpen` (or `defaultSelected`). `Enter` opens, `j`/`k` move.

### SearchField

The 32px search box at the head of tables and queues: a search icon, the input, a clear button once there is text, and a `/` key hint.

Hand-written from `SearchInput` in `src/prototypes/unified/table-view.tsx`.

**Use** once per list, left of the filters, at most 300px wide. `/` focuses it from anywhere. Searching filters in place; no results shows `EmptyState` with "No matches".

**Consumer provides** `value`/`onChange` (or `defaultValue`), `placeholder` (default "Search requests"), and `shortcut` (`null` hides the key hint). Its border goes `color-line-strong` while focused.

### StatusChip

A 22px tinted chip: the status glyph and label on 14% of the status colour, the label 68% of it mixed into white.

Hand-written from `src/components/request/glyphs.tsx` and `.status-chip` in `globals.css`. `BlockedChip` is the blocked marker from `src/components/request/properties.tsx`: a `Ban` icon and "Blocked" in `color-danger-fg` on 12% `color-danger`.

**Use** in the Status column, the Status property and anywhere a request's state is shown in a sentence-free place. Pass `label` to override the text (e.g. "Awaiting approval"). Put `BlockedChip` after the status chip, never instead of it — a blocked request keeps its place in the workflow. Don't use chips as tags or filters; they mean status only.

**Motion** When a request changes state the chip cross-fades its colours over 150ms.

### StatusIcon

The six status glyphs: a 14px progress shape that carries the state even without colour.

Hand-written from `src/components/request/glyphs.tsx`.

| Status | Shape | Colour |
| --- | --- | --- |
| Triage | dashed ring | `color-st-triage` |
| To do | ring | `color-st-todo` |
| In progress | ring, right half filled | `color-st-progress` |
| In review | ring, three quarters filled | `color-st-review` |
| Done | filled disc with a check | `color-st-done` |
| Declined | filled disc with a cross | `color-st-declined` |

**Use** at 12px in chips and tabs, 14px in rows and the stepper. Always beside the status label (or inside `StatusChip`). The glyph is `aria-hidden`; the label is the accessible text. Blocked is not a status — show `BlockedChip` or a `Ban` icon beside it.

### Tabs

Status tabs for the tray: 40px tall, 13px labels with a 12px status glyph and a count pill; the selected tab has a 2px `color-fg` underline.

Hand-written from the status tablist in `src/prototypes/unified/table-view.tsx`.

**Use** only inside a `Tray`, to split a table by status. Counts are tabular `text-meta` on `color-raised` (`color-selected` when active). Unselected labels are `color-fg-2`.

**Consumer provides** `tabs` (`{id, label?, status?, count?}`), `value`/`onChange` (or `defaultValue`).

### Timeline

A request's history: comments as `color-panel` cards with a 24px avatar and 14px reading text, events as one 12px line with a small icon, all on a 1px `color-line` spine.

Hand-written from `src/components/request/timeline.tsx`.

**Use** below the description in the request's reading column, oldest first, comments and events merged. Events name the actor in medium `color-fg` and say what happened in `color-fg-2` ("requested changes", "marked this blocked"), then " · " and a relative time in `color-fg-3`. A reason quotes under the event with a 2px `color-line-strong` left rule. @mentions are medium `color-accent-fg`. Event icons are 12px `color-fg-2`; requested changes uses `color-st-review`, blocked `color-danger-fg`.

**Consumer provides** `items`: `{kind: "comment", author, at, body}` or `{kind: "event", actor, text, icon, iconColor?, at, note?}`, and `background` (the surface it sits on, so avatar and icon rings cut the spine cleanly; default `color-canvas`).

**Motion in the app** A new entry rises 6px and fades in over 220ms; nothing else in the timeline moves.

### Tray

The frame for tables: an outer `color-shell` tray (`radius-tray`, 4px inset) holding status `Tabs`, with an inset `color-panel` panel (`radius-panel`, `color-line` border) that holds an optional 44px toolbar and the data.

Hand-written from the tray in `src/prototypes/unified/table-view.tsx`.

**Use** for every table view — All requests, saved views, request types. One tray per pane; it fills the pane below the header and filter row with 20px side and bottom margins. Don't nest trays or put cards inside one.

**Consumer provides** `label`, `tabs` (passed to `Tabs`), `toolbar` (sort, counts, the bulk bar when rows are ticked) and the table or `EmptyState` as children.

### WorkflowStepper

Where a request sits in Triage → To do → In progress → Approval → Done, in one 12px line: completed stages get a small `color-fg-4` check, the current stage its status glyph in medium `color-fg`, later stages an empty ring.

Hand-written from `src/components/request/stepper.tsx`.

**Use** in the state block under the request title. A request that skips approval shows "No approval" struck through on a dashed ring. Blocked replaces the current glyph with a red `Ban` and adds "· Blocked". Declined collapses to Triage — Declined. Connectors are 1px `color-line-strong`, `color-fg-4` once passed.

**Consumer provides** `status`, `needsApproval` (false when no approver is set), `blocked`.

**Motion in the app** The segment an action completes fills left to right over 280ms; the newly reached stage settles in and Done's check draws itself.

### Props (TypeScript)

```ts
import type * as React from 'react';

export type RequestStatus = 'triage' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'declined';
export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';
/** A Lucide icon name from the set Meridian uses (see the Icon card), or a node. */
export type IconRef = string | React.ReactNode;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Default 'secondary'. One 'primary' per area; 'danger' only for Decline and destructive confirmations. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Default 'sm' (28px). 'md' is 32px; icon sizes are square and need aria-label. */
  size?: 'sm' | 'md' | 'icon-sm' | 'icon-md';
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface KbdProps { children?: React.ReactNode; className?: string }
export declare function Kbd(props: KbdProps): React.ReactElement;

export interface AvatarProps {
  /** null or undefined draws the dashed "Unassigned" ring. */
  name: string | null | undefined;
  size?: 16 | 18 | 20 | 24 | 28 | 32;
  /** Default true. Set false when no visible name sits beside it. */
  decorative?: boolean;
  className?: string;
}
export declare function Avatar(props: AvatarProps): React.ReactElement;
export interface AvatarStackProps { names: string[]; size?: 18 | 20 | 24 }
export declare function AvatarStack(props: AvatarStackProps): React.ReactElement;

export interface StatusIconProps { status: RequestStatus; size?: number; className?: string }
export declare function StatusIcon(props: StatusIconProps): React.ReactElement;
export interface StatusChipProps { status: RequestStatus; label?: string; className?: string }
export declare function StatusChip(props: StatusChipProps): React.ReactElement;
export interface BlockedChipProps { label?: string; className?: string }
export declare function BlockedChip(props: BlockedChipProps): React.ReactElement;
export interface PriorityIconProps { priority: Priority; size?: number; className?: string }
export declare function PriorityIcon(props: PriorityIconProps): React.ReactElement;

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Renders a textarea that grows from 64px to 240px. */
  multiline?: boolean;
  /** Shown below in danger-fg with role="alert"; also marks the field invalid. */
  error?: string;
  invalid?: boolean;
}
export declare function Field(props: FieldProps): React.ReactElement;

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  indeterminate?: boolean;
}
export declare function Checkbox(props: CheckboxProps): React.ReactElement;

export interface SearchFieldProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Visually hidden label. Default "Search requests". */
  label?: string;
  /** Key hint. Default "/"; null hides it. */
  shortcut?: string | null;
  className?: string;
}
export declare function SearchField(props: SearchFieldProps): React.ReactElement;

export interface FilterChipProps {
  icon?: IconRef;
  label: string;
  /** Empty or null shows the resting chip; a value shows "Label: value". */
  value?: string | null;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}
export declare function FilterChip(props: FilterChipProps): React.ReactElement;

export interface NavItemProps {
  icon: IconRef;
  label: string;
  active?: boolean;
  count?: number;
  /** Accent pill, for Inbox. */
  unread?: number;
  trailing?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}
export declare function NavItem(props: NavItemProps): React.ReactElement;

export interface PaneHeaderProps {
  icon?: IconRef;
  title: string;
  count?: number;
  description?: string;
  /** Right-aligned actions. */
  children?: React.ReactNode;
  className?: string;
}
export declare function PaneHeader(props: PaneHeaderProps): React.ReactElement;

export interface TabItem { id: string; label?: string; status?: RequestStatus; count?: number }
export interface TabsProps {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  label?: string;
  className?: string;
}
export declare function Tabs(props: TabsProps): React.ReactElement;

export interface TrayProps {
  label?: string;
  tabs?: TabItem[];
  tab?: string;
  defaultTab?: string;
  onTabChange?: (id: string) => void;
  /** Contents of the 44px toolbar row inside the panel. */
  toolbar?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Tray(props: TrayProps): React.ReactElement;

export interface RequestRow {
  key: string;
  title: string;
  status: RequestStatus;
  priority?: Priority;
  owner?: string | null;
  due?: string;
  overdue?: boolean;
  blocked?: boolean;
  checked?: boolean;
  comments?: number;
}
export interface RequestTableProps {
  rows: RequestRow[];
  selected?: string | null;
  defaultSelected?: string | null;
  onOpen?: (key: string) => void;
  className?: string;
}
export declare function RequestTable(props: RequestTableProps): React.ReactElement;

export interface EmptyStateProps { title: string; body: string; action?: React.ReactNode; className?: string }
export declare function EmptyState(props: EmptyStateProps): React.ReactElement;

export interface MenuOption { value: string; label: string; icon?: IconRef; hint?: string; separated?: boolean }
export interface MenuProps {
  options: MenuOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  title?: string;
  searchable?: boolean;
  placeholder?: string;
  /** Highlighted option index. Default 0. */
  activeIndex?: number;
  /** px. Default 240. */
  width?: number;
  className?: string;
}
export declare function Menu(props: MenuProps): React.ReactElement;

export interface ModalProps {
  title: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}
export declare function Modal(props: ModalProps): React.ReactElement;

export interface WorkflowStepperProps {
  status: RequestStatus;
  /** Default true. False shows Approval as "No approval", struck through. */
  needsApproval?: boolean;
  blocked?: boolean;
  className?: string;
}
export declare function WorkflowStepper(props: WorkflowStepperProps): React.ReactElement;

export interface PropertyRow { label: string; value: React.ReactNode; editable?: boolean }
export interface PropertyListProps {
  rows: PropertyRow[];
  /** 'list' for the 288px inspector, 'facts' for the inline strip. */
  layout?: 'list' | 'facts';
  className?: string;
}
export declare function PropertyList(props: PropertyListProps): React.ReactElement;

export interface NextStepProps {
  title: string;
  body?: React.ReactNode;
  meta?: string;
  status?: RequestStatus;
  icon?: IconRef;
  tone?: 'default' | 'danger';
  /** Tint toward the status: only when the current person must act. */
  emphasis?: boolean;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}
export declare function NextStep(props: NextStepProps): React.ReactElement;

export interface ComposerProps {
  onSubmit?: (body: string) => void;
  placeholder?: string;
  submitLabel?: string;
  defaultValue?: string;
  className?: string;
}
export declare function Composer(props: ComposerProps): React.ReactElement;

export type TimelineItem =
  | { kind: 'comment'; author: string; at: string; body: string }
  | { kind: 'event'; actor: string; text: string; icon: IconRef; iconColor?: string; at: string; note?: string };
export interface TimelineProps {
  items: TimelineItem[];
  /** The surface it sits on. Default var(--color-canvas). */
  background?: string;
  className?: string;
}
export declare function Timeline(props: TimelineProps): React.ReactElement;

export interface IconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
  /** Accessible name when the icon stands alone. */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Icon(props: IconProps): React.ReactElement;

export declare const STATUS_META: Record<RequestStatus, { label: string; color: string; verb: string }>;
export declare const PRIORITY_META: Record<Priority, { label: string; rank: number }>;

declare global {
  interface Window {
    Meridian: {
      Button: typeof Button; Kbd: typeof Kbd; Avatar: typeof Avatar; AvatarStack: typeof AvatarStack;
      StatusIcon: typeof StatusIcon; StatusChip: typeof StatusChip; BlockedChip: typeof BlockedChip; PriorityIcon: typeof PriorityIcon;
      Field: typeof Field; Checkbox: typeof Checkbox; SearchField: typeof SearchField; FilterChip: typeof FilterChip;
      NavItem: typeof NavItem; PaneHeader: typeof PaneHeader; Tabs: typeof Tabs; Tray: typeof Tray;
      RequestTable: typeof RequestTable; EmptyState: typeof EmptyState; Menu: typeof Menu; Modal: typeof Modal;
      WorkflowStepper: typeof WorkflowStepper; PropertyList: typeof PropertyList; NextStep: typeof NextStep;
      Composer: typeof Composer; Timeline: typeof Timeline; Icon: typeof Icon;
      STATUS_META: typeof STATUS_META; PRIORITY_META: typeof PRIORITY_META;
    };
  }
}
```

---

## Glyphs

Meridian's own status and priority icons, 14×14, colours baked in. Inline them where the components can't run.

### Status

`status-declined.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.25" fill="#6f6f6f"/><path d="m5 5 4 4m0-4-4 4" stroke="#121212" stroke-width="1.5" stroke-linecap="round"/></svg>
```

`status-done.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.25" fill="#4fb67f"/><path d="m4.4 7.1 1.75 1.75L9.6 5.4" stroke="#121212" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

`status-in-progress.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#e2b53e" stroke-width="1.5"/><path d="M7 3.75a3.25 3.25 0 0 1 0 6.5z" fill="#e2b53e"/></svg>
```

`status-in-review.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#9b87f5" stroke-width="1.5"/><path d="M7 3.75a3.25 3.25 0 1 1-3.25 3.25H7z" fill="#9b87f5"/></svg>
```

`status-todo.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#8f8f8f" stroke-width="1.5"/></svg>
```

`status-triage.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#5e9bff" stroke-width="1.5" stroke-dasharray="2.1 1.9"/></svg>
```

### Priority

`priority-high.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="8" width="2.5" height="4" rx="0.75" fill="#ababab"/><rect x="5.75" y="5" width="2.5" height="7" rx="0.75" fill="#ababab"/><rect x="10" y="2" width="2.5" height="10" rx="0.75" fill="#ababab"/></svg>
```

`priority-low.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="8" width="2.5" height="4" rx="0.75" fill="#ababab"/><rect x="5.75" y="5" width="2.5" height="7" rx="0.75" fill="#333333"/><rect x="10" y="2" width="2.5" height="10" rx="0.75" fill="#333333"/></svg>
```

`priority-medium.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="8" width="2.5" height="4" rx="0.75" fill="#ababab"/><rect x="5.75" y="5" width="2.5" height="7" rx="0.75" fill="#ababab"/><rect x="10" y="2" width="2.5" height="10" rx="0.75" fill="#333333"/></svg>
```

`priority-none.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h1.5M6.25 7h1.5M10 7h1.5" stroke="#8f8f8f" stroke-width="1.5" stroke-linecap="round"/></svg>
```

`priority-urgent.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="3" fill="#eb5a5a"/><path d="M7 3.75v4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><circle cx="7" cy="10.1" r="0.95" fill="#fff"/></svg>
```
