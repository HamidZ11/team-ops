import { isOpen, type Request } from "./types";

/**
 * Inbox, My work, Approvals and the saved views are the same request list
 * with different filters. Adding a view means adding an entry here.
 */
export type ViewId =
  | "inbox"
  | "my_work"
  | "approvals"
  | "all"
  | "blocked"
  | "due_soon"
  | "closed";

export interface ViewContext {
  meId: string;
  /** `yyyy-mm-dd` for "today" in the workspace's timezone. */
  today: string;
}

export interface ViewDefinition {
  id: ViewId;
  label: string;
  description: string;
  emptyTitle: string;
  emptyBody: string;
  match: (request: Request, ctx: ViewContext) => boolean;
}

function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const VIEWS: Record<ViewId, ViewDefinition> = {
  inbox: {
    id: "inbox",
    label: "Inbox",
    description: "New requests waiting for an owner.",
    emptyTitle: "Inbox zero",
    emptyBody: "Every request has been accepted or declined.",
    match: (r) => r.status === "triage",
  },
  my_work: {
    id: "my_work",
    label: "My work",
    description: "Requests you own that aren't finished.",
    emptyTitle: "Nothing assigned to you",
    emptyBody: "Accepted requests you own will appear here.",
    match: (r, ctx) =>
      r.assigneeId === ctx.meId &&
      (r.status === "todo" || r.status === "in_progress" || r.status === "in_review"),
  },
  approvals: {
    id: "approvals",
    label: "Approvals",
    description: "Work waiting for your decision.",
    emptyTitle: "No decisions waiting",
    emptyBody: "When someone submits work for your approval, it appears here.",
    match: (r, ctx) => r.status === "in_review" && r.approverId === ctx.meId,
  },
  all: {
    id: "all",
    label: "All requests",
    description: "Every open request across the team.",
    emptyTitle: "No open requests",
    emptyBody: "New requests will appear here once they're submitted.",
    match: (r) => isOpen(r),
  },
  blocked: {
    id: "blocked",
    label: "Blocked",
    description: "Open work that is waiting on something outside the team.",
    emptyTitle: "Nothing is blocked",
    emptyBody: "Blocked requests and their reasons will appear here.",
    match: (r) => isOpen(r) && r.blocked !== null,
  },
  due_soon: {
    id: "due_soon",
    label: "Due this week",
    description: "Open requests overdue or due in the next 7 days.",
    emptyTitle: "Nothing due soon",
    emptyBody: "Requests due in the next 7 days will appear here.",
    match: (r, ctx) =>
      isOpen(r) && r.dueDate !== null && r.dueDate <= addDays(ctx.today, 7),
  },
  closed: {
    id: "closed",
    label: "Closed",
    description: "Completed and declined requests.",
    emptyTitle: "Nothing closed yet",
    emptyBody: "Finished requests will appear here.",
    match: (r) => r.status === "done" || r.status === "declined",
  },
};

export function isOverdue(request: Request, today: string) {
  return isOpen(request) && request.dueDate !== null && request.dueDate < today;
}
