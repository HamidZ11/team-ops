"use client";

import { ArrowDownUp, ChevronsUpDown, Search, SignalHigh, Tag, UserRound, X } from "lucide-react";
import { m } from "motion/react";
import { useState, type ReactNode } from "react";
import { PRIORITY_META, PriorityIcon, STATUS_META, StatusIcon, TypeIcon } from "@/components/request/glyphs";
import { useWorkspace } from "@/components/request/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { Kbd } from "@/components/ui/kbd";
import { Picker } from "@/components/ui/picker";
import {
  countByStatus,
  EMPTY_FILTERS,
  SORT_LABELS,
  UNASSIGNED,
  type RequestFilters,
  type SortKey,
} from "@/domain/query";
import { PRIORITIES, type Priority, type Request, type RequestStatus } from "@/domain/types";
import { OPS_TEAM } from "../fixtures";
import { UnifiedTable } from "./request-table";
import { PaneHeader, ViewTitle } from "./view-header";

export type StatusTab = RequestStatus | "all";

export function TableView({
  icon,
  copy,
  filtered,
  rows,
  statusTab,
  onStatusTab,
  filters,
  onFilters,
  sort,
  onSort,
  selectedId,
  onOpen,
  checked,
  onCheck,
  onMenu,
  onShowSidebar,
  snap,
  layoutKey,
}: {
  icon: ReactNode;
  copy: { label: string; description: string; emptyTitle: string; emptyBody: string };
  /** Rows matching scope and filters, before the status tab. */
  filtered: Request[];
  /** What the table shows: filtered, status tab applied, sorted. */
  rows: Request[];
  statusTab: StatusTab;
  onStatusTab: (tab: StatusTab) => void;
  filters: RequestFilters;
  onFilters: (update: (f: RequestFilters) => RequestFilters) => void;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
  selectedId: string | null;
  onOpen: (id: string, via: "pointer" | "keyboard") => void;
  /** Ticked rows live with the view, so opening a request doesn't clear them. */
  checked: string[];
  onCheck: (ids: string[]) => void;
  onMenu: () => void;
  onShowSidebar: () => void;
  snap: boolean;
  layoutKey: string;
}) {
  const api = useWorkspace();
  const counts = countByStatus(filtered);
  const tabStatuses = (["triage", "todo", "in_progress", "in_review", "done", "declined"] as const).filter(
    (s) => counts[s],
  );
  const hasFilters = Boolean(filters.typeId || filters.ownerId || filters.priority || filters.search);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <PaneHeader className="px-4 md:px-5">
        <ViewTitle
          icon={icon}
          title={copy.label}
          count={filtered.length}
          description={copy.description}
          onMenu={onMenu}
          onShowSidebar={onShowSidebar}
        />
      </PaneHeader>

      <div className="scroll-row flex shrink-0 items-center gap-2 px-4 pt-4 pb-3 md:px-5">
        <FilterButton
          icon={<Tag size={13} aria-hidden />}
          label="Type"
          value={filters.typeId ? api.type(filters.typeId)?.name : undefined}
          options={api.types.map((t) => ({ value: t.id, label: t.name, icon: <TypeIcon icon={t.icon} /> }))}
          selected={filters.typeId}
          onChange={(typeId) => onFilters((f) => ({ ...f, typeId }))}
        />
        <FilterButton
          icon={<UserRound size={13} aria-hidden />}
          label="Owner"
          value={
            filters.ownerId === UNASSIGNED
              ? "Unassigned"
              : filters.ownerId
                ? api.member(filters.ownerId)?.name
                : undefined
          }
          options={[
            { value: UNASSIGNED, label: "Unassigned", icon: <Avatar name={null} size={18} /> },
            ...api.members
              .filter((m) => OPS_TEAM.includes(m.id))
              .map((m) => ({
                value: m.id,
                label: m.id === api.me.id ? `${m.name} (you)` : m.name,
                icon: <Avatar name={m.name} size={18} />,
              })),
          ]}
          selected={filters.ownerId}
          onChange={(ownerId) => onFilters((f) => ({ ...f, ownerId }))}
          searchable
        />
        <FilterButton
          icon={<SignalHigh size={13} aria-hidden />}
          label="Priority"
          value={filters.priority ? PRIORITY_META[filters.priority].label : undefined}
          options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_META[p].label, icon: <PriorityIcon priority={p} /> }))}
          selected={filters.priority}
          onChange={(priority) => onFilters((f) => ({ ...f, priority: priority as Priority | null }))}
        />
        {hasFilters ? (
          <Button variant="ghost" onClick={() => onFilters(() => EMPTY_FILTERS)}>
            Reset
          </Button>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-2 pb-3 md:px-5 md:pb-5">
        <section aria-label={copy.label} className="flex min-h-0 flex-1 flex-col rounded-tray border border-line bg-shell p-1">
          <div role="tablist" aria-label="Status" className="scroll-row flex h-10 shrink-0 items-stretch gap-1 px-2">
            {(["all", ...tabStatuses] as StatusTab[]).map((tab) => {
              const active = tab === statusTab;
              return (
                <button
                  key={tab}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => onStatusTab(tab)}
                  className={cx(
                    "relative flex shrink-0 items-center gap-2 px-2 text-ui transition-colors duration-100",
                    active ? "text-fg" : "text-fg-2 hover:text-fg",
                  )}
                >
                  {tab === "all" ? null : <StatusIcon status={tab} size={12} />}
                  {tab === "all" ? "All" : STATUS_META[tab].label}
                  <span
                    className={cx(
                      "rounded-[5px] px-1.5 py-px text-meta tabular-nums",
                      active ? "bg-selected text-fg-2" : "bg-raised text-fg-3",
                    )}
                  >
                    {tab === "all" ? filtered.length : counts[tab]}
                  </span>
                  {active ? <span aria-hidden className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-fg" /> : null}
                </button>
              );
            })}
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-panel border border-line bg-panel">
            {checked.length ? (
              <BulkBar ids={checked} onClear={() => onCheck([])} />
            ) : (
              <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-2">
                <SearchField value={filters.search} onChange={(search) => onFilters((f) => ({ ...f, search }))} />
                <Picker
                  label="Sort requests"
                  value={sort}
                  onChange={onSort}
                  align="end"
                  width={200}
                  options={(Object.keys(SORT_LABELS) as SortKey[]).map((k) => ({ value: k, label: SORT_LABELS[k] }))}
                  triggerClassName="ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-control px-2 text-ui text-fg-2 hover:bg-raised hover:text-fg"
                >
                  <ArrowDownUp size={14} aria-hidden />
                  <span className="max-sm:sr-only">{SORT_LABELS[sort]}</span>
                </Picker>
                <span className="hidden pr-1 text-meta text-fg-3 tabular-nums lg:inline">
                  {rows.length} {rows.length === 1 ? "request" : "requests"}
                </span>
              </div>
            )}
            <m.div layoutScroll data-table-scroll className="@container min-h-0 flex-1 overflow-auto">
              <UnifiedTable
                rows={rows}
                selectedId={selectedId}
                onOpen={onOpen}
                checked={checked}
                onCheck={onCheck}
                sort={sort}
                onSort={onSort}
                snap={snap}
                layoutKey={layoutKey}
                empty={
                  <EmptyState
                    title={hasFilters ? "No requests match these filters" : copy.emptyTitle}
                    body={hasFilters ? "Try removing a filter or searching for something else." : copy.emptyBody}
                    action={hasFilters ? <Button onClick={() => onFilters(() => EMPTY_FILTERS)}>Clear filters</Button> : null}
                  />
                }
              />
            </m.div>
          </div>
        </section>
      </div>
    </div>
  );
}

