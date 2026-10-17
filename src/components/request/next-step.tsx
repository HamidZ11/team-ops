"use client";

import { ArrowRight, Ban, Check, ChevronDown, RotateCcw } from "lucide-react";
import { createContext, useContext, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { firstName, relativeTimeLong, shortDate } from "@/domain/format";
import type { ActivityEvent, Priority, Request } from "@/domain/types";
import { nextActions, type WorkflowAction } from "@/domain/workflow";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { PRIORITY_META, PriorityIcon, StatusIcon, statusStyle } from "./glyphs";
import { MemberPicker, PriorityPicker } from "./pickers";
import { useOpenLoad } from "./properties";
import { useNextStepFocus, useWorkflowAction } from "./workflow-feedback";
import { useWorkspace } from "./workspace-context";

type Mode = "idle" | "decline" | "block" | "changes";

/** Embedded steps drop their own frame and sit inside a parent panel. */
const EmbeddedContext = createContext(false);
/** Which request the panel belongs to, so its heading can take focus after an action. */
const RequestIdContext = createContext("");

/**
 * The one thing that should happen next on this request, for the current
 * person. Everything else about the request is a property, not an action.
 * Embedded steps also adapt to their width: from 480px of content, triage
 * fields sit in one row and the body aligns with the title.
 */
export function NextStep({
  request,
  className,
  embedded = false,
  openChanges = 0,
}: {
  request: Request;
  className?: string;
  embedded?: boolean;
  /** Increment to open the request-changes form from elsewhere (e.g. a decision dock). */
  openChanges?: number;
}) {
  return (
    <EmbeddedContext.Provider value={embedded}>
      <RequestIdContext.Provider value={request.id}>
        <NextStepInner
          key={`${request.id}:${request.status}:${openChanges}`}
          request={request}
          className={className}
          initialMode={openChanges > 0 ? "changes" : "idle"}
        />
      </RequestIdContext.Provider>
    </EmbeddedContext.Provider>
  );
}

function lastEvent(events: ActivityEvent[], predicate: (e: ActivityEvent) => boolean) {
  for (let i = events.length - 1; i >= 0; i--) if (predicate(events[i])) return events[i];
  return undefined;
}

function NextStepInner({
  request,
  className,
  initialMode,
}: {
  request: Request;
  className?: string;
  initialMode: Mode;
}) {
  const api = useWorkspace();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [text, setText] = useState("");

  const actor = { id: api.me.id, role: api.me.role };
  const actions = nextActions(request, actor);
  const owner = api.member(request.assigneeId);
  const approver = api.member(request.approverId);
  const requester = api.member(request.requesterId);
  const events = api
    .timeline(request.id)
    .flatMap((item) => (item.kind === "event" ? [item.event] : []));
  const isMine = request.assigneeId === api.me.id;
  const perform = useWorkflowAction();

  function run(action: WorkflowAction) {
    const result = perform(request, action);
    if (!result.ok) {
      setError({ message: result.error, field: result.field });
      return false;
    }
    setMode("idle");
    setText("");
    setError(null);
    return true;
  }

  const textForm = (opts: {
    label: string;
    placeholder: string;
    submit: string;
    variant?: "primary" | "danger" | "secondary";
    onSubmit: () => void;
  }) => (
    <form
      className="mt-3 flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        opts.onSubmit();
      }}
    >
      <label className="text-meta font-medium text-fg-2" htmlFor={`${request.id}-${mode}`}>
        {opts.label}
      </label>
      <textarea
        id={`${request.id}-${mode}`}
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={opts.placeholder}
        aria-invalid={error ? true : undefined}
        className="field"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            opts.onSubmit();
          }
          if (e.key === "Escape") {
            e.stopPropagation();
            setMode("idle");
            setError(null);
          }
        }}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant={opts.variant ?? "primary"}>
          {opts.submit}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setMode("idle");
            setError(null);
            setText("");
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  const blockButton = actions.includes("block") ? (
    <Button variant="ghost" onClick={() => setMode("block")}>
      <Ban size={14} aria-hidden />
      Mark blocked
    </Button>
  ) : null;

  // Blocked work: the reason is the most important fact on the page.
  if (request.blocked && (request.status === "todo" || request.status === "in_progress")) {
    const by = api.member(request.blocked.byId);
    return (
      <Shell
        className={className}
        tone="danger"
        icon={<Ban size={14} className="mt-0.5 text-danger-fg" aria-hidden />}
        title="Blocked"
        meta={`${relativeTimeLong(request.blocked.since, api.now)}${by ? ` · ${firstName(by.name)}` : ""}`}
        body={<span className="text-fg">{request.blocked.reason}</span>}
        error={error?.message}
      >
        {actions.includes("unblock") ? (
          <Actions>
            <Button onClick={() => run({ type: "unblock" })}>
              <RotateCcw size={14} aria-hidden />
              Unblock
            </Button>
          </Actions>
        ) : null}
      </Shell>
    );
  }

  switch (request.status) {
    case "triage":
      return (
        <TriageStep
          request={request}
          className={className}
          mode={mode}
          setMode={setMode}
          error={error}
          setError={setError}
          textForm={textForm}
          text={text}
          requesterName={requester ? firstName(requester.name) : "the requester"}
        />
      );

    case "todo":
      return (
        <Shell
          className={className}
          status="todo"
          title={isMine ? "Ready to start" : `Waiting for ${owner ? firstName(owner.name) : "an owner"} to start`}
          meta={acceptedMeta(events, api.now)}
          body={
            isMine
              ? "Start when you pick this up so the team can see it's moving."
              : approver
                ? `${approver.name} approves it when the work is done.`
                : "No approval needed. The owner closes it when it's done."
          }
          error={error?.message}
        >
          {mode === "block" ? (
            textForm({
              label: "What is it waiting on?",
              placeholder: "e.g. Supplier hasn't confirmed delivery date",
              submit: "Mark blocked",
              variant: "secondary",
              onSubmit: () => run({ type: "block", reason: text }),
            })
          ) : actions.length ? (
            <Actions>
              {actions.includes("start") ? (
                <Button variant="primary" onClick={() => run({ type: "start" })}>
                  Start work
                </Button>
              ) : null}
              {blockButton}
            </Actions>
          ) : null}
        </Shell>
      );

    case "in_progress": {
      const changes = lastEvent(events, (e) => e.payload.type === "changes_requested");
      const changesNote =
        changes && changes.payload.type === "changes_requested" ? changes.payload.note : null;
      return (
        <Shell
          className={className}
          status="in_progress"
          title={
            isMine
              ? approver
                ? `Submit to ${firstName(approver.name)} when it's ready`
                : "Mark done when it's finished"
              : `In progress with ${owner ? firstName(owner.name) : "nobody"}`
          }
          meta={startedMeta(events, api.now)}
          body={
            changesNote ? (
              <span>
                <span className="text-fg-2">Changes requested: </span>
                <span className="text-fg">{changesNote}</span>
              </span>
            ) : approver ? (
              `Needs approval from ${approver.name}.`
            ) : (
              "No approval needed."
            )
          }
          error={error?.message}
        >
          {mode === "block" ? (
            textForm({
              label: "What is it waiting on?",
              placeholder: "e.g. Waiting on the vendor's countersigned contract",
              submit: "Mark blocked",
              variant: "secondary",
              onSubmit: () => run({ type: "block", reason: text }),
            })
          ) : actions.length ? (
            <Actions>
              {actions.includes("submit_for_review") ? (
                <Button variant="primary" onClick={() => run({ type: "submit_for_review" })}>
                  Submit for review
                  <ArrowRight size={14} aria-hidden />
                </Button>
              ) : null}
              {actions.includes("complete") ? (
                <Button variant="primary" onClick={() => run({ type: "complete" })}>
                  <Check size={14} aria-hidden />
                  Mark done
                </Button>
              ) : null}
              {blockButton}
            </Actions>
          ) : null}
        </Shell>
      );
    }

    case "in_review": {
      const submitted = lastEvent(
        events,
        (e) => e.payload.type === "status_changed" && e.payload.to === "in_review",
      );
      const meta = submitted ? `Submitted ${relativeTimeLong(submitted.at, api.now)}` : undefined;
      if (actions.includes("approve")) {
        return (
          <Shell
            className={className}
            status="in_review"
            emphasis
            title="Your approval is needed"
            meta={meta}
            body={`${owner?.name ?? "The owner"} submitted this for your decision.`}
            error={error?.message}
          >
            {mode === "changes" ? (
              textForm({
                label: `What should ${owner ? firstName(owner.name) : "they"} change?`,
                placeholder: "Be specific so it can be fixed in one pass",
                submit: `Send back${owner ? ` to ${firstName(owner.name)}` : ""}`,
                variant: "secondary",
                onSubmit: () => run({ type: "request_changes", note: text }),
              })
            ) : (
              <Actions>
                <Button variant="primary" onClick={() => run({ type: "approve" })}>
                  <Check size={14} aria-hidden />
                  Approve
                </Button>
                <Button onClick={() => setMode("changes")}>Request changes</Button>
              </Actions>
            )}
          </Shell>
        );
      }
      return (
        <Shell
          className={className}
          status="in_review"
          title={`Waiting on ${approver ? firstName(approver.name) : "the approver"} for approval`}
          meta={meta}
          body={
            isMine
              ? "Nothing to do until they decide. Changes come back to you with a note."
              : `${owner?.name ?? "The owner"} has submitted the work.`
          }
        />
      );
    }

    case "done": {
      const approved = lastEvent(events, (e) => e.payload.type === "approved");
      const approvedBy = approved ? api.member(approved.actorId) : undefined;
      return (
        <Shell
          className={className}
          status="done"
          title={`Completed ${request.completedAt ? shortDate(request.completedAt) : ""}`}
          body={approvedBy ? `Approved by ${approvedBy.name}.` : "Closed without approval."}
          error={error?.message}
        >
          <Actions>
            <Button variant="ghost" onClick={() => run({ type: "reopen" })}>
              <RotateCcw size={14} aria-hidden />
              Reopen
            </Button>
          </Actions>
        </Shell>
      );
    }

    case "declined": {
      const declined = lastEvent(events, (e) => e.payload.type === "declined");
      const by = declined ? api.member(declined.actorId) : undefined;
      return (
        <Shell
          className={className}
          status="declined"
          title={`Declined${by ? ` by ${firstName(by.name)}` : ""}`}
          meta={declined ? relativeTimeLong(declined.at, api.now) : undefined}
          body={
            declined && declined.payload.type === "declined" ? (
              <span className="text-fg">{declined.payload.reason}</span>
            ) : undefined
          }
          error={error?.message}
        >
          <Actions>
            <Button variant="ghost" onClick={() => run({ type: "reopen" })}>
              <RotateCcw size={14} aria-hidden />
              Reopen
            </Button>
          </Actions>
        </Shell>
      );
    }
  }
}

