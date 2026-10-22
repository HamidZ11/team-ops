# NextStep

The card that says what happens next and what *you* can do about it: a status glyph, a 13px medium title, optional meta on the right, one line of `color-fg-2` body and the actions.

Hand-written from `NextStepCard` in `src/components/request/next-step.tsx`, with `.tinted-card` from `globals.css`.

**Use** once per request, in the state block under the stepper. Tint it toward the status (`emphasis`) only when the current person must act — triage, an approval they owe — and toward `color-danger` (`tone: "danger"`) when blocked. Otherwise it stays a plain `color-panel` card ("Waiting on Lena for approval"). The title is the situation in the person's terms; the body explains the rule. One primary action at most.

**Consumer provides** `title`, `body`, `meta`, `status` or `icon`, `tone`, `emphasis`, and `actions` (buttons). Reasons for declining, blocking or requesting changes go in a `Field` inside the card (children).

**In the app** When this card scrolls out of view and the decision is yours, a compact decision dock appears above the composer.
