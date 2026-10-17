"use client";

import { ArrowDownUp } from "lucide-react";
import { AnimatePresence, LayoutGroup, m } from "motion/react";
import type { ReactNode, Ref } from "react";
import { PriorityIcon, STATUS_META, StatusIcon } from "@/components/request/glyphs";
import { describeEvent } from "@/components/request/timeline";
import { useWorkspace } from "@/components/request/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import { cx } from "@/components/ui/cx";
import { Picker } from "@/components/ui/picker";
import { ease, indicatorSpring, instant, layoutSpring } from "@/components/ui/springs";
import { dueLabel, firstName, relativeTime } from "@/domain/format";
import { SORT_LABELS, type SortKey } from "@/domain/query";
import type { Request, RequestStatus } from "@/domain/types";
import { EmptyState, SearchField } from "./table-view";
import { PaneHeader, ViewTitle } from "./view-header";

export const GROUP_ORDER: RequestStatus[] = ["in_review", "in_progress", "todo", "triage", "done", "declined"];

/**
 * Concept B's shared-inbox list in Concept A's vocabulary: the same pane
 * header, search field, priority and status glyphs, row separators and
 * selected state as the table.
 */
export function Queue({
  icon,
  copy,
  rows,
  grouped,
  groupLabel,
  selectedId,
  onSelect,
  isUnread,
  search,
  onSearch,
  sort,
  onSort,
  onMenu,
  onShowSidebar,
  snap,
  layoutKey,
}: {
  icon: ReactNode;
  copy: { label: string; description: string; emptyTitle: string; emptyBody: string };
  rows: Request[];
  grouped: boolean;
  groupLabel?: (status: RequestStatus) => string | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
  isUnread: (id: string) => boolean;
  search: string;
  onSearch: (value: string) => void;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
  onMenu: () => void;
  onShowSidebar: () => void;
  /** True while keyboard navigation is outpacing motion: the indicator jumps instead of sliding. */
  snap: boolean;
  /** Scopes the sliding indicator to this view, so switching views doesn't fly it across. */
  layoutKey: string;
}) {
  const groups: Array<{ status: RequestStatus | null; items: Request[] }> = grouped
    ? GROUP_ORDER.map((status) => ({ status, items: rows.filter((r) => r.status === status) })).filter(
        (g) => g.items.length,
      )
    : [{ status: null, items: rows }];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PaneHeader className="px-4">
        <ViewTitle icon={icon} title={copy.label} count={rows.length} onMenu={onMenu} onShowSidebar={onShowSidebar} />
        <Picker
          label="Sort"
          value={sort}
          onChange={onSort}
          align="end"
          width={200}
          options={(Object.keys(SORT_LABELS) as SortKey[]).map((k) => ({ value: k, label: SORT_LABELS[k] }))}
          triggerClassName="ml-auto grid size-7 shrink-0 place-items-center rounded-control text-fg-2 hover:bg-raised hover:text-fg"
        >
          <ArrowDownUp size={14} aria-hidden />
        </Picker>
      </PaneHeader>
      <div className="flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2.5">
        <SearchField value={search} onChange={onSearch} className="sm:max-w-none" />
        <p className="truncate px-0.5 text-meta text-fg-3">{copy.description}</p>
      </div>

      <LayoutGroup id={layoutKey}>
      <m.div layoutScroll data-request-list className="min-h-0 flex-1 overflow-y-auto">
        {rows.length === 0 ? (
          <EmptyState
            title={search ? "No matches" : copy.emptyTitle}
            body={search ? `Nothing in ${copy.label} matches “${search}”.` : copy.emptyBody}
          />
        ) : (
          groups.map((group) => (
            <section key={group.status ?? "all"} aria-label={group.status ? STATUS_META[group.status].label : copy.label}>
              {group.status ? (
                <h2 data-sticky className="sticky top-0 z-[2] flex h-8 items-center gap-2 border-b border-line-soft bg-canvas px-4 text-meta text-fg-2">
                  <StatusIcon status={group.status} size={12} />
                  {groupLabel?.(group.status) ?? STATUS_META[group.status].label}
                  <span className="text-fg-3 tabular-nums">{group.items.length}</span>
                </h2>
              ) : null}
              <ul className="relative">
                {/* Rows that leave (e.g. after approval) fade out while the rest glide up. */}
                <AnimatePresence initial={false} mode="popLayout">
                  {group.items.map((r) => (
                    <QueueRow
                      key={r.id}
                      request={r}
                      selected={r.id === selectedId}
                      unread={isUnread(r.id)}
                      snap={snap}
                      onSelect={() => onSelect(r.id)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          ))
        )}
      </m.div>
      </LayoutGroup>
    </div>
  );
}

function QueueRow({
  request: r,
  selected,
  unread,
  snap,
  onSelect,
  ref,
}: {
  request: Request;
  selected: boolean;
  unread: boolean;
  snap: boolean;
  onSelect: () => void;
  ref?: Ref<HTMLLIElement>;
}) {
  const api = useWorkspace();
  const owner = api.member(r.assigneeId);
  const due = r.dueDate ? dueLabel(r.dueDate, api.today) : null;
  const closed = r.status === "done" || r.status === "declined";
  const last = api.timeline(r.id).at(-1);

  // The latest thing that happened, so the queue reads like a shared inbox.
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
    snippet = (
      <>
        <span className="text-fg-2">{actor ? firstName(actor.name) : "Someone"}</span>{" "}
        {describeEvent(last.event, (id) => api.member(id)).text}
      </>
    );
  }

  return (
    <m.li
      ref={ref}
      layout="position"
      transition={{ layout: layoutSpring }}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.18, ease } }}
    >
      <button
        type="button"
        id={`item-${r.id}`}
        aria-current={selected || undefined}
        onClick={onSelect}
        className={cx(
          "relative flex w-full flex-col gap-1 border-b border-line-soft py-3 pr-4 pl-5 text-left transition-colors duration-75",
          !selected && "hover:bg-raised/60",
        )}
      >
        {/*
          The selection is one surface that slides between rows; it jumps when keys outpace it.
          It paints at z-0 and every row's content at z-1, so while it travels it passes
          beneath the rows it crosses instead of covering them.
        */}
        {selected ? (
          <m.span
            layoutId="queue-selection"
            transition={snap ? instant : indicatorSpring}
            aria-hidden
            className="absolute inset-0 z-0 bg-selected"
          >
            <span className="absolute inset-y-0 left-0 w-0.5 bg-accent" />
          </m.span>
        ) : null}
        {unread ? <span aria-hidden className="absolute top-[18px] left-2 z-[1] size-1.5 rounded-full bg-accent" /> : null}
        {/* Titles are the identity of a queue item: they wrap to two lines rather than truncate. */}
        <span className="relative z-[1] flex items-start gap-2">
          <PriorityIcon priority={r.priority} className="mt-0.5" />
          <span className={cx("line-clamp-2 min-w-0 flex-1 text-ui wrap-anywhere text-fg", unread ? "font-semibold" : "font-medium")}>
            {r.title}
            {unread ? <span className="sr-only"> (unread)</span> : null}
          </span>
          <time dateTime={r.updatedAt} className="shrink-0 pt-px text-meta text-fg-3 tabular-nums">
            {relativeTime(r.updatedAt, api.now)}
          </time>
        </span>
        <span className="relative z-[1] line-clamp-1 text-meta wrap-anywhere text-fg-3">{snippet}</span>
        <span className="relative z-[1] mt-1 flex items-center gap-2 text-meta text-fg-3">
          <StatusIcon status={r.status} size={12} />
          <span className="tabular-nums">{api.keyOf(r)}</span>
          {r.blocked ? <span className="font-medium text-danger-fg">Blocked</span> : null}
          {due && !closed ? (
            <span className={cx(due.tone === "overdue" && "text-danger-fg")}>
              {due.tone === "overdue" ? due.text : `Due ${due.text}`}
            </span>
          ) : null}
          <span className="ml-auto flex items-center gap-1.5">
            {owner ? null : <span>Unassigned</span>}
            <Avatar name={owner?.name} size={18} decorative={false} />
          </span>
        </span>
      </button>
    </m.li>
  );
}
