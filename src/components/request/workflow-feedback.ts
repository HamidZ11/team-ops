"use client";

import { useEffect, type RefObject } from "react";
import { announce } from "@/components/ui/announcer";
import type { Member, Request } from "@/domain/types";
import type { ApplyResult, WorkflowAction } from "@/domain/workflow";
import { useWorkspace } from "./workspace-context";

/**
 * Workflow actions replace the button that triggered them (the next step
 * changes), so focus would otherwise fall to <body>. After a successful
 * action, the request's next-step heading takes focus on its next render.
 * Kept at module level because the panel usually remounts with the new state.
 */
let pendingFocus: string | null = null;

export function useNextStepFocus(requestId: string, ref: RefObject<HTMLElement | null>) {
  // Runs after every render of the panel; cheap when nothing is pending.
  useEffect(() => {
    if (pendingFocus !== requestId) return;
    const el = ref.current;
    // Some layouts render a second, hidden copy (e.g. an inline fallback). Let the visible one take focus.
    if (!el || el.getClientRects().length === 0) return;
    el.focus({ preventScroll: true });
    if (document.activeElement === el) pendingFocus = null;
  });
}

function describe(key: string, action: WorkflowAction, after: Request, member: (id: string | null) => Member | undefined) {
  const name = (id: string | null) => member(id)?.name;
  switch (action.type) {
    case "accept": {
      const approver = name(after.approverId);
      return `${key} accepted. Owner: ${name(after.assigneeId)}.${approver ? ` Approval: ${approver}.` : ""}`;
    }
    case "decline":
      return `${key} declined.`;
    case "start":
      return `${key} started.`;
    case "submit_for_review":
      return `${key} submitted to ${name(after.approverId)} for approval.`;
    case "complete":
      return `${key} marked done.`;
    case "approve":
      return `${key} approved.`;
    case "request_changes":
      return `Changes requested on ${key}. Sent back to ${name(after.assigneeId)}.`;
    case "block":
      return `${key} marked blocked.`;
    case "unblock":
      return `${key} unblocked.`;
    case "reopen":
      return `${key} reopened.`;
    default:
      return "";
  }
}

/**
 * Performs a workflow action, announces the outcome, and (by default) moves
 * focus to the updated next step. Property edits don't use this: they change
 * in place and keep focus on their own control.
 */
export function useWorkflowAction() {
  const api = useWorkspace();
  return (request: Request, action: WorkflowAction, options: { focus?: boolean } = {}): ApplyResult => {
    const result = api.perform(request.id, action);
    if (result.ok && result.events.length) {
      announce(describe(api.keyOf(request), action, result.request, (id) => api.member(id)));
      if (options.focus !== false) pendingFocus = request.id;
    }
    return result;
  };
}