function acceptedMeta(events: ActivityEvent[], now: string) {
  const accepted = lastEvent(events, (e) => e.payload.type === "accepted");
  return accepted ? `Accepted ${relativeTimeLong(accepted.at, now)}` : undefined;
}

function startedMeta(events: ActivityEvent[], now: string) {
  const started = lastEvent(
    events,
    (e) => e.payload.type === "status_changed" && e.payload.to === "in_progress",
  );
  return started ? `Started ${relativeTimeLong(started.at, now)}` : undefined;
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div>;
}

function Shell({
  status,
  tone,
  emphasis,
  icon,
  title,
  meta,
  body,
  error,
  className,
  children,
}: {
  status?: Request["status"];
  tone?: "danger";
  emphasis?: boolean;
  icon?: ReactNode;
  title: string;
  meta?: string;
  body?: ReactNode;
  error?: string;
  className?: string;
  children?: ReactNode;
}) {
  const tinted = tone === "danger" || emphasis;
  const embedded = useContext(EmbeddedContext);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useNextStepFocus(useContext(RequestIdContext), headingRef);
  return (
    <section
      aria-label="Next step"
      className={cx(
        embedded ? "@container px-4 py-3.5" : "rounded-panel border border-line bg-panel p-3",
        tinted && (embedded ? "tinted-fill" : "tinted-card"),
        className,
      )}
      style={
        tone === "danger"
          ? ({ "--st": "var(--color-danger)" } as CSSProperties)
          : status
            ? statusStyle(status)
            : undefined
      }
    >
      <div className="flex items-start gap-2.5">
        {icon ?? (status ? <StatusIcon status={status} className="mt-0.5" /> : null)}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <h3 ref={headingRef} tabIndex={-1} className="rounded-[3px] text-ui font-medium text-fg">
              {title}
            </h3>
            {meta ? <p className="text-meta text-fg-3">{meta}</p> : null}
          </div>
          {body ? <div className="mt-1 text-meta wrap-break-word text-fg-2">{body}</div> : null}
        </div>
      </div>
      <div className={cx(embedded && "@min-[480px]:pl-6")}>
        {children}
        {error ? (
          <p role="alert" className="mt-2 text-meta text-danger-fg">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function TriageStep({
  request,
  className,
  mode,
  setMode,
  error,
  setError,
  textForm,
  text,
  requesterName,
}: {
  request: Request;
  className?: string;
  mode: Mode;
  setMode: (mode: Mode) => void;
  error: { message: string; field?: string } | null;
  setError: (error: { message: string; field?: string } | null) => void;
  textForm: (opts: {
    label: string;
    placeholder: string;
    submit: string;
    variant?: "primary" | "danger" | "secondary";
    onSubmit: () => void;
  }) => ReactNode;
  text: string;
  requesterName: string;
}) {
  const api = useWorkspace();
  const load = useOpenLoad();
  const perform = useWorkflowAction();
  const embedded = useContext(EmbeddedContext);
  const [assigneeId, setAssigneeId] = useState<string | null>(request.assigneeId);
  const [approverId, setApproverId] = useState<string | null>(request.approverId);
  const [priority, setPriority] = useState<Priority>(request.priority);
  const owner = api.member(assigneeId);
  const approver = api.member(approverId);

  function accept() {
    const result = perform(request, {
      type: "accept",
      assigneeId,
      approverId,
      priority,
    });
    if (!result.ok) setError({ message: result.error, field: result.field });
  }

  function decline() {
    const result = perform(request, { type: "decline", reason: text });
    if (!result.ok) setError({ message: result.error, field: result.field });
  }

  const field =
    "flex h-8 w-full min-w-0 items-center gap-2 rounded-control border border-line bg-canvas px-2 text-left text-ui text-fg transition-colors duration-100 hover:border-line-strong";

  return (
    <Shell
      className={className}
      status="triage"
      emphasis
      title="Needs triage"
      meta={`Waiting ${relativeTimeLong(request.createdAt, api.now).replace(" ago", "")}`}
      body="Accept it with an owner, or decline it with a reason."
      error={mode === "idle" ? error?.message : undefined}
    >
      {mode === "decline" ? (
        <>
          {textForm({
            label: `Reason (shared with ${requesterName})`,
            placeholder: "e.g. Covered by the existing contract; raise with the landlord instead",
            submit: "Decline request",
            variant: "danger",
            onSubmit: decline,
          })}
          {error ? (
            <p role="alert" className="mt-2 text-meta text-danger-fg">
              {error.message}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <div
            className={cx(
              "mt-3 grid gap-y-1.5",
              embedded && "@min-[480px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] @min-[480px]:gap-x-2",
            )}
          >
            <TriageField label="Owner">
              <MemberPicker
                label="Choose owner"
                value={assigneeId}
                onChange={(id) => {
                  setAssigneeId(id);
                  setError(null);
                  if (id && id === approverId) setApproverId(null);
                }}
                hint={load}
                invalid={error?.field === "assignee"}
                triggerClassName={field}
              >
                <Avatar name={owner?.name} size={18} />
                <span className={cx("truncate", !owner && "text-fg-3")}>
                  {owner ? owner.name : "Choose owner"}
                </span>
                <ChevronDown size={12} aria-hidden className="ml-auto text-fg-3" />
              </MemberPicker>
            </TriageField>
            <TriageField label="Priority">
              <PriorityPicker value={priority} onChange={setPriority} triggerClassName={field}>
                <PriorityIcon priority={priority} />
                <span className={cx("truncate", priority === "none" && "text-fg-3")}>
                  {priority === "none" ? "Medium (default)" : PRIORITY_META[priority].label}
                </span>
                <ChevronDown size={12} aria-hidden className="ml-auto text-fg-3" />
              </PriorityPicker>
            </TriageField>
            <TriageField label="Approval">
              <MemberPicker
                label="Choose approver"
                value={approverId}
                onChange={(id) => {
                  setApproverId(id);
                  setError(null);
                }}
                noneLabel="Not required"
                exclude={(m) => m.id === assigneeId}
                invalid={error?.field === "approver"}
                triggerClassName={field}
              >
                {approver ? (
                  <>
                    <Avatar name={approver.name} size={18} />
                    <span className="truncate">{approver.name}</span>
                  </>
                ) : (
                  <span className="truncate text-fg-3">Not required</span>
                )}
                <ChevronDown size={12} aria-hidden className="ml-auto text-fg-3" />
              </MemberPicker>
            </TriageField>
          </div>
          <Actions>
            <Button variant="primary" onClick={accept}>
              Accept request
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setError(null);
                setMode("decline");
              }}
            >
              Decline
            </Button>
          </Actions>
        </>
      )}
    </Shell>
  );
}

function TriageField({ label, children }: { label: string; children: ReactNode }) {
  const embedded = useContext(EmbeddedContext);
  return (
    <div
      className={cx(
        "grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-2",
        embedded && "@min-[480px]:grid-cols-1 @min-[480px]:gap-y-1",
      )}
    >
      <span className="text-meta text-fg-3">{label}</span>
      {children}
    </div>
  );
}
