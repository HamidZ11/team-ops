"use client";

import { ArrowDown, Ban, MessageSquare } from "lucide-react";
import { LayoutGroup, m } from "motion/react";
import type { ReactNode } from "react";
import { PriorityIcon, StatusChip, StatusIcon, TypeIcon } from "@/components/request/glyphs";
import { useWorkspace } from "@/components/request/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import { cx } from "@/components/ui/cx";
import { indicatorSpring, instant } from "@/components/ui/springs";
import { dueLabel, firstName, relativeTime, shortDate } from "@/domain/format";
import type { SortKey } from "@/domain/query";
import type { Request } from "@/domain/types";

/*
 * Concept A's table, re-proportioned for the unified shell. Fixed columns are
 * sized to their longest measured value at 13px Inter, including cell padding:
 *   ID 78 ("OPS-1068", tabular digits), Type 164 ("Vendors & contracts" + icon),
 *   Status 136 ("In progress" chip + blocked marker), Owner 148 ("Tomás Lindqvist"),
 *   Approval 96 (avatar + first name + pending dot), Due 96 ("31 Dec 2099").
 * ID and Due also truncate, so unexpected values (long keys, odd dates) can't spill.
 * The Request column takes the rest: ~385px at 1440, ~391px at 1280 (Type hidden).
 * Blocked is a state flag, so it sits with the status rather than taking title space.
 * Columns drop by container width, least important first: Updated, Type, Approval, Due.
 */

const th =
  "sticky top-0 z-[1] h-9 bg-panel px-2 text-left text-meta font-normal text-fg-3 shadow-[inset_0_-1px_0_var(--color-line)]";

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  className,
  align = "left",
}: {
  label: ReactNode;
  sortKey: SortKey;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
  className?: string;
  align?: "left" | "right";
}) {
  const active = sort === sortKey;
  return (
    <th
      scope="col"
      aria-sort={active ? (sortKey === "updated" || sortKey === "created" ? "descending" : "ascending") : undefined}
      className={cx(th, className)}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cx(
          "-mx-1 inline-flex items-center gap-1 rounded-[4px] px-1 hover:text-fg-2",
          active && "text-fg-2",
          align === "right" && "flex-row-reverse",
        )}
      >
        {label}
        <ArrowDown size={11} aria-hidden className={cx(!active && "invisible")} />
      </button>
    </th>
  );
}

