"use client";

import {
  Ban,
  CalendarDays,
  CornerUpLeft,
  RotateCcw,
  Stamp,
  UserRound,
  UserRoundCheck,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { fullDateTime, relativeTime, shortDate } from "@/domain/format";
import type { ActivityEvent, Member } from "@/domain/types";
import { Avatar } from "@/components/ui/avatar";
import { cx } from "@/components/ui/cx";
import { PRIORITY_META, PriorityIcon, STATUS_META, StatusIcon } from "./glyphs";
import { useWorkspace, type TimelineItem } from "./workspace-context";

const MENTION = /(@[A-Z][a-zà-ÿ]+)/g;
const IS_MENTION = /^@[A-Z][a-zà-ÿ]+$/;

export function renderBody(body: string) {
  return body.split(MENTION).map((part, i) =>
    IS_MENTION.test(part) ? (
      <span key={i} className="font-medium text-accent-fg">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function Name({ children }: { children: ReactNode }) {
  return <span className="font-medium text-fg">{children}</span>;
}

/** One sentence describing an event, without the actor. Shared with the global feed. */
export function describeEvent(
  event: ActivityEvent,
  member: (id: string | null) => Member | undefined,
): { text: ReactNode; note?: string; icon: ReactNode } {
  const p = event.payload;
  const name = (id: string | null) => member(id)?.name ?? "someone";
  switch (p.type) {
    case "created":
      return { text: "submitted this request", icon: <StatusIcon status="triage" size={12} /> };
    case "accepted":
      return {
        text: (
          <>
            accepted it · owner <Name>{name(p.assigneeId)}</Name>
            {p.approverId ? (
              <>
                {" "}
                · approval <Name>{name(p.approverId)}</Name>
              </>
            ) : null}
          </>
        ),
        icon: <UserRoundCheck size={12} aria-hidden className="text-fg-2" />,
      };
    case "status_changed": {
      const text =
        p.to === "in_progress"
          ? "started work"
          : p.to === "in_review"
            ? "submitted it for review"
            : p.to === "done"
              ? "marked it done"
              : p.from === "done" || p.from === "declined"
                ? "reopened it"
                : `moved it to ${STATUS_META[p.to].label}`;
      return { text, icon: <StatusIcon status={p.to} size={12} /> };
    }
    case "assignee_changed":
      return {
        text: p.to ? (
          <>
            assigned it to <Name>{name(p.to)}</Name>
          </>
        ) : (
          "removed the owner"
        ),
        icon: <UserRound size={12} aria-hidden className="text-fg-2" />,
      };
    case "approver_changed":
      return {
        text: p.to ? (
          <>
            set <Name>{name(p.to)}</Name> as approver
          </>
        ) : (
          "removed the approval step"
        ),
        icon: <Stamp size={12} aria-hidden className="text-fg-2" />,
      };
    case "priority_changed":
      return {
        text: `set priority to ${PRIORITY_META[p.to].label.toLowerCase()}`,
        icon: <PriorityIcon priority={p.to} size={12} />,
      };
    case "due_date_changed":
      return {
        text: p.to ? `set the due date to ${shortDate(p.to)}` : "removed the due date",
        icon: <CalendarDays size={12} aria-hidden className="text-fg-2" />,
      };
    case "approved":
      return {
        text: "approved it",
        note: p.note ?? undefined,
        icon: <StatusIcon status="done" size={12} />,
      };
    case "changes_requested":
      return {
        text: "requested changes",
        note: p.note,
        icon: <CornerUpLeft size={12} aria-hidden className="text-[var(--color-st-review)]" />,
      };
    case "declined":
      return { text: "declined it", note: p.reason, icon: <StatusIcon status="declined" size={12} /> };
    case "blocked":
      return {
        text: "marked it blocked",
        note: p.reason,
        icon: <Ban size={12} aria-hidden className="text-danger-fg" />,
      };
    case "unblocked":
      return { text: "unblocked it", icon: <RotateCcw size={12} aria-hidden className="text-fg-2" /> };
  }
}

interface TimelineProps {
  requestId: string;
  variant?: "compact" | "comfortable";
  /** Colour behind the timeline; icons punch through the rail with it. */
  surface?: string;
  filter?: "all" | "comments";
  /** Entries for which this returns true enter with a short fade (motion-enabled pages only). */
  isNew?: (id: string) => boolean;
}

export function Timeline({
  requestId,
  variant = "compact",
  surface = "var(--color-canvas)",
  filter = "all",
  isNew,
}: TimelineProps) {
  const api = useWorkspace();
  const items = api.timeline(requestId);
  const shown = (item: TimelineItem) => filter === "all" || item.kind === "comment";

  if (!items.some(shown)) {
    return <p className="py-2 text-meta text-fg-3">No comments yet.</p>;
  }

  return (
    <ol
      className="relative flex flex-col"
      style={{ "--timeline-bg": surface } as CSSProperties}
    >
      <span aria-hidden className="absolute top-4 bottom-4 left-[11.5px] w-px bg-line" />
      {/* Filtered entries are hidden rather than unmounted, so switching filters never replays an entrance. */}
      {items.map((item) => {
        const id = item.kind === "comment" ? item.comment.id : item.event.id;
        return (
          <TimelineRow key={id} item={item} variant={variant} hidden={!shown(item)} enter={isNew?.(id) ?? false} />
        );
      })}
    </ol>
  );
}

function TimeStamp({ at }: { at: string }) {
  const { now } = useWorkspace();
  return (
    <time dateTime={at} title={fullDateTime(at)} className="text-meta whitespace-nowrap text-fg-3 tabular-nums">
      {relativeTime(at, now)}
    </time>
  );
}

function TimelineRow({
  item,
  variant,
  hidden,
  enter,
}: {
  item: TimelineItem;
  variant: "compact" | "comfortable";
  hidden: boolean;
  enter: boolean;
}) {
  const api = useWorkspace();

  if (item.kind === "comment") {
    const author = api.member(item.comment.authorId);
    const header = (
      <div className="flex items-baseline gap-2">
        <span className="truncate text-ui font-medium text-fg">{author?.name ?? "Unknown"}</span>
        <TimeStamp at={item.comment.createdAt} />
      </div>
    );
    return (
      <li hidden={hidden} className={cx("relative flex gap-3 py-2", enter && "motion-enter")}>
        <Avatar
          name={author?.name}
          size={24}
          className="relative z-[1] ring-4 ring-[var(--timeline-bg)]"
        />
        {variant === "comfortable" ? (
          <div className="min-w-0 flex-1 rounded-panel border border-line bg-panel px-3.5 pt-2 pb-2.5">
            {header}
            <p className="mt-1 text-read wrap-break-word whitespace-pre-wrap text-fg">{renderBody(item.comment.body)}</p>
          </div>
        ) : (
          <div className="min-w-0 flex-1 pt-0.5">
            {header}
            <p className="mt-0.5 text-ui leading-5 wrap-break-word whitespace-pre-wrap text-fg">
              {renderBody(item.comment.body)}
            </p>
          </div>
        )}
      </li>
    );
  }

  const actor = api.member(item.event.actorId);
  const { text, note, icon } = describeEvent(item.event, (id) => api.member(id));
  return (
    <li hidden={hidden} className={cx("relative flex gap-3 py-1.5", enter && "motion-enter")}>
      <span className="relative z-[1] grid size-6 shrink-0 place-items-center">
        <span className="grid size-5 place-items-center rounded-full bg-[var(--timeline-bg)]">{icon}</span>
      </span>
      <div className="min-w-0 flex-1 pt-[3px] text-meta text-fg-2">
        <span>
          <Name>{actor?.name ?? "Someone"}</Name> {text}
        </span>
        <span className="text-fg-3"> · </span>
        <TimeStamp at={item.event.at} />
        {note ? (
          <blockquote
            className={cx(
              "mt-1.5 border-l-2 border-line-strong pl-2.5 text-ui wrap-break-word text-fg",
              variant === "comfortable" && "text-read",
            )}
          >
            {note}
          </blockquote>
        ) : null}
      </div>
    </li>
  );
}
