"use client";

import { MessageSquare } from "lucide-react";
import { describeEvent, renderBody } from "@/components/request/timeline";
import { useWorkspace } from "@/components/request/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import { cx } from "@/components/ui/cx";
import { calendarDate, dayHeading, firstName, fullDateTime, relativeTime } from "@/domain/format";
import type { ActivityEvent, Comment } from "@/domain/types";

export type ActivityFilter = "all" | "comments" | "decisions" | "mentions";

type FeedItem =
  | { kind: "comment"; at: string; comment: Comment }
  | { kind: "event"; at: string; event: ActivityEvent };

const DECISIONS = new Set(["accepted", "approved", "changes_requested", "declined"]);

export function buildFeed(events: ActivityEvent[], comments: Comment[], meName: string) {
  const mention = `@${firstName(meName)}`;
  const items: FeedItem[] = [
    ...events.map((event) => ({ kind: "event" as const, at: event.at, event })),
    ...comments.map((comment) => ({ kind: "comment" as const, at: comment.createdAt, comment })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  const match: Record<ActivityFilter, (item: FeedItem) => boolean> = {
    all: () => true,
    comments: (i) => i.kind === "comment",
    decisions: (i) => i.kind === "event" && DECISIONS.has(i.event.payload.type),
    mentions: (i) => i.kind === "comment" && i.comment.body.includes(mention),
  };
  const counts = {
    all: items.length,
    comments: items.filter(match.comments).length,
    decisions: items.filter(match.decisions).length,
    mentions: items.filter(match.mentions).length,
  };
  return { items, match, counts };
}

export function ActivityFeed({
  items,
  filter,
  onFilter,
  onOpen,
}: {
  items: FeedItem[];
  filter: ActivityFilter;
  onFilter: (filter: ActivityFilter) => void;
  onOpen: (requestId: string) => void;
}) {
  const api = useWorkspace();
  const visible = items.slice(0, 80);
  const days: Array<{ date: string; items: FeedItem[] }> = [];
  for (const item of visible) {
    const date = calendarDate(item.at);
    const day = days.at(-1);
    if (day && day.date === date) day.items.push(item);
    else days.push({ date, items: [item] });
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line px-4 lg:px-6">
        <span aria-hidden className="grid size-6 place-items-center rounded-[7px] bg-fg text-[11px] font-bold text-canvas md:hidden">
          M
        </span>
        <h1 className="text-title font-semibold text-fg">Activity</h1>
        <div role="group" aria-label="Show" className="scroll-row ml-auto flex gap-0.5 xl:hidden">
          {(["all", "comments", "decisions", "mentions"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => onFilter(f)}
              className={cx(
                "h-7 shrink-0 rounded-[6px] px-2.5 text-meta capitalize transition-colors duration-100",
                filter === f ? "bg-selected text-fg" : "text-fg-3 hover:text-fg-2",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-[760px] px-2 py-4 lg:px-6 lg:py-6">
          {days.length === 0 ? (
            <p className="px-3 py-16 text-center text-meta text-fg-3">Nothing here yet.</p>
          ) : null}
          {days.map((day) => (
            <section key={day.date} aria-label={dayHeading(day.date, api.today)} className="mb-4">
              <h2 className="sticky top-0 z-[1] bg-canvas px-3 py-2 text-meta font-medium text-fg-3">
                {dayHeading(day.date, api.today)}
              </h2>
              <ol className="flex flex-col">
                {day.items.map((item) => (
                  <FeedRow key={item.kind === "comment" ? item.comment.id : item.event.id} item={item} onOpen={onOpen} />
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeedRow({ item, onOpen }: { item: FeedItem; onOpen: (requestId: string) => void }) {
  const api = useWorkspace();
  const requestId = item.kind === "comment" ? item.comment.requestId : item.event.requestId;
  const request = api.request(requestId);
  if (!request) return null;
  const actorId = item.kind === "comment" ? item.comment.authorId : item.event.actorId;
  const actor = api.member(actorId);
  const described = item.kind === "event" ? describeEvent(item.event, (id) => api.member(id)) : null;
  const body = item.kind === "comment" ? item.comment.body : described?.note;

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(requestId)}
        className="flex w-full gap-3 rounded-panel px-3 py-2.5 text-left transition-colors duration-75 hover:bg-raised/70"
      >
        <span className="relative mt-px block size-6 shrink-0">
          <Avatar name={actor?.name} size={24} />
          <span className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full bg-canvas">
            {item.kind === "comment" ? <MessageSquare size={10} aria-hidden className="text-fg-2" /> : described?.icon}
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-3">
            <span className="min-w-0 flex-1 text-ui text-fg-2">
              <span className="font-medium text-fg">{actor?.name ?? "Someone"}</span>{" "}
              {item.kind === "comment" ? "commented on" : described?.text}
              {item.kind === "event" ? " ·" : null}{" "}
              <span className="text-fg-3 tabular-nums">{api.keyOf(request)}</span>{" "}
              <span className="text-fg">{request.title}</span>
            </span>
            <time dateTime={item.at} title={fullDateTime(item.at)} className="shrink-0 text-meta text-fg-3 tabular-nums">
              {relativeTime(item.at, api.now)}
            </time>
          </span>
          {body ? (
            <span className="mt-1 line-clamp-2 border-l-2 border-line-strong pl-2.5 text-ui text-fg">
              {renderBody(body)}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}
