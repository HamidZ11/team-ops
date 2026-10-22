# NavItem

A 32px sidebar row: 15px icon, label and an optional count or unread badge. The active row sits on `color-selected`.

Hand-written from `NavItem` in `src/prototypes/unified/sidebar.tsx`.

**Use** in the 220px sidebar, grouped under Work (Inbox, My work, Approvals), Views and Types, with New request at the top. Section labels are 12px `color-fg-3`, sentence case, 20px above the group. Counts are 12px tabular `color-fg-3`; Inbox's unread count is an 18px `color-accent` pill at 18% with `color-accent-fg` text.

**Consumer provides** `icon`, `label`, `active`, `count` or `unread` (or a custom `trailing` node), `onClick`.

**Motion** In the app one shared indicator slides beneath the rows to the chosen view; navigation itself never animates.
