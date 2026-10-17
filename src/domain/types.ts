export const REQUEST_STATUSES = [
  "triage",
  "todo",
  "in_progress",
  "in_review",
  "done",
  "declined",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const PRIORITIES = ["urgent", "high", "medium", "low", "none"] as const;
export type Priority = (typeof PRIORITIES)[number];

export type MemberRole = "admin" | "member";

export interface Member {
  id: string;
  name: string;
  email: string;
  title: string;
  role: MemberRole;
}

export interface RequestType {
  id: string;
  name: string;
  /** Key into the icon map in the UI layer; the domain stays icon-agnostic. */
  icon: string;
}

export interface BlockedState {
  reason: string;
  since: string;
  byId: string;
}

export interface Request {
  id: string;
  /** Per-workspace sequence number; rendered as `${prefix}-${number}`. */
  number: number;
  title: string;
  description: string;
  status: RequestStatus;
  priority: Priority;
  typeId: string;
  requesterId: string;
  assigneeId: string | null;
  approverId: string | null;
  /** Calendar date, `yyyy-mm-dd`. */
  dueDate: string | null;
  blocked: BlockedState | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Comment {
  id: string;
  requestId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export type ActivityPayload =
  | { type: "created" }
  | {
      type: "accepted";
      assigneeId: string;
      approverId: string | null;
      priority: Priority;
    }
  | { type: "declined"; reason: string }
  | { type: "status_changed"; from: RequestStatus; to: RequestStatus }
  | { type: "assignee_changed"; from: string | null; to: string | null }
  | { type: "approver_changed"; from: string | null; to: string | null }
  | { type: "priority_changed"; from: Priority; to: Priority }
  | { type: "due_date_changed"; from: string | null; to: string | null }
  | { type: "approved"; note: string | null }
  | { type: "changes_requested"; note: string }
  | { type: "blocked"; reason: string }
  | { type: "unblocked" };

export interface ActivityEvent {
  id: string;
  requestId: string;
  actorId: string;
  at: string;
  payload: ActivityPayload;
}

export interface Workspace {
  id: string;
  name: string;
  keyPrefix: string;
}

export function requestKey(workspace: Workspace, request: Request) {
  return `${workspace.keyPrefix}-${request.number}`;
}

export const OPEN_STATUSES: readonly RequestStatus[] = [
  "triage",
  "todo",
  "in_progress",
  "in_review",
];

export function isOpen(request: Request) {
  return OPEN_STATUSES.includes(request.status);
}
