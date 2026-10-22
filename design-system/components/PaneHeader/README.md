# PaneHeader

The 48px bar that starts every pane, with a bottom `color-line` rule: a 24px icon tile, the 15px medium title, a count, an optional description and right-aligned actions.

Hand-written from `PaneHeader` and `ViewHeader` in `src/prototypes/unified/view-header.tsx`.

**Use** at the top of the sidebar, queue, table and request panes so all headers share one baseline. Padding is 20px (16px on mobile). Never move or blank the header when the content below changes.

**Consumer provides** `icon`, `title`, `count`, `description`, and actions as children.
