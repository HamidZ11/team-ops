"use client";

import { Ban, CalendarDays, ChevronDown } from "lucide-react";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { dueLabel, relativeTime, shortDate } from "@/domain/format";
import { isOpen, type Member, type Request } from "@/domain/types";
import type { WorkflowAction } from "@/domain/workflow";
import { Avatar } from "@/components/ui/avatar";
import { cx } from "@/components/ui/cx";
import { DatePicker, useCalendarPicker } from "@/components/ui/date-picker";
import { PRIORITY_META, PriorityIcon, StatusChip, TypeIcon } from "./glyphs";
import { MemberPicker, PriorityPicker } from "./pickers";
import { useWorkspace } from "./workspace-context";

/*
 * Two layouts of the same properties:
 * - "list": label beside value, one per row. Inspectors and narrow columns.
 * - "facts": label above value in a content-sized grid. A compact strip for
 *   wide reading columns when there is no room for an inspector.
 * The negative margins let hover backgrounds extend past the text without
 * taking width from it, so values align with their labels.
 */
type Layout = "list" | "facts";
const LayoutContext = createContext<Layout>("list");

const STYLES: Record<Layout, { button: string; value: string }> = {
  list: {
    button:
      "group -mx-2 flex h-8 w-[calc(100%+16px)] min-w-0 items-center gap-2 rounded-control px-2 text-left text-ui text-fg transition-colors duration-100 hover:bg-raised disabled:hover:bg-transparent",
    value: "flex h-8 min-w-0 items-center gap-2 text-ui",
  },
  facts: {
    button:
      "group -mx-1.5 flex h-6 w-[calc(100%+12px)] min-w-0 items-center gap-1.5 rounded-[5px] px-1.5 text-left text-ui text-fg transition-colors duration-100 hover:bg-raised disabled:hover:bg-transparent",
    value: "flex h-6 min-w-0 items-center gap-1.5 text-ui",
  },
};

