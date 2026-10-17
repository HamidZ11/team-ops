# Team Ops

A workspace for small teams to triage internal requests, give each one an owner,
get sign-off where needed, and keep a history of what happened.

Status: design exploration. Two application-shell concepts run on the same domain
workflow and fictional data. No persistence, auth or backend yet.

## Run

```sh
pnpm install
pnpm dev
```

- `/`: Meridian — the Unified application (A's shell and table, B's queue and request workspace). `/prototypes/unified` redirects here.

Development only (404 in production builds unless `MERIDIAN_EXPLORE=1`):

- `/explore`: index of the design exploration
- Experiments are kept off `main` on their own branches (for example `experiment/analytics`).
- `/prototypes/console`: Concept A, operations console (table-first)
- `/prototypes/workspace`: Concept B, collaborative workspace (queue + inspector)

On those routes, switch with the picker at the top or keys `1`–`3`. Add `?capture=1` to hide it everywhere.
In either concept, use the account control (sidebar footer in A, avatar in the rail in B) to
view the prototype as another person and see how next steps change.

Keyboard: `j`/`k` move between requests, `Enter` opens a table row, `Esc` closes or goes back, `c` new request, `/` search, `[` hides or shows the sidebar (Unified).

Motion review: open `docs/review/motion/index.html` for before/after recordings with slow-motion playback. Its navigation clips (request page push, view and request settle-in) predate the interaction fixes, which removed those transitions — see `docs/review/fixes/index.html`.

## Layout

```text
docs/PRODUCT.md        workflow, entities, first slice, technical foundation
docs/DESIGN.md         visual direction and tokens
docs/review/           1440px and 390px captures of both concepts
src/domain/            framework-free types, workflow state machine, views, queries, formatting
src/components/        UI primitives and shared request components
src/prototypes/        PROTOTYPE ONLY: fixtures, in-memory store, concept shells (console, workspace, unified)
src/app/prototypes/    isolated routes for the concepts
```
