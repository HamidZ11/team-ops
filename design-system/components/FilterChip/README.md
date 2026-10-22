# FilterChip

A 28px filter trigger: icon, label, and an up-down chevron. When set it shows "Label: value" on a raised fill.

Hand-written from `FilterPicker` in `src/prototypes/unified/table-view.tsx`.

**Use** in the toolbar row under the pane header, after search. Clicking opens a `Menu` whose first option is "Any …". Resting: `color-shell` fill, `color-line` border, `color-fg-2` text. Set: `color-raised`, `color-line-strong`, `color-fg`, the label in `color-fg-3`.

**Consumer provides** `icon` (a Lucide name or node), `label`, `value` (empty for unset) and `onClick` to open the menu.
