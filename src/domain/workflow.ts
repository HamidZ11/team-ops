import type {
  ActivityPayload,
  MemberRole,
  Priority,
  Request,
  RequestStatus,
} from "./types";

/**
 * The request workflow as a set of commands. UI never sets `status` directly;
 * it dispatches one of these, and `applyAction` decides whether it is allowed
 * and which history events it produces.
 */
export type WorkflowAction =
  | {
      type: "accept";
      assigneeId: string | null;
      priority: Priority;
      approverId: string | null;
    }
  | { type: "decline"; reason: string }
  | { type: "start" }
  | { type: "submit_for_review" }
  | { type: "complete" }
  | { type: "approve"; note?: string }
  | { type: "request_changes"; note: string }
  | { type: "block"; reason: string }
  | { type: "unblock" }
  | { type: "reopen" }
  | { type: "assign"; assigneeId: string | null }
  | { type: "set_approver"; approverId: string | null }
  | { type: "set_priority"; priority: Priority }
  | { type: "set_due_date"; dueDate: string | null };

export type ActionType = WorkflowAction["type"];

export interface Actor {
  id: string;
  role: MemberRole;
}

export type Guard = { ok: true } | { ok: false; reason: string };

const allow: Guard = { ok: true };
const deny = (reason: string): Guard => ({ ok: false, reason });

const TERMINAL: readonly RequestStatus[] = ["done", "declined"];

function isOwner(request: Request, actor: Actor) {
  return request.assigneeId === actor.id;
}

/** Whether `actor` may perform `type` on `request` right now, ignoring payload. */
export function can(request: Request, type: ActionType, actor: Actor): Guard {
  switch (type) {
    case "accept":
    case "decline":
      return request.status === "triage"
        ? allow
        : deny("Only requests in triage can be accepted or declined.");
    case "start":
      if (request.status !== "todo") return deny("This request isn't waiting to start.");
      return isOwner(request, actor) ? allow : deny("Only the owner can start work.");
    case "submit_for_review":
      if (request.status !== "in_progress") return deny("Work hasn't started.");
      if (!isOwner(request, actor)) return deny("Only the owner can submit for review.");
      if (!request.approverId) return deny("This request doesn't need approval.");
      if (request.blocked) return deny("Unblock the request before submitting it.");
      return allow;
    case "complete":
      if (request.status !== "in_progress") return deny("Work hasn't started.");
      if (!isOwner(request, actor)) return deny("Only the owner can complete this request.");
      if (request.approverId) return deny("This request needs approval before it's done.");
      if (request.blocked) return deny("Unblock the request before completing it.");
      return allow;
    case "approve":
    case "request_changes":
      if (request.status !== "in_review") return deny("Nothing is waiting for a decision.");
      return request.approverId === actor.id
        ? allow
        : deny("Only the named approver can decide.");
    case "block":
      if (request.status !== "todo" && request.status !== "in_progress")
        return deny("Only active work can be blocked.");
      if (request.blocked) return deny("Already blocked.");
      return isOwner(request, actor) || actor.role === "admin"
        ? allow
        : deny("Only the owner can mark this blocked.");
    case "unblock":
      if (!request.blocked) return deny("Not blocked.");
      return isOwner(request, actor) || actor.role === "admin"
        ? allow
        : deny("Only the owner can unblock this.");
    case "reopen":
      return TERMINAL.includes(request.status) ? allow : deny("This request is still open.");
    case "assign":
    case "set_approver":
    case "set_priority":
    case "set_due_date":
      return TERMINAL.includes(request.status)
        ? deny("Closed requests can't be edited. Reopen it first.")
        : allow;
  }
}

/**
 * The workflow actions this actor can take now, most important first.
 * Property edits (assign, priority…) are excluded; they are always inline.
 */
export function nextActions(request: Request, actor: Actor): ActionType[] {
  const order: ActionType[] = [
    "accept",
    "decline",
    "approve",
    "request_changes",
    "start",
    "submit_for_review",
    "complete",
    "unblock",
    "block",
    "reopen",
  ];
  return order.filter((type) => can(request, type, actor).ok);
}

export type ApplyResult =
  | { ok: true; request: Request; events: ActivityPayload[] }
  | { ok: false; error: string; field?: string };

