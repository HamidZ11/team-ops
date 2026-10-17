# Visual direction

Status: first exploration. Tokens live in `src/app/globals.css`.

## What each reference contributes

| Reference | Borrow | Do not borrow |
| --- | --- | --- |
| Ace Studio | Compact sidebar with muted selected row; page-level scope controls as small bordered buttons; the **tray**: an outer frame holding tabs, with an inset panel holding the data; metric tabs with a 2px underline; quiet table header; tinted status chips. | Colourful app squircles, trial/upgrade chrome, campaign toggles. |
| BRIN.co (order detail) | Title anchors status and actions; label/value property rows; independent sections only where groups are independent; local actions beside the section they affect; 2:1 content/context split. | Warm grey card-on-card stacking for every section, avatars as photos, map. |
| Dark analytics panel | Precise 1px panels, step and bar charts in one blue family, legend values right-aligned with tabular numerals, deltas as small coloured text. | Donuts and heatmaps: no current decision needs them. |
| Sidebar variation | Icon rail for global areas + contextual sidebar; uppercase section labels with collapse chevrons; 16px icons on a shared optical grid; search with keyboard hint. | Its own section names and logo. |

## System

- **Surfaces**: rail `#0c0c0c` → canvas `#121212` → shell/tray `#161616` → panel `#191919` → raised `#1f1f1f` → selected `#252525`. Separation by 1px lines (`#262626`, soft `#1f1f1f`, strong `#333`). Shadow only on floating layers (menus, dialogs).
- **Type**: Inter, 13px base for operational UI, 12px metadata, 14px reading text (descriptions, comments), 15px page titles, 18–20px request titles. Regular and medium carry the screen; semibold only for titles. Tabular numerals for IDs, counts, dates.
- **Radius**: 6px controls, 5px chips, 10–12px panels and trays.
- **Spacing**: 4 / 8 / 12 / 16 / 20 / 24 / 32.
- **Accent**: one blue (`#4f8cff`) for focus, selection markers, charts, unread state. The primary button is near-white on dark, not blue.
- **Status**: each colour has exactly one meaning and is always paired with a glyph shape and label. Triage blue (dashed ring), To do grey (ring), In progress yellow (half), In review violet (three-quarter), Done green (check), Declined grey (cross). Red is reserved for blocked, urgent and overdue.
- **Icons**: lucide at 1.75 stroke, 15–16px in navigation, 14px inline.

## Unified desktop direction (approved foundation)

Route: `/prototypes/unified`. A provides the shell and visual language, B the request workflow.

- **Shell**: A's 220px sidebar (Work / Views / Types, with New request at the top). No icon rail. Every pane starts with a 48px header bar on one shared baseline.
- **Two presentations, one request layout**: Inbox, My work and Approvals are queues (list + request side by side). All requests, saved views and types are tables. Opening a row shows the same request layout full width, with Back and `j`/`k` through the table's order.
- **Request layout**: title, then a state block (workflow progress + the next step for the current person), description, activity. The composer is pinned. A 288px inspector holds editable properties and the people involved.
- **Proportions at 1440**: sidebar 220, queue `clamp(300px, 24vw, 380px)` ≈ 346, reading column ≈ 586, inspector 288. Under 840px of request width the inspector folds into a Details panel above the description.
- **Table**: A's tray and table without the trend strip. Fixed columns are sized to their longest measured value; the Request column gets the remainder (≈ 389px at 1440, 395px at 1280). Blocked is a red marker in the Status cell, not a chip in the title.
- **Queue titles** wrap to two lines rather than truncate; the snippet stays one line.
- **Inline details** (no room for the inspector): a compact facts strip, label above value, columns sized to content.
- **Decision dock**: only for the person who must decide, only while the decision panel is scrolled out of view. Approve acts in place; Request changes returns to the single reason form.

## Motion (unified prototype)

Opt-in via `MotionContext` (`src/components/ui/motion.tsx`); CSS in `globals.css`; springs and layout via Motion for React (`motion@13.4.4`, `LazyMotion` + `m.*`, unified only). Spring tokens in `src/components/ui/springs.ts` are tuned by visual duration: panels 0.24s (bounce 0.08), indicators 0.2s (0.12), layout 0.24s (0), small marks 0.28s (0.3).

- **Tokens**: ease `cubic-bezier(0.23, 1, 0.32, 1)`; 120ms press, 150ms popovers/dock-in, 180ms dialog and state changes, 100ms exits.
- **Animates**: button press (scale 0.97); pointer-opened popovers and the dialog (opacity + 4–6px translate); on a state change only the decision panel, status chip colour, completed progress segment and new activity entries; the approval dock (overlay, interruptible).
- **Continuity**: sidebar width (CSS, 320ms; preference restored before first paint); one sliding indicator each for the sidebar view, queue selection and table row — painted beneath row content (z-0 vs z-1) so it never hides a row it crosses; approved/accepted requests leave the queue as the rest glide up; the decision panel's height follows its content; the completed stage settles and its check draws.
- **Navigation never animates**: switching view, switching request and opening/closing a request page swap content in place in one frame. Pane headers, search and filters never move or blank out; the sliding indicators carry the continuity. (An earlier pass faded and lifted new content in from opacity 0, which read as the interface bouncing; removed.) The table stays mounted, hidden and inert, under an open request so its scroll and ticked rows survive.
- **Never animates / snaps**: navigation (above); selection changes arriving < 160ms apart (indicators jump); keyboard-opened popovers and the dialog; returning focus; typing-driven resizes.
- **Scrolling**: lists scroll only themselves to reveal the selection, below sticky headers (`reveal()` in `unified-app.tsx`); no `scrollIntoView`, and every programmatic focus uses `preventScroll`.
- **Reduced motion**: CSS motion instant and no press scale; Motion drops all movement and layout animation, keeping only brief (≤ 0.16s) fades.

## Popovers and the calendar

- **One transient layer at a time** (`src/components/ui/popover.tsx`): pickers, sort and filter menus, the account menu and the date picker. Opening one by pointer or keyboard, or opening a dialog, closes the previous one. Page shortcuts (j/k, c, /, [) are ignored while one is open.
- **Top layer, no z-index**: each renders through the Popover API, portalled into the open dialog when there is one, so it is never behind a dialog or clipped by a scrolling or transformed ancestor. Placement opens on the side with room; fixed-height content (the calendar) opens where it fits whole.
- **Dismissal and focus**: Escape (one layer at a time, never the dialog underneath) and choosing a value return focus to the field; clicking elsewhere, scrolling what's behind or resizing closes it and leaves focus where the user went; Tab from a list moves on from its field.
- **Calendar** (`src/components/ui/date-picker.tsx`, unified only via `CalendarPickerContext`; A and B keep the native input): the browser's picker can't be styled or coordinated. Overlay surface like the other menus; selected date is the one accent fill, today is an accent numeral with a dot, other months and unavailable days are dimmed; always six rows. WAI-ARIA date picker dialog keyboard model; opens on the selected date or today; Tab is contained. Plain `yyyy-mm-dd` dates computed in UTC (`src/domain/calendar.ts`). No dependency: the vetted library list has no calendar, and the hard parts are the shared popover layer.

## Routes and experiments

- `/` is the application (Unified). Concepts A and B and the `/explore` index are development-only reference, gated by `EXPLORE_ENABLED` (`src/prototypes/explore-enabled.ts`).
- Experiments are not part of `main`. The activity (analytics) experiment — reviewed, not approved for integration — is preserved on the local branch `experiment/analytics`.

