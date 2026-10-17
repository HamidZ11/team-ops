"use client";

import { createContext, useContext } from "react";
import type {
  ActivityEvent,
  Comment,
  Member,
  Priority,
  Request,
  RequestType,
  Workspace,
} from "@/domain/types";
import type { ApplyResult, WorkflowAction } from "@/domain/workflow";

export type TimelineItem =
  | { kind: "comment"; at: string; comment: Comment }
  | { kind: "event"; at: string; event: ActivityEvent };

export interface NewRequestInput {
  title: string;
  description: string;
  typeId: string;
  priority: Priority;
  dueDate: string | null;
}

/**
 * What request UI needs from its host. The prototypes implement this with an
 * in-memory store; production will implement it with server data and mutations.
 */
export interface WorkspaceApi {
  workspace: Workspace;
  members: Member[];
  types: RequestType[];
  requests: Request[];
  me: Member;
  /** Render-time "now" (ISO). */
  now: string;
  /** `yyyy-mm-dd` in the workspace timezone. */
  today: string;
  member: (id: string | null | undefined) => Member | undefined;
  type: (id: string) => RequestType | undefined;
  request: (id: string) => Request | undefined;
  keyOf: (request: Request) => string;
  timeline: (requestId: string) => TimelineItem[];
  commentCount: (requestId: string) => number;
  perform: (requestId: string, action: WorkflowAction) => ApplyResult;
  comment: (requestId: string, body: string) => void;
  create: (input: NewRequestInput) => Request;
}

export const WorkspaceContext = createContext<WorkspaceApi | null>(null);

export function useWorkspace() {
  const api = useContext(WorkspaceContext);
  if (!api) throw new Error("useWorkspace must be used inside a workspace provider");
  return api;
}
