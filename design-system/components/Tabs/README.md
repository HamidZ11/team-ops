# Tabs

Status tabs for the tray: 40px tall, 13px labels with a 12px status glyph and a count pill; the selected tab has a 2px `color-fg` underline.

Hand-written from the status tablist in `src/prototypes/unified/table-view.tsx`.

**Use** only inside a `Tray`, to split a table by status. Counts are tabular `text-meta` on `color-raised` (`color-selected` when active). Unselected labels are `color-fg-2`.

**Consumer provides** `tabs` (`{id, label?, status?, count?}`), `value`/`onChange` (or `defaultValue`).
