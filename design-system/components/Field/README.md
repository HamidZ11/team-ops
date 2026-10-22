# Field

The text input and textarea: `color-canvas` fill, `color-line` border, 6px × 10px padding, 13px text.

Hand-written from `.field` in `src/app/globals.css`, as used in `src/components/request/new-request-dialog.tsx` and `next-step.tsx`.

**Use** for every free-text entry: request title, description, decline and change-request reasons. Put a 12px medium `color-fg-2` label 8px above it. Placeholders ask the useful question ("Be specific so it can be fixed in one pass"). `multiline` gives a textarea that grows with its content from 64px to 240px.

**Consumer provides** `label`, `value`/`onChange` (or `defaultValue`), `placeholder`, `multiline`, and `error` (or `invalid`) — an error message sits 8px below in `color-danger-fg` with `role="alert"`.

**States** Hover: `color-line-strong` border. Focus: accent-mixed border with a 3px accent halo at 22% (no outline). Invalid: danger mixed into the border.
