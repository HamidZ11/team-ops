# WorkflowStepper

Where a request sits in Triage → To do → In progress → Approval → Done, in one 12px line: completed stages get a small `color-fg-4` check, the current stage its status glyph in medium `color-fg`, later stages an empty ring.

Hand-written from `src/components/request/stepper.tsx`.

**Use** in the state block under the request title. A request that skips approval shows "No approval" struck through on a dashed ring. Blocked replaces the current glyph with a red `Ban` and adds "· Blocked". Declined collapses to Triage — Declined. Connectors are 1px `color-line-strong`, `color-fg-4` once passed.

**Consumer provides** `status`, `needsApproval` (false when no approver is set), `blocked`.

**Motion in the app** The segment an action completes fills left to right over 280ms; the newly reached stage settles in and Done's check draws itself.