export function UnifiedTable({
  rows,
  selectedId,
  onOpen,
  checked,
  onCheck,
  sort,
  onSort,
  empty,
  snap,
  layoutKey,
}: {
  rows: Request[];
  selectedId: string | null;
  /** `via` tells the caller whether to play the pointer-only entrance. */
  onOpen: (id: string, via: "pointer" | "keyboard") => void;
  checked: string[];
  onCheck: (ids: string[]) => void;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
  empty: ReactNode;
  /** Keyboard navigation is outpacing motion: the accent jumps instead of sliding. */
  snap: boolean;
  layoutKey: string;
}) {
  const api = useWorkspace();
  if (!rows.length) return <>{empty}</>;

  const allChecked = rows.every((r) => checked.includes(r.id));
  const someChecked = !allChecked && rows.some((r) => checked.includes(r.id));

  return (
    <LayoutGroup id={layoutKey}>
      <table data-request-list className="hidden w-full table-fixed border-separate border-spacing-0 @min-[600px]:table">
        <thead>
          <tr>
            <th scope="col" className={cx(th, "w-10 pl-3")}>
              <input
                type="checkbox"
                className="checkbox"
                aria-label="Select all"
                checked={allChecked}
                ref={(el) => {
                  if (el) el.indeterminate = someChecked;
                }}
                onChange={() => onCheck(allChecked ? [] : rows.map((r) => r.id))}
              />
            </th>
            <SortHeader
              label={<span className="sr-only">Priority</span>}
              sortKey="priority"
              sort={sort}
              onSort={onSort}
              className="w-7 px-0"
            />
            <th scope="col" className={cx(th, "w-[78px]")}>ID</th>
            <th scope="col" className={th}>Request</th>
            <th scope="col" className={cx(th, "hidden w-[164px] @min-[1040px]:table-cell")}>Type</th>
            <th scope="col" className={cx(th, "w-[136px]")}>Status</th>
            <th scope="col" className={cx(th, "w-11 @min-[860px]:w-[148px]")}>
              <span className="@max-[859px]:sr-only">Owner</span>
            </th>
            <th scope="col" className={cx(th, "hidden w-[96px] @min-[960px]:table-cell")}>Approval</th>
            <SortHeader
              label="Due"
              sortKey="due"
              sort={sort}
              onSort={onSort}
              align="right"
              className="hidden w-[96px] text-right @min-[700px]:table-cell"
            />
            <SortHeader
              label="Updated"
              sortKey="updated"
              sort={sort}
              onSort={onSort}
              align="right"
              className="hidden w-[84px] pr-4 text-right @min-[1240px]:table-cell"
            />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const selected = r.id === selectedId;
            const owner = api.member(r.assigneeId);
            const approver = api.member(r.approverId);
            const type = api.type(r.typeId);
            const due = r.dueDate ? dueLabel(r.dueDate, api.today) : null;
            const closed = r.status === "done" || r.status === "declined";
            const comments = api.commentCount(r.id);
            const td = "h-10 border-b border-line-soft px-2";
            return (
              <tr
                key={r.id}
                id={`row-${r.id}`}
                aria-selected={selected}
                onClick={() => onOpen(r.id, "pointer")}
                className={cx(
                  "group cursor-pointer text-ui text-fg-2 transition-colors duration-75",
                  selected ? "bg-selected" : "hover:bg-raised/60",
                )}
              >
                <td className={cx(td, "relative pl-3")} onClick={(e) => e.stopPropagation()}>
                  {selected ? (
                    <m.span
                      layoutId="table-selection"
                      transition={snap ? instant : indicatorSpring}
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-0.5 bg-accent"
                    />
                  ) : null}
                  <input
                    type="checkbox"
                    className="checkbox align-middle"
                    aria-label={`Select ${api.keyOf(r)}`}
                    checked={checked.includes(r.id)}
                    onChange={(e) =>
                      onCheck(e.target.checked ? [...checked, r.id] : checked.filter((c) => c !== r.id))
                    }
                  />
                </td>
                <td className={cx(td, "px-0")}>
                  <PriorityIcon priority={r.priority} className="mx-auto" />
                </td>
                <td className={cx(td, "truncate pr-1 text-meta text-fg-3 tabular-nums")} title={api.keyOf(r)}>
                  {api.keyOf(r)}
                </td>
                <td className={cx(td, "pr-4")}>
                  <div className="flex min-w-0 items-center gap-2">
                    <button
                      type="button"
                      data-row-open
                      aria-current={selected || undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        // A click from Enter/Space has no pointer detail.
                        onOpen(r.id, e.detail === 0 ? "keyboard" : "pointer");
                      }}
                      className={cx("min-w-0 truncate rounded-[3px] text-left text-fg", closed && "text-fg-2")}
                    >
                      {r.title}
                    </button>
                    {comments ? (
                      <span className="hidden shrink-0 items-center gap-1 text-meta text-fg-3 tabular-nums @min-[760px]:inline-flex">
                        <MessageSquare size={12} aria-hidden />
                        {comments}
                        <span className="sr-only"> comments</span>
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className={cx(td, "hidden @min-[1040px]:table-cell")}>
                  <span className="flex min-w-0 items-center gap-2">
                    {type ? <TypeIcon icon={type.icon} className="text-fg-3" /> : null}
                    <span className="truncate">{type?.name}</span>
                  </span>
                </td>
                <td className={td}>
                  <span className="flex items-center gap-1.5">
                    <StatusChip status={r.status} />
                    {r.blocked ? (
                      <span
                        className="grid size-[22px] shrink-0 place-items-center rounded-chip bg-danger/12 text-danger-fg"
                        title={`Blocked: ${r.blocked.reason}`}
                      >
                        <Ban size={12} aria-hidden />
                        <span className="sr-only">Blocked: {r.blocked.reason}</span>
                      </span>
                    ) : null}
                  </span>
                </td>
                <td className={td}>
                  <span className="flex min-w-0 items-center gap-2">
                    <Avatar name={owner?.name} size={20} decorative={false} />
                    <span className={cx("hidden truncate @min-[860px]:inline", !owner && "text-fg-3")}>
                      {owner ? owner.name : "Unassigned"}
                    </span>
                  </span>
                </td>
                <td className={cx(td, "hidden @min-[960px]:table-cell")}>
                  {approver ? (
                    <span
                      className="flex min-w-0 items-center gap-2"
                      title={r.status === "in_review" ? `Waiting on ${approver.name}` : `Approval by ${approver.name}`}
                    >
                      <Avatar name={approver.name} size={18} />
                      {/* The status column already says "In review"; here the approver brightens when it's their move. */}
                      <span className={cx("truncate", r.status === "in_review" ? "text-fg" : "text-fg-3")}>
                        {firstName(approver.name)}
                      </span>
                      {r.status === "in_review" ? (
                        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[var(--color-st-review)]" />
                      ) : null}
                      {r.status === "in_review" ? <span className="sr-only">, waiting for decision</span> : null}
                    </span>
                  ) : (
                    <span className="text-fg-4">—</span>
                  )}
                </td>
                <td
                  title={due && !closed && r.dueDate ? shortDate(r.dueDate, api.today) : undefined}
                  className={cx(
                    td,
                    "hidden truncate pl-1 text-right tabular-nums @min-[700px]:table-cell",
                    due?.tone === "overdue" && !closed ? "text-danger-fg" : "text-fg-2",
                  )}
                >
                  {due && !closed ? due.text : <span className="text-fg-4">—</span>}
                </td>
                <td className={cx(td, "hidden pr-4 text-right text-meta text-fg-3 tabular-nums @min-[1240px]:table-cell")}>
                  {relativeTime(r.updatedAt, api.now)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Narrow containers (and phones) keep A's stacked rows. */}
      <ul className="divide-y divide-line-soft @min-[600px]:hidden">
        {rows.map((r) => {
          const owner = api.member(r.assigneeId);
          const type = api.type(r.typeId);
          const due = r.dueDate ? dueLabel(r.dueDate, api.today) : null;
          const closed = r.status === "done" || r.status === "declined";
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={(e) => onOpen(r.id, e.detail === 0 ? "keyboard" : "pointer")}
                aria-current={r.id === selectedId || undefined}
                className="flex w-full items-start gap-3 px-3 py-3 text-left active:bg-raised aria-[current=true]:bg-selected"
              >
                <StatusIcon status={r.status} className="mt-0.5" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-ui text-fg">{r.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-fg-3">
                    <PriorityIcon priority={r.priority} size={12} />
                    <span className="tabular-nums">{api.keyOf(r)}</span>
                    {type ? <span>{type.name}</span> : null}
                    {due && !closed ? (
                      <span className={cx(due.tone === "overdue" && "text-danger-fg")}>
                        {due.tone === "overdue" ? due.text : `Due ${due.text}`}
                      </span>
                    ) : null}
                    {r.blocked ? <span className="font-medium text-danger-fg">Blocked</span> : null}
                  </span>
                </span>
                <Avatar name={owner?.name} size={20} decorative={false} className="mt-px" />
              </button>
            </li>
          );
        })}
      </ul>
    </LayoutGroup>
  );
}
