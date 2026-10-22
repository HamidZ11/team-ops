# Checkbox

A 14px square checkbox with 4px corners that fills with `color-accent` and a white check when ticked.

Hand-written from `.checkbox` in `src/app/globals.css`.

**Use** for row selection in tables and "select all" in the header (indeterminate when some rows are ticked). Ticking rows reveals the bulk bar (Assign, Priority). Not for settings toggles — the product has none.

**Consumer provides** native checkbox props, an optional `label`, and `indeterminate`. A ticked table row also shows a 2px `color-accent` marker on its left edge.
