# Composer

The comment box pinned under the timeline: an auto-growing textarea (40–200px) on `color-panel` with `radius-panel`, a ⌘ ↵ "to send" hint and the Comment button.

Hand-written from `src/components/request/composer.tsx`.

**Use** once, pinned at the bottom of the request's reading column. Placeholder "Leave a comment…". The Comment button is a disabled `secondary` while empty and becomes `primary` once there is text. ⌘/Ctrl + Enter sends. The border goes `color-line-strong` while focused; the textarea itself shows no outline.

**Consumer provides** `onSubmit(body)`, `placeholder`, `submitLabel`, `defaultValue`.