/** One search field style for the table toolbar and the queue. `data-search` is the target of "/". */
export function SearchField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label
      className={cx(
        "flex h-8 min-w-0 flex-1 items-center gap-2 rounded-control border border-line bg-canvas px-2.5 text-fg-3 focus-within:border-line-strong sm:max-w-[300px]",
        className,
      )}
    >
      <Search size={14} aria-hidden />
      <span className="sr-only">Search requests</span>
      <input
        data-search
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onChange("");
            e.currentTarget.blur();
          }
        }}
        placeholder="Search requests"
        className="h-full min-w-0 flex-1 bg-transparent text-ui text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none"
      />
      {value ? (
        <button type="button" aria-label="Clear search" onClick={() => onChange("")} className="text-fg-3 hover:text-fg">
          <X size={14} />
        </button>
      ) : (
        <Kbd className="max-sm:hidden">/</Kbd>
      )}
    </label>
  );
}

function FilterButton({
  icon,
  label,
  value,
  options,
  selected,
  onChange,
  searchable,
}: {
  icon: ReactNode;
  label: string;
  value: string | undefined;
  options: Array<{ value: string; label: string; icon?: ReactNode }>;
  selected: string | null;
  onChange: (value: string | null) => void;
  searchable?: boolean;
}) {
  const ANY = "__any__";
  return (
    <Picker
      label={`Filter by ${label.toLowerCase()}`}
      value={selected ?? ANY}
      onChange={(v) => onChange(v === ANY ? null : v)}
      options={[{ value: ANY, label: `Any ${label.toLowerCase()}` }, ...options]}
      searchable={searchable}
      triggerClassName={cx(
        "flex h-7 shrink-0 items-center gap-1.5 rounded-control border px-2 text-ui transition-colors duration-100",
        value
          ? "border-line-strong bg-raised text-fg"
          : "border-line bg-shell text-fg-2 hover:border-line-strong hover:bg-raised hover:text-fg",
      )}
    >
      <span className="text-fg-3">{icon}</span>
      {value ? (
        <span className="max-w-[160px] truncate">
          <span className="text-fg-3">{label}: </span>
          {value}
        </span>
      ) : (
        label
      )}
      <ChevronsUpDown size={12} aria-hidden className="text-fg-3" />
    </Picker>
  );
}

