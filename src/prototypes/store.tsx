"use client";

/**
 * PROTOTYPE ONLY — in-memory implementation of WorkspaceApi. State resets on
 * reload. Every mutation goes through the real domain workflow so the
 * prototypes exercise the same rules production will.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import {
  WorkspaceContext,
  type NewRequestInput,
  type TimelineItem,
  type WorkspaceApi,
} from "@/components/request/workspace-context";
import type { ActivityEvent, Comment, Request } from "@/domain/types";
import { requestKey } from "@/domain/types";
import { applyAction, type ApplyResult, type WorkflowAction } from "@/domain/workflow";
import {
  INITIAL_UNREAD,
  MEMBERS,
  PROTOTYPE_NOW,
  PROTOTYPE_TODAY,
  REQUEST_TYPES,
  SEED,
  WORKSPACE,
} from "./fixtures";

interface State {
  requests: Request[];
  events: ActivityEvent[];
  comments: Comment[];
  seq: number;
  meId: string;
  unread: string[];
}

function initialState(): State {
  return {
    requests: SEED.requests,
    events: SEED.events,
    comments: SEED.comments,
    seq: SEED.nextSeq,
    meId: "priya",
    unread: INITIAL_UNREAD,
  };
}

const loadedAt = typeof performance !== "undefined" ? performance.now() : 0;

/** The prototype clock starts at PROTOTYPE_NOW and advances in real time. */
function clock() {
  const elapsed = typeof performance !== "undefined" ? performance.now() - loadedAt : 0;
  return new Date(Date.parse(PROTOTYPE_NOW) + elapsed).toISOString();
}

export interface PrototypeExtras {
  setMe: (memberId: string) => void;
  isUnread: (requestId: string) => boolean;
  markRead: (requestId: string) => void;
  allEvents: ActivityEvent[];
  allComments: Comment[];
}

const ExtrasContext = createContext<PrototypeExtras | null>(null);

export function usePrototype() {
  const extras = useContext(ExtrasContext);
  if (!extras) throw new Error("usePrototype must be used inside PrototypeWorkspace");
  return extras;
}

export function PrototypeWorkspace({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  // Mutations validate against the latest state, even when called twice in one tick.
  const ref = useRef(state);

  const commit = useCallback((next: State) => {
    ref.current = next;
    setState(next);
  }, []);

  const perform = useCallback(
    (requestId: string, action: WorkflowAction): ApplyResult => {
      const current = ref.current;
      const request = current.requests.find((r) => r.id === requestId);
      if (!request) return { ok: false, error: "Request not found." };
      const me = MEMBERS.find((m) => m.id === current.meId)!;
      const now = clock();
      const result = applyAction(request, action, { id: me.id, role: me.role }, now);
      if (!result.ok || result.events.length === 0) return result;
      let seq = current.seq;
      const newEvents = result.events.map((payload) => ({
        id: `evt_${seq++}`,
        requestId,
        actorId: me.id,
        at: now,
        payload,
      }));
      commit({
        ...current,
        seq,
        requests: current.requests.map((r) => (r.id === requestId ? result.request : r)),
        events: [...current.events, ...newEvents],
      });
      return result;
    },
    [commit],
  );

  const comment = useCallback(
    (requestId: string, body: string) => {
      const current = ref.current;
      const now = clock();
      commit({
        ...current,
        seq: current.seq + 1,
        comments: [
          ...current.comments,
          { id: `cmt_${current.seq}`, requestId, authorId: current.meId, body, createdAt: now },
        ],
        requests: current.requests.map((r) => (r.id === requestId ? { ...r, updatedAt: now } : r)),
      });
    },
    [commit],
  );

  const create = useCallback(
    (input: NewRequestInput): Request => {
      const current = ref.current;
      const now = clock();
      const number = Math.max(...current.requests.map((r) => r.number)) + 1;
      const request: Request = {
        id: `req_${number}`,
        number,
        title: input.title,
        description: input.description,
        status: "triage",
        priority: input.priority,
        typeId: input.typeId,
        requesterId: current.meId,
        assigneeId: null,
        approverId: null,
        dueDate: input.dueDate,
        blocked: null,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
      };
      commit({
        ...current,
        seq: current.seq + 1,
        requests: [request, ...current.requests],
        events: [
          ...current.events,
          { id: `evt_${current.seq}`, requestId: request.id, actorId: current.meId, at: now, payload: { type: "created" } },
        ],
      });
      return request;
    },
    [commit],
  );

  const timelineIndex = useMemo(() => {
    const map = new Map<string, TimelineItem[]>();
    const add = (requestId: string, item: TimelineItem) => {
      const list = map.get(requestId);
      if (list) list.push(item);
      else map.set(requestId, [item]);
    };
    for (const event of state.events) add(event.requestId, { kind: "event", at: event.at, event });
    for (const c of state.comments) add(c.requestId, { kind: "comment", at: c.createdAt, comment: c });
    for (const list of map.values()) list.sort((a, b) => a.at.localeCompare(b.at));
    return map;
  }, [state.events, state.comments]);

  const api = useMemo<WorkspaceApi>(() => {
    const memberMap = new Map(MEMBERS.map((m) => [m.id, m]));
    const typeMap = new Map(REQUEST_TYPES.map((t) => [t.id, t]));
    const requestMap = new Map(state.requests.map((r) => [r.id, r]));
    return {
      workspace: WORKSPACE,
      members: MEMBERS,
      types: REQUEST_TYPES,
      requests: state.requests,
      me: memberMap.get(state.meId)!,
      now: PROTOTYPE_NOW,
      today: PROTOTYPE_TODAY,
      member: (id) => (id ? memberMap.get(id) : undefined),
      type: (id) => typeMap.get(id),
      request: (id) => requestMap.get(id),
      keyOf: (r) => requestKey(WORKSPACE, r),
      timeline: (id) => timelineIndex.get(id) ?? [],
      commentCount: (id) => (timelineIndex.get(id) ?? []).filter((i) => i.kind === "comment").length,
      perform,
      comment,
      create,
    };
  }, [state.requests, state.meId, timelineIndex, perform, comment, create]);

  const extras = useMemo<PrototypeExtras>(
    () => ({
      setMe: (memberId) => commit({ ...ref.current, meId: memberId }),
      isUnread: (id) => state.unread.includes(id),
      markRead: (id) => {
        if (!ref.current.unread.includes(id)) return;
        commit({ ...ref.current, unread: ref.current.unread.filter((u) => u !== id) });
      },
      allEvents: state.events,
      allComments: state.comments,
    }),
    [state.unread, state.events, state.comments, commit],
  );

  return (
    <WorkspaceContext.Provider value={api}>
      <ExtrasContext.Provider value={extras}>{children}</ExtrasContext.Provider>
    </WorkspaceContext.Provider>
  );
}