export function applyAction(
  request: Request,
  action: WorkflowAction,
  actor: Actor,
  now: string,
): ApplyResult {
  const guard = can(request, action.type, actor);
  if (!guard.ok) return { ok: false, error: guard.reason };

  const touch = (patch: Partial<Request>): Request => ({
    ...request,
    ...patch,
    updatedAt: now,
  });
  const moved = (to: RequestStatus): ActivityPayload => ({
    type: "status_changed",
    from: request.status,
    to,
  });

  switch (action.type) {
    case "accept": {
      if (!action.assigneeId)
        return { ok: false, error: "Choose an owner before accepting.", field: "assignee" };
      if (action.approverId && action.approverId === action.assigneeId)
        return {
          ok: false,
          error: "The approver can't also be the owner.",
          field: "approver",
        };
      const priority = action.priority === "none" ? "medium" : action.priority;
      return {
        ok: true,
        request: touch({
          status: "todo",
          assigneeId: action.assigneeId,
          approverId: action.approverId,
          priority,
        }),
        events: [
          {
            type: "accepted",
            assigneeId: action.assigneeId,
            approverId: action.approverId,
            priority,
          },
        ],
      };
    }
    case "decline": {
      const reason = action.reason.trim();
      if (reason.length < 3)
        return { ok: false, error: "Add a short reason for the requester.", field: "reason" };
      return {
        ok: true,
        request: touch({ status: "declined", completedAt: now, blocked: null }),
        events: [{ type: "declined", reason }],
      };
    }
    case "start":
      return {
        ok: true,
        request: touch({ status: "in_progress" }),
        events: [moved("in_progress")],
      };
    case "submit_for_review":
      return {
        ok: true,
        request: touch({ status: "in_review" }),
        events: [moved("in_review")],
      };
    case "complete":
      return {
        ok: true,
        request: touch({ status: "done", completedAt: now }),
        events: [moved("done")],
      };
    case "approve":
      return {
        ok: true,
        request: touch({ status: "done", completedAt: now }),
        events: [{ type: "approved", note: action.note?.trim() || null }],
      };
    case "request_changes": {
      const note = action.note.trim();
      if (note.length < 3)
        return { ok: false, error: "Say what needs to change.", field: "note" };
      return {
        ok: true,
        request: touch({ status: "in_progress" }),
        events: [{ type: "changes_requested", note }],
      };
    }
    case "block": {
      const reason = action.reason.trim();
      if (reason.length < 3)
        return { ok: false, error: "Say what it's waiting on.", field: "reason" };
      return {
        ok: true,
        request: touch({ blocked: { reason, since: now, byId: actor.id } }),
        events: [{ type: "blocked", reason }],
      };
    }
    case "unblock":
      return {
        ok: true,
        request: touch({ blocked: null }),
        events: [{ type: "unblocked" }],
      };
    case "reopen": {
      const to: RequestStatus = request.assigneeId ? "todo" : "triage";
      return {
        ok: true,
        request: touch({ status: to, completedAt: null }),
        events: [moved(to)],
      };
    }
    case "assign": {
      if (action.assigneeId === request.assigneeId)
        return { ok: true, request, events: [] };
      if (action.assigneeId && action.assigneeId === request.approverId)
        return {
          ok: false,
          error: "The approver can't also be the owner.",
          field: "assignee",
        };
      if (!action.assigneeId && request.status !== "triage")
        return {
          ok: false,
          error: "Accepted work needs an owner. Reassign it instead.",
          field: "assignee",
        };
      return {
        ok: true,
        request: touch({ assigneeId: action.assigneeId }),
        events: [
          { type: "assignee_changed", from: request.assigneeId, to: action.assigneeId },
        ],
      };
    }
    case "set_approver": {
      if (action.approverId === request.approverId)
        return { ok: true, request, events: [] };
      if (action.approverId && action.approverId === request.assigneeId)
        return {
          ok: false,
          error: "The owner can't approve their own work.",
          field: "approver",
        };
      if (!action.approverId && request.status === "in_review")
        return {
          ok: false,
          error: "A decision is pending. Choose a different approver instead.",
          field: "approver",
        };
      return {
        ok: true,
        request: touch({ approverId: action.approverId }),
        events: [
          { type: "approver_changed", from: request.approverId, to: action.approverId },
        ],
      };
    }
    case "set_priority":
      if (action.priority === request.priority) return { ok: true, request, events: [] };
      return {
        ok: true,
        request: touch({ priority: action.priority }),
        events: [{ type: "priority_changed", from: request.priority, to: action.priority }],
      };
    case "set_due_date":
      if (action.dueDate === request.dueDate) return { ok: true, request, events: [] };
      return {
        ok: true,
        request: touch({ dueDate: action.dueDate }),
        events: [{ type: "due_date_changed", from: request.dueDate, to: action.dueDate }],
      };
  }
}

/** The ordered stages shown in progress indicators. */
export const STAGES: readonly RequestStatus[] = [
  "triage",
  "todo",
  "in_progress",
  "in_review",
  "done",
];