function BulkBar({ ids, onClear }: { ids: string[]; onClear: () => void }) {
  const api = useWorkspace();
  const [message, setMessage] = useState<string | null>(null);

  function applyAll(action: Parameters<typeof api.perform>[1]) {
    const failures = ids.map((id) => api.perform(id, action)).filter((r) => !r.ok);
    const first = failures[0];
    setMessage(
      first && !first.ok
        ? `${ids.length - failures.length} updated, ${failures.length} skipped: ${first.error}`
        : `${ids.length} updated`,
    );
  }

  const trigger =
    "flex h-7 items-center gap-1.5 rounded-control border border-line bg-shell px-2 text-ui text-fg-2 hover:text-fg";

  return (
    <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line bg-raised/60 px-3">
      <span className="text-ui font-medium text-fg tabular-nums">{ids.length} selected</span>
      <span className="mx-1 h-4 w-px bg-line-strong" aria-hidden />
      <Picker
        label="Assign selected"
        value={null}
        searchable
        onChange={(assigneeId) => applyAll({ type: "assign", assigneeId })}
        options={api.members
          .filter((m) => OPS_TEAM.includes(m.id))
          .map((m) => ({ value: m.id, label: m.name, icon: <Avatar name={m.name} size={18} /> }))}
        triggerClassName={trigger}
      >
        <UserRound size={13} aria-hidden />
        Assign
      </Picker>
      <Picker
        label="Set priority for selected"
        value={null}
        onChange={(priority) => applyAll({ type: "set_priority", priority })}
        options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_META[p].label, icon: <PriorityIcon priority={p} /> }))}
        triggerClassName={trigger}
      >
        <SignalHigh size={13} aria-hidden />
        Priority
      </Picker>
      {message ? (
        <span role="status" className="hidden min-w-0 truncate text-meta text-fg-3 md:inline">
          {message}
        </span>
      ) : null}
      <Button variant="ghost" className="ml-auto" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-16 text-center">
      <p className="text-ui font-medium text-fg">{title}</p>
      <p className="max-w-[320px] text-meta text-fg-3">{body}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
