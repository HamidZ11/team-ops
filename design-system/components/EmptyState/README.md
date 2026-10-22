# EmptyState

A centred title and one sentence for a list with nothing in it, with an optional action.

Hand-written from `EmptyState` in `src/prototypes/unified/table-view.tsx`.

**Use** whenever a queue, table or filter result is empty. Title: 13px medium `color-fg`, a short fact ("No decisions waiting", "No open requests"). Body: 12px `color-fg-3`, at most 320px, saying what will appear here or how to get results ("Requests due in the next 7 days will appear here."). No illustrations.

**Consumer provides** `title`, `body`, and an optional `action` (usually a secondary `Button`).
