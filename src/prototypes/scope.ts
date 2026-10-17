import type { WorkspaceApi } from "@/components/request/workspace-context";
import { inView } from "@/domain/query";
import { isOpen, type Request } from "@/domain/types";
import { VIEWS, type ViewContext, type ViewId } from "@/domain/views";

/** What the navigation has selected: a saved view, a request type, or a person's open work. */
export type Scope =
  | { kind: "view"; id: ViewId }
  | { kind: "type"; id: string }
  | { kind: "member"; id: string };

export function sameScope(a: Scope, b: Scope) {
  return a.kind === b.kind && a.id === b.id;
}

export function scopeRequests(requests: Request[], scope: Scope, ctx: ViewContext) {
  switch (scope.kind) {
    case "view":
      return inView(requests, scope.id, ctx);
    case "type":
      return requests.filter((r) => isOpen(r) && r.typeId === scope.id);
    case "member":
      return requests.filter((r) => isOpen(r) && r.assigneeId === scope.id);
  }
}

export function scopeCopy(scope: Scope, api: WorkspaceApi) {
  switch (scope.kind) {
    case "view":
      return VIEWS[scope.id];
    case "type": {
      const name = api.type(scope.id)?.name ?? "Type";
      return {
        label: name,
        description: `Open ${name.toLowerCase()} requests.`,
        emptyTitle: `No open ${name.toLowerCase()} requests`,
        emptyBody: "New requests of this type will appear here.",
      };
    }
    case "member": {
      const member = api.member(scope.id);
      const name = member?.name ?? "Member";
      return {
        label: name,
        description: `Open requests owned by ${name}.`,
        emptyTitle: `${name.split(" ")[0]} has no open requests`,
        emptyBody: "Assign work from the inbox to balance the load.",
      };
    }
  }
}

export function encodeScope(scope: Scope) {
  return `${scope.kind}:${scope.id}`;
}

export function decodeScope(value: string | null, fallback: Scope): Scope {
  if (!value) return fallback;
  const [kind, id] = value.split(":");
  if (kind === "view" && id in VIEWS) return { kind, id: id as ViewId };
  if ((kind === "type" || kind === "member") && id) return { kind, id };
  return fallback;
}
