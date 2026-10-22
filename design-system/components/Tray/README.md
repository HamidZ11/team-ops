# Tray

The frame for tables: an outer `color-shell` tray (`radius-tray`, 4px inset) holding status `Tabs`, with an inset `color-panel` panel (`radius-panel`, `color-line` border) that holds an optional 44px toolbar and the data.

Hand-written from the tray in `src/prototypes/unified/table-view.tsx`.

**Use** for every table view — All requests, saved views, request types. One tray per pane; it fills the pane below the header and filter row with 20px side and bottom margins. Don't nest trays or put cards inside one.

**Consumer provides** `label`, `tabs` (passed to `Tabs`), `toolbar` (sort, counts, the bulk bar when rows are ticked) and the table or `EmptyState` as children.