function useStyles() {
  return STYLES[useContext(LayoutContext)];
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  const layout = useContext(LayoutContext);
  if (layout === "facts") {
    return (
      <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-meta text-fg-3">{label}</dt>
        <dd className="flex min-h-6 min-w-0 items-center">{children}</dd>
      </div>
    );
  }
  return (
    <div className="grid min-h-8 grid-cols-[88px_minmax(0,1fr)] items-center gap-2">
      <dt className="text-meta text-fg-3">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

export function useOpenLoad() {
  const { requests } = useWorkspace();
  return (member: Member) => {
    const count = requests.filter((r) => r.assigneeId === member.id && isOpen(r)).length;
    return count ? `${count} open` : undefined;
  };
}

export function RequestProperties({ request, layout = "list" }: { request: Request; layout?: Layout }) {
  return (
    <LayoutContext.Provider value={layout}>
      <Properties request={request} />
    </LayoutContext.Provider>
  );
}

function Properties({ request }: { request: Request }) {
  const layout = useContext(LayoutContext);
  const { button: valueButton, value: valueClass } = useStyles();
  const api = useWorkspace();
  const load = useOpenLoad();
  const [error, setError] = useState<{ field: string; message: string } | null>(null);
  const closed = !isOpen(request);
  const owner = api.member(request.assigneeId);
  const approver = api.member(request.approverId);
  const requester = api.member(request.requesterId);
  const type = api.type(request.typeId);
  // In triage, owner, priority and approval are chosen in the triage step itself.
  const triage = request.status === "triage";

  function run(action: WorkflowAction, field: string) {
    const result = api.perform(request.id, action);
    setError(result.ok ? null : { field: result.field ?? field, message: result.error });
  }

  const errorFor = (field: string) =>
    error?.field === field ? (
      <p role="alert" className={cx("text-meta text-danger-fg", layout === "facts" ? "col-span-full" : "pb-1 pl-[96px]")}>
        {error.message}
      </p>
    ) : null;

  return (
    <dl
      className={
        layout === "facts"
          ? "grid grid-cols-[repeat(4,auto)] justify-between gap-x-6 gap-y-2.5"
          : "flex flex-col"
      }
    >
      <Row label="Status">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <StatusChip status={request.status} />
          {request.blocked ? (
            <span className="inline-flex h-[22px] items-center gap-1 rounded-chip bg-danger/12 px-1.5 text-meta font-medium text-danger-fg">
              <Ban size={12} aria-hidden />
              Blocked
            </span>
          ) : null}
        </div>
      </Row>
      {triage ? null : (
        <>
          <Row label="Priority">
            <PriorityPicker
              value={request.priority}
              onChange={(priority) => run({ type: "set_priority", priority }, "priority")}
              triggerClassName={valueButton}
              disabled={closed}
            >
              <PriorityIcon priority={request.priority} />
              <span className={cx("truncate", request.priority === "none" && "text-fg-3")}>
                {PRIORITY_META[request.priority].label}
              </span>
            </PriorityPicker>
          </Row>
          <Row label="Owner">
            <MemberPicker
              label="Change owner"
              value={request.assigneeId}
              onChange={(assigneeId) => run({ type: "assign", assigneeId }, "assignee")}
              noneLabel={request.status === "triage" ? "Unassigned" : undefined}
              hint={load}
              triggerClassName={valueButton}
              disabled={closed}
            >
              <Avatar name={owner?.name} size={18} />
              <span className={cx("truncate", !owner && "text-fg-3")}>
                {owner ? owner.name : "Unassigned"}
              </span>
            </MemberPicker>
          </Row>
          {errorFor("assignee")}
          <Row label="Approver">
            <MemberPicker
              label="Change approver"
              value={request.approverId}
              onChange={(approverId) => run({ type: "set_approver", approverId }, "approver")}
              noneLabel={request.status === "in_review" ? undefined : "Not required"}
              exclude={(m) => m.id === request.assigneeId}
              triggerClassName={valueButton}
              disabled={closed}
            >
              {approver ? (
                <>
                  <Avatar name={approver.name} size={18} />
                  <span className="truncate">{approver.name}</span>
                </>
              ) : (
                <span className="truncate text-fg-3">Not required</span>
              )}
            </MemberPicker>
          </Row>
          {errorFor("approver")}
        </>
      )}
      <Row label="Due date">
        <DueDateControl
          value={request.dueDate}
          today={api.today}
          open={!closed}
          onChange={(dueDate) => run({ type: "set_due_date", dueDate }, "due")}
        />
      </Row>
      <Row label="Type">
        <span className={cx(valueClass, "text-fg")}>
          {type ? <TypeIcon icon={type.icon} className="text-fg-2" /> : null}
          <span className="truncate">{type?.name ?? "—"}</span>
        </span>
      </Row>
      <Row label="Requester">
        <span className={cx(valueClass, "text-fg")}>
          <Avatar name={requester?.name} size={18} />
          <span className="truncate">{requester?.name ?? "Unknown"}</span>
        </span>
      </Row>
      <Row label="Created">
        <span className={cx(valueClass, "gap-0 text-fg-2 tabular-nums")}>
          {shortDate(request.createdAt, api.today)}
          {relativeTime(request.createdAt, api.now) !== shortDate(request.createdAt, api.today) ? (
            <span className="ml-1.5 text-fg-3">· {relativeTime(request.createdAt, api.now)}</span>
          ) : null}
        </span>
      </Row>
    </dl>
  );
}

function DueDateControl({
  value,
  today,
  open,
  onChange,
}: {
  value: string | null;
  today: string;
  open: boolean;
  onChange: (value: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const calendar = useCalendarPicker();
  const { button: valueButton } = useStyles();
  const label = value ? dueLabel(value, today) : null;
  const name = value ? `Due ${shortDate(value, today)}. Change due date` : "Set due date";
  const content = (
    <>
      <CalendarDays size={14} aria-hidden className="text-fg-2" />
      {value && label ? (
        <span className="truncate tabular-nums">
          {shortDate(value, today)}
          {open && label.tone !== "normal" ? (
            <span
              className={cx(
                "ml-1.5",
                label.tone === "overdue" ? "text-danger-fg" : "text-fg-3",
              )}
            >
              · {label.text}
            </span>
          ) : null}
        </span>
      ) : (
        <span className="text-fg-3">Set due date</span>
      )}
      <ChevronDown
        size={12}
        aria-hidden
        className="ml-auto text-fg-3 opacity-0 transition-opacity group-hover:opacity-100"
      />
    </>
  );

  if (calendar) {
    return (
      <DatePicker
        title="Due date"
        label={name}
        value={value}
        today={today}
        onChange={onChange}
        clearable
        disabled={!open}
        triggerClassName={valueButton}
      >
        {content}
      </DatePicker>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={!open}
        aria-label={name}
        onClick={() => {
          const input = inputRef.current;
          if (!input) return;
          try {
            input.showPicker();
          } catch {
            input.focus();
          }
        }}
        className={valueButton}
      >
        {content}
      </button>
      <input
        ref={inputRef}
        type="date"
        tabIndex={-1}
        aria-hidden
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
      />
    </div>
  );
}
