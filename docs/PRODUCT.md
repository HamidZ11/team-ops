# Team Operations Workspace — product structure

Status: Pass 1 proposal. Nothing here is built as production software yet.

## The job

A small team receives internal requests (access, purchases, equipment, vendors,
facilities, finance), decides what to take on, gives each piece of work one
owner, gets sign-off where it is needed, and can see afterwards what happened.

Every screen should answer one of six questions: what needs attention, who owns
it, what is in progress, what is waiting for approval, what is blocked, what
happened before.

## Workflow: seven proposed stages → five states and a flag

The brief proposes Request → Triage → Assignment → In progress → Review →
Approval → Completion. Three of those are not states:

| Proposed stage | Decision | Why |
| --- | --- | --- |
| Request | `triage` | A new request *is* untriaged work. No separate "submitted" state. |
| Triage + Assignment | one action: **Accept** | Accepting without an owner creates orphaned work. Accept requires an owner. |
| Review + Approval | one state: `in_review` | For a small team these are the same moment: one named person decides. |
| Approval | optional, per request | Most requests do not need sign-off. Forcing it on everything trains people to rubber-stamp. |
| Blocked | a **flag**, not a state | Blocked work is still "in progress" or "to do"; the flag records *why* and *since when* without losing where it is. |

```text
            accept (owner required)        start            submit (approver set)
 triage ─────────────────────────▶ todo ─────────▶ in_progress ─────────────────▶ in_review
   │                                                  │   ▲                          │    │
   │ decline (reason required)        complete        │   └── request changes ───────┘    │ approve
   ▼                               (no approver) ─────┴──────────────▶ done ◀──────────────┘
 declined ──────────── reopen ───────────▶ todo / triage ◀──── reopen ────┘
```

Guards that make transitions reliable (implemented in `src/domain/workflow.ts`):

- Only the **owner** can start, block, submit or complete their work.
- Only the named **approver** can approve or request changes. The approver
  cannot be the owner (separation of duties).
- Declining and requesting changes require a written reason; it goes into the history.
- Every transition writes an immutable activity event.

## Core entities (minimum)

| Entity | Fields that matter now | Notes |
| --- | --- | --- |
| Workspace | name, key prefix (`OPS`) | One team. Multi-workspace later. |
| Member | name, email, role (`admin` / `member`) | "Approver" is a per-request relationship, not a role. |
| Request | number, title, description, type, status, priority, requester, owner, approver?, due date?, blocked {reason, since}? | The core object. Human key `OPS-1042`. |
| Request type | name, icon | Configurable list; drives sidebar grouping and filtering. |
| Comment | request, author, body, created | Its own table: comments get edited and deleted, events don't. |
| Activity event | request, actor, type, payload, at | Append-only. The request timeline merges comments and events. |

Deliberately absent: multiple assignees, subtasks, custom fields, SLAs,
automations, attachments, notifications, request forms. Each is a real need at
some point; none is needed to prove the core loop.

## Views are filters, not features

Inbox, My work, Approvals, and Requests are not four features. They are one
request list with four saved filters:

| View | Filter |
| --- | --- |
| Inbox | `status = triage` |
| My work | `owner = me AND status IN (todo, in_progress, in_review)` |
| Approvals | `approver = me AND status = in_review` |
| Requests | everything, with search and filters |
| Blocked / Due this week | saved filters on the same list |

Building one list well, with selection, keyboard navigation, filters and empty
states, is cheaper and more consistent than building four screens.

## Challenged areas

- **Overview**: risks becoming KPI cards with no decision behind them. The
  questions it should answer (what needs attention, blocked, waiting on
  approval) are already answered by Inbox, Approvals and Blocked. Concept A
  tests a compact alternative: a trend strip above the request table.
  A standalone Overview is deferred.
- **Activity (global)**: each request's timeline gives most of the value. A
  global feed is cheap to derive from events, so Concept B includes one to test
  whether people use it. Concept A leaves it out.
- **Request detail as a separate page**: both concepts open detail beside the
  list so the queue stays in context. A full page can come later for linking and
  printing.

## First vertical slice (after a concept is chosen)

1. Create a request (title, description, type, optional priority/due).
2. Triage in Inbox: accept with owner, priority and optional approver; or decline with reason.
3. Owner starts, flags/unflags blocked, submits for review (or completes if no approval).
4. Approver approves or requests changes with a note.
5. Comment on any request; every action appears in its history.
6. Inbox, My work, Approvals, All requests: search and filter on one list.

Persistence (Postgres), auth, membership and roles come with this slice. Everything
else waits.

## Technical foundation

| Choice | Reason |
| --- | --- |
| Next.js 16 (App Router), React 19, TypeScript | Preferred stack; matches sibling projects. |
| Tailwind CSS 4 with CSS-variable tokens | Preferred; tokens in `src/app/globals.css`. |
| pnpm | Matches sibling projects. |
| `lucide-react` (only added dependency) | One consistent stroke icon set, tree-shaken. Status and priority glyphs are custom SVG. |
| No UI kit, no chart library | Charts here are one step line; tables are native `<table>`. Native `<dialog>` handles modal focus. |
| Later: Postgres + a typed query layer, a headless primitive library for menus/popovers | Choose when the slice needs them; do not install for the prototype. |

### Code boundaries

```text
src/domain/       production-intended, framework-free: types, workflow state machine, views, formatting
src/components/   shared UI primitives and request building blocks
src/prototypes/   PROTOTYPE ONLY: fictional fixtures, in-memory store, concept shells
src/app/prototypes/   isolated dev routes (/prototypes/console, /prototypes/workspace)
```

Nothing outside `src/prototypes` and `src/app/prototypes` imports fixture data.
