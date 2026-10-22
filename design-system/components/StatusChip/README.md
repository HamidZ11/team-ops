# StatusChip

A 22px tinted chip: the status glyph and label on 14% of the status colour, the label 68% of it mixed into white.

Hand-written from `src/components/request/glyphs.tsx` and `.status-chip` in `globals.css`. `BlockedChip` is the blocked marker from `src/components/request/properties.tsx`: a `Ban` icon and "Blocked" in `color-danger-fg` on 12% `color-danger`.

**Use** in the Status column, the Status property and anywhere a request's state is shown in a sentence-free place. Pass `label` to override the text (e.g. "Awaiting approval"). Put `BlockedChip` after the status chip, never instead of it — a blocked request keeps its place in the workflow. Don't use chips as tags or filters; they mean status only.

**Motion** When a request changes state the chip cross-fades its colours over 150ms.
