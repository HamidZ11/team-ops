# Timeline

A request's history: comments as `color-panel` cards with a 24px avatar and 14px reading text, events as one 12px line with a small icon, all on a 1px `color-line` spine.

Hand-written from `src/components/request/timeline.tsx`.

**Use** below the description in the request's reading column, oldest first, comments and events merged. Events name the actor in medium `color-fg` and say what happened in `color-fg-2` ("requested changes", "marked this blocked"), then " · " and a relative time in `color-fg-3`. A reason quotes under the event with a 2px `color-line-strong` left rule. @mentions are medium `color-accent-fg`. Event icons are 12px `color-fg-2`; requested changes uses `color-st-review`, blocked `color-danger-fg`.

**Consumer provides** `items`: `{kind: "comment", author, at, body}` or `{kind: "event", actor, text, icon, iconColor?, at, note?}`, and `background` (the surface it sits on, so avatar and icon rings cut the spine cleanly; default `color-canvas`).

**Motion in the app** A new entry rises 6px and fades in over 220ms; nothing else in the timeline moves.
