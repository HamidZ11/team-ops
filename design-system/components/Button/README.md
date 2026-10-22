# Button

The one button: four variants, two heights and two square icon sizes, all medium-weight 13px with `radius-control` corners.

Hand-written from `src/components/ui/button.tsx`.

**Use**
- `primary` (`color-fg` fill, `color-canvas` label) for the single action the person most likely takes: Accept, Approve, Comment, New request. One per area. It is near-white, never blue.
- `secondary` (the default; `color-raised` with a `color-line` border) for everything else that acts.
- `ghost` for dismissals and toolbar actions that should recede: Cancel, Close, Clear.
- `danger` only for Decline and destructive confirmations; it is a tint of `color-danger`, not a solid red.
- `sm` (28px) in toolbars, rows and cards; `md` (32px) in pane headers and dialogs. `icon-sm` / `icon-md` for square icon buttons, which need an `aria-label`.

**Consumer provides** the label (and an optional leading 14px icon as a child), `onClick`, and any native button attribute. `type` defaults to `button`.

**States** Hover steps the fill up one surface. Press scales to 0.97 over 120ms (dropped under reduced motion). Disabled is 45% opacity and ignores the pointer — the composer's Comment button stays `secondary` and disabled until there is text, then turns `primary`.
