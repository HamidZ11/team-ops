import { PRIORITIES, type Priority, type Request, type RequestStatus } from "./types";
import { VIEWS, type ViewContext, type ViewId } from "./views";

export const UNASSIGNED = "__unassigned__";

export interface RequestFilters {
  typeId: string | null;
  /** Member id, UNASSIGNED, or null for anyone. */
  ownerId: string | null;
  priority: Priority | null;
  search: string;
}

export const EMPTY_FILTERS: RequestFilters = {
  typeId: null,
  ownerId: null,
  priority: null,
  search: "",
};

export type SortKey = "updated" | "created" | "priority" | "due";

export const SORT_LABELS: Record<SortKey, string> = {
  updated: "Last updated",
  created: "Newest",
  priority: "Priority",
  due: "Due date",
};

export function inView(requests: Request[], view: ViewId, ctx: ViewContext) {
  return requests.filter((r) => VIEWS[view].match(r, ctx));
}

export function applyFilters(
  requests: Request[],
  filters: RequestFilters,
  keyOf: (r: Request) => string,
) {
  const q = filters.search.trim().toLowerCase();
  return requests.filter((r) => {
    if (filters.typeId && r.typeId !== filters.typeId) return false;
    if (filters.priority && r.priority !== filters.priority) return false;
    if (filters.ownerId === UNASSIGNED && r.assigneeId !== null) return false;
    if (filters.ownerId && filters.ownerId !== UNASSIGNED && r.assigneeId !== filters.ownerId)
      return false;
    if (q) {
      const haystack = `${keyOf(r)} ${r.title} ${r.description}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

const rank = (p: Priority) => PRIORITIES.indexOf(p);

export function sortRequests(requests: Request[], sort: SortKey) {
  const list = [...requests];
  switch (sort) {
    case "updated":
      return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case "created":
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "priority":
      return list.sort(
        (a, b) => rank(a.priority) - rank(b.priority) || b.updatedAt.localeCompare(a.updatedAt),
      );
    case "due":
      return list.sort((a, b) => {
        if (a.dueDate === b.dueDate) return rank(a.priority) - rank(b.priority);
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }
}

export function countByStatus(requests: Request[]) {
  const counts: Partial<Record<RequestStatus, number>> = {};
  for (const r of requests) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}
