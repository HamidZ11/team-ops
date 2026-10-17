"use client";

import { ArrowDownUp, ChevronDown, Plus, Search, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { PriorityIcon, STATUS_META, StatusIcon, TypeIcon } from "@/components/request/glyphs";
import { describeEvent } from "@/components/request/timeline";
import { useWorkspace } from "@/components/request/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { Picker, type PickerOption } from "@/components/ui/picker";
import { dueLabel, firstName, relativeTime } from "@/domain/format";
import { SORT_LABELS, type SortKey } from "@/domain/query";
import type { Request, RequestStatus } from "@/domain/types";
import type { ViewId } from "@/domain/views";
import { OPS_TEAM } from "../fixtures";
import { encodeScope, decodeScope, scopeRequests, type Scope } from "../scope";
import { B_VIEW_ICONS } from "./context-sidebar";

const GROUP_ORDER: RequestStatus[] = ["in_review", "in_progress", "todo", "triage", "done", "declined"];

export function QueueList({
  scope,
  onScope,
  copy,
  rows,
  grouped,
  selectedId,
  onSelect,
  isUnread,
  search,
  onSearch,
  sort,
  onSort,
  onCreate,
}: {
  scope: Scope;
  onScope: (scope: Scope) => void;
  copy: { label: string; description: string; emptyTitle: string; emptyBody: string };
  rows: Request[];
  grouped: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  isUnread: (id: string) => boolean;
  search: string;
  onSearch: (value: string) => void;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
  onCreate: () => void;
}) {
  const api = useWorkspace();
  const [searchOpen, setSearchOpen] = useState(false);
  const ctx = { meId: api.me.id, today: api.today };

  const scopeOptions: PickerOption<string>[] = [
    ...(["inbox", "my_work", "approvals", "all", "blocked", "due_soon", "closed"] as ViewId[]).map((id, i) => {
      const Icon = B_VIEW_ICONS[id];
      const s: Scope = { kind: "view", id };
      return {
        value: encodeScope(s),
        label: { inbox: "Inbox", my_work: "My work", approvals: "Approvals", all: "All open", blocked: "Blocked", due_soon: "Due this week", closed: "Closed" }[id],
        icon: <Icon size={15} aria-hidden />,
        hint: id === "closed" ? undefined : String(scopeRequests(api.requests, s, ctx).length),
        separated: i === 3,
      };
    }),
    ...api.members
      .filter((m) => OPS_TEAM.includes(m.id))
      .map((m, i) => ({
        value: encodeScope({ kind: "member", id: m.id }),
        label: m.name,
        icon: <Avatar name={m.name} size={18} />,
        separated: i === 0,
      })),
    ...api.types.map((t, i) => ({
      value: encodeScope({ kind: "type", id: t.id }),
      label: t.name,
      icon: <TypeIcon icon={t.icon} />,
      separated: i === 0,
    })),
  ];

  const groups: Array<{ status: RequestStatus | null; items: Request[] }> = grouped
    ? GROUP_ORDER.map((status) => ({ status, items: rows.filter((r) => r.status === status) })).filter(
        (g) => g.items.length,
      )
    : [{ status: null, items: rows }];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-line px-4 pt-3 pb-3">
        <div className="flex h-7 items-center gap-2">
          <span
            aria-hidden
            className="grid size-6 place-items-center rounded-[7px] bg-fg text-[11px] font-bold text-canvas md:hidden"
          >
            M
          </span>
          <h1 className="flex min-w-0">
            <Picker
              label={`${copy.label}. Switch queue`}
              value={encodeScope(scope)}
              onChange={(v) => onScope(decodeScope(v, scope))}
              options={scopeOptions}
              searchable
              searchPlaceholder="Jump to queue, person or type…"
              width={280}
              triggerClassName="-ml-1 flex min-w-0 items-center gap-1.5 rounded-control px-1 py-0.5 text-left hover:bg-raised"
            >
              <span className="truncate text-title font-semibold text-fg">{copy.label}</span>
              <span className="text-title text-fg-3 tabular-nums">{rows.length}</span>
              <ChevronDown size={14} aria-hidden className="text-fg-3 xl:hidden" />
            </Picker>
          </h1>
          <div className="ml-auto flex items-center">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Search"
              aria-expanded={searchOpen}
              className="xl:hidden"
              onClick={() => setSearchOpen((o) => !o)}
            >
              <Search size={15} />
            </Button>
            <Picker
              label="Sort"
              value={sort}
              onChange={onSort}
              align="end"
              width={200}
              options={(Object.keys(SORT_LABELS) as SortKey[]).map((k) => ({ value: k, label: SORT_LABELS[k] }))}
              triggerClassName="grid size-7 place-items-center rounded-control text-fg-2 hover:bg-raised hover:text-fg"
            >
              <ArrowDownUp size={15} aria-hidden />
            </Picker>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="New request"
              className="xl:hidden"
              onClick={onCreate}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
        <p className="mt-1 truncate text-meta text-fg-3">{copy.description}</p>
        {searchOpen || search ? (
          <label className="mt-2.5 flex h-8 items-center gap-2 rounded-control border border-line bg-canvas px-2.5 text-fg-3 focus-within:border-line-strong xl:hidden">
            <Search size={14} aria-hidden />
            <span className="sr-only">Search requests</span>
            <input
              autoFocus
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search requests"
              className="h-full min-w-0 flex-1 bg-transparent text-ui text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none"
            />
            {search ? (
              <button type="button" aria-label="Clear search" onClick={() => onSearch("")} className="text-fg-3 hover:text-fg">
                <X size={14} />
              </button>
            ) : null}
          </label>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-20 md:pb-0">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 px-6 py-16 text-center">
            <p className="text-ui font-medium text-fg">{search ? "No matches" : copy.emptyTitle}</p>
            <p className="max-w-[260px] text-meta text-fg-3">
              {search ? `Nothing in ${copy.label} matches “${search}”.` : copy.emptyBody}
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.status ?? "all"} aria-label={group.status ? STATUS_META[group.status].label : copy.label}>
              {group.status ? (
                <h2 className="sticky top-0 z-[1] flex h-8 items-center gap-2 border-b border-line-soft bg-canvas px-4 text-meta text-fg-2">
                  <StatusIcon status={group.status} size={12} />
                  {group.status === "in_review" && scope.kind === "view" && scope.id === "my_work"
                    ? "Waiting on approval"
                    : STATUS_META[group.status].label}
                  <span className="text-fg-3 tabular-nums">{group.items.length}</span>
                </h2>
              ) : null}
              <ul>
                {group.items.map((r) => (
                  <QueueItem
                    key={r.id}
                    request={r}
                    selected={r.id === selectedId}
                    unread={isUnread(r.id)}
                    onSelect={() => onSelect(r.id)}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function QueueItem({
  request: r,
  selected,
  unread,
  onSelect,
}: {
  request: Request;
  selected: boolean;
  unread: boolean;
  onSelect: () => void;
}) {
  const api = useWorkspace();
  const owner = api.member(r.assigneeId);
  const due = r.dueDate ? dueLabel(r.dueDate, api.today) : null;
  const closed = r.status === "done" || r.status === "declined";
  const timeline = api.timeline(r.id);
  const last = timeline.at(-1);

  let snippet: ReactNode = r.description;
  if (last?.kind === "comment") {
    const author = api.member(last.comment.authorId);
    snippet = (
      <>
        <span className="text-fg-2">{author ? firstName(author.name) : "Someone"}:</span> {last.comment.body}
      </>
    );
  } else if (last?.kind === "event" && last.event.payload.type !== "created") {
    const actor = api.member(last.event.actorId);
    const { text } = describeEvent(last.event, (id) => api.member(id));
    snippet = (
      <>
        <span className="text-fg-2">{actor ? firstName(actor.name) : "Someone"}</span> {text}
      </>
    );
  }

  return (
    <li>
      <button
        type="button"
        id={`item-${r.id}`}
        aria-current={selected || undefined}
        onClick={onSelect}
        className={cx(
          "relative flex w-full flex-col gap-1 border-b border-line-soft py-3 pr-4 pl-5 text-left transition-colors duration-75",
          selected ? "bg-selected" : "hover:bg-raised/60",
        )}
      >
        {selected ? <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-accent" /> : null}
        {unread ? (
          <span aria-hidden className="absolute top-[18px] left-2 size-1.5 rounded-full bg-accent" />
        ) : null}
        <span className="flex items-center gap-2">
          <PriorityIcon priority={r.priority} />
          <span className={cx("min-w-0 flex-1 truncate text-ui text-fg", unread ? "font-semibold" : "font-medium")}>
            {r.title}
            {unread ? <span className="sr-only"> (unread)</span> : null}
          </span>
          <time dateTime={r.updatedAt} className="shrink-0 text-meta text-fg-3 tabular-nums">
            {relativeTime(r.updatedAt, api.now)}
          </time>
        </span>
        <span className="line-clamp-1 text-meta text-fg-3">{snippet}</span>
        <span className="mt-1 flex items-center gap-2 text-meta text-fg-3">
          <StatusIcon status={r.status} size={12} />
          <span className="tabular-nums">{api.keyOf(r)}</span>
          {r.blocked ? <span className="font-medium text-danger-fg">Blocked</span> : null}
          {due && !closed ? (
            <span className={cx(due.tone === "overdue" && "text-danger-fg")}>
              {due.tone === "overdue" ? due.text : `Due ${due.text}`}
            </span>
          ) : null}
          <span className="ml-auto flex items-center gap-1.5">
            {owner ? null : <span className="text-fg-3">Unassigned</span>}
            <Avatar name={owner?.name} size={18} decorative={false} />
          </span>
        </span>
      </button>
    </li>
  );
}
