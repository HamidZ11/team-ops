# StatusIcon

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
