"use client";

import {
  ArrowDownUp,
  ChevronsUpDown,
  Menu,
  Plus,
  Search,
  SignalHigh,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PRIORITY_META, PriorityIcon, STATUS_META, StatusIcon, TypeIcon } from "@/components/request/glyphs";
import { NewRequestDialog } from "@/components/request/new-request-dialog";
import { useWorkspace } from "@/components/request/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { Kbd } from "@/components/ui/kbd";
import { Picker } from "@/components/ui/picker";
import {
  applyFilters,
  countByStatus,
  EMPTY_FILTERS,
  SORT_LABELS,
  sortRequests,
  UNASSIGNED,
  type RequestFilters,
  type SortKey,
} from "@/domain/query";
import { PRIORITIES, type Priority, type RequestStatus } from "@/domain/types";
import { OPS_TEAM } from "../fixtures";
import { decodeScope, encodeScope, sameScope, scopeCopy, scopeRequests, type Scope } from "../scope";
import { PrototypeWorkspace, usePrototype } from "../store";
import { isTypingTarget, readParams, writeParams } from "../url-state";
import { ConsoleSidebar, VIEW_ICONS } from "./console-sidebar";
import { DetailPanel } from "./detail-panel";
import { Insights } from "./insights";
import { RequestTable } from "./request-table";

export function ConsoleApp() {
  return (
    <PrototypeWorkspace>
      <Console />
    </PrototypeWorkspace>
  );
}

const DEFAULT_SCOPE: Scope = { kind: "view", id: "all" };
type StatusTab = RequestStatus | "all";

function Console() {
  const api = useWorkspace();
  const extras = usePrototype();
  const [scope, setScope] = useState<Scope>(DEFAULT_SCOPE);
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [filters, setFilters] = useState<RequestFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("updated");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [navOpen, setNavOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restored, setRestored] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Restore view and selection from the URL once, after hydration. Reading the
  // URL during render would make the client disagree with the static HTML.
  useEffect(() => {
    const params = readParams();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScope(decodeScope(params.get("scope"), DEFAULT_SCOPE));
    const key = params.get("r");
    if (key) {
      const match = api.requests.find((r) => api.keyOf(r) === key);
      if (match) setSelectedId(match.id);
    }
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = selectedId ? api.request(selectedId) : undefined;

  useEffect(() => {
    if (!restored) return;
    writeParams({
      scope: sameScope(scope, DEFAULT_SCOPE) ? null : encodeScope(scope),
      r: selected ? api.keyOf(selected) : null,
    });
  }, [restored, scope, selected, api]);

  const ctx = { meId: api.me.id, today: api.today };
  const copy = scopeCopy(scope, api);
  const scoped = scopeRequests(api.requests, scope, ctx);
  const filtered = applyFilters(scoped, filters, api.keyOf);
  const counts = countByStatus(filtered);
  const tabStatuses = (
    ["triage", "todo", "in_progress", "in_review", "done", "declined"] as const
  ).filter((s) => counts[s]);
  const rows = useMemo(
    () => sortRequests(statusTab === "all" ? filtered : filtered.filter((r) => r.status === statusTab), sort),
    [filtered, statusTab, sort],
  );
  const position = selected ? { index: rows.findIndex((r) => r.id === selected.id), total: rows.length } : null;

  const changeScope = (next: Scope) => {
    setScope(next);
    setStatusTab("all");
    setChecked([]);
    setNavOpen(false);
  };

  const step = useCallback(
    (direction: 1 | -1) => {
      if (!rows.length) return;
      const index = selectedId ? rows.findIndex((r) => r.id === selectedId) : -1;
      const next = rows[Math.max(0, Math.min(rows.length - 1, index + direction))];
      if (!next) return;
      setSelectedId(next.id);
      document.getElementById(`row-${next.id}`)?.scrollIntoView({ block: "nearest" });
    },
    [rows, selectedId],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "j" || e.key === "ArrowDown") {
        if (e.key === "ArrowDown" && !selectedId) return;
        e.preventDefault();
        step(1);
      } else if (e.key === "k" || e.key === "ArrowUp") {
        if (e.key === "ArrowUp" && !selectedId) return;
        e.preventDefault();
        step(-1);
      } else if (e.key === "Escape" && selectedId) {
        setSelectedId(null);
      } else if (e.key === "c") {
        e.preventDefault();
        setCreating(true);
      } else if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, selectedId]);

  const ViewIcon = scope.kind === "view" ? VIEW_ICONS[scope.id] : null;
  const scopeType = scope.kind === "type" ? api.type(scope.id) : undefined;
  const hasFilters = filters.typeId || filters.ownerId || filters.priority || filters.search;

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas text-fg">
      <aside aria-label="Navigation" className="hidden w-[232px] shrink-0 border-r border-line bg-shell md:block">
        <ConsoleSidebar
          scope={scope}
          onScope={changeScope}
          onSetMe={extras.setMe}
          onSearch={() => searchRef.current?.focus()}
        />
      </aside>

      {navOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/60"
            onClick={() => setNavOpen(false)}
          />
          <aside aria-label="Navigation" className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-line bg-shell">
            <ConsoleSidebar
              scope={scope}
              onScope={changeScope}
              onSetMe={extras.setMe}
              onSearch={() => {
                setNavOpen(false);
                searchRef.current?.focus();
              }}
              onClose={() => setNavOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto md:overflow-hidden">
          <header className="flex shrink-0 flex-col gap-3 px-4 pt-3 pb-3 md:px-6 md:pt-5">
            <div className="flex min-h-8 items-center gap-2.5">
              <Button
                variant="ghost"
                size="icon-md"
                className="-ml-2 md:hidden"
                aria-label="Open navigation"
                onClick={() => setNavOpen(true)}
              >
                <Menu size={18} />
              </Button>
              <span className="grid size-6 shrink-0 place-items-center rounded-[6px] border border-line bg-raised text-fg-2">
                {ViewIcon ? <ViewIcon size={14} aria-hidden /> : null}
                {scopeType ? <TypeIcon icon={scopeType.icon} size={14} /> : null}
              </span>
              <h1 className="min-w-0 truncate text-title font-medium">{copy.label}</h1>
              <p className="hidden min-w-0 truncate text-meta text-fg-3 lg:block">{copy.description}</p>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="primary" onClick={() => setCreating(true)} aria-label="New request (C)">
                  <Plus size={15} aria-hidden />
                  <span className="max-sm:hidden">New request</span>
                </Button>
              </div>
            </div>

            <div className="scroll-row -mx-4 flex items-center gap-2 px-4 md:mx-0 md:px-0">
              <FilterButton
                icon={<Tag size={13} aria-hidden />}
                label="Type"
                value={filters.typeId ? api.type(filters.typeId)?.name : undefined}
                options={api.types.map((t) => ({ value: t.id, label: t.name, icon: <TypeIcon icon={t.icon} /> }))}
                selected={filters.typeId}
                onChange={(typeId) => setFilters((f) => ({ ...f, typeId }))}
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
                onChange={(ownerId) => setFilters((f) => ({ ...f, ownerId }))}
                searchable
              />
              <FilterButton
                icon={<SignalHigh size={13} aria-hidden />}
                label="Priority"
                value={filters.priority ? PRIORITY_META[filters.priority].label : undefined}
                options={PRIORITIES.map((p) => ({
                  value: p,
                  label: PRIORITY_META[p].label,
                  icon: <PriorityIcon priority={p} />,
                }))}
                selected={filters.priority}
                onChange={(priority) => setFilters((f) => ({ ...f, priority: priority as Priority | null }))}
              />
              {hasFilters ? (
                <Button variant="ghost" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Reset
                </Button>
              ) : null}
            </div>
          </header>

          <div className="flex flex-col gap-3 px-2 pb-3 md:min-h-0 md:flex-1 md:px-6 md:pb-6">
            {sameScope(scope, DEFAULT_SCOPE) ? <Insights /> : null}

            <section
              aria-label={copy.label}
              className="flex flex-col rounded-tray border border-line bg-shell p-1 md:min-h-[320px] md:flex-1"
            >
              <div role="tablist" aria-label="Status" className="scroll-row flex h-10 shrink-0 items-stretch gap-1 px-2">
                {(["all", ...tabStatuses] as StatusTab[]).map((tab) => {
                  const active = tab === statusTab;
                  return (
                    <button
                      key={tab}
                      role="tab"
                      type="button"
                      aria-selected={active}
                      onClick={() => setStatusTab(tab)}
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

              <div className="flex flex-col overflow-hidden rounded-panel border border-line bg-panel md:min-h-0 md:flex-1">
                {checked.length ? (
                  <BulkBar ids={checked} onClear={() => setChecked([])} />
                ) : (
                  <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-2">
                    <label className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-control border border-line bg-canvas px-2.5 text-fg-3 focus-within:border-line-strong sm:max-w-[300px]">
                      <Search size={14} aria-hidden />
                      <span className="sr-only">Search requests</span>
                      <input
                        ref={searchRef}
                        value={filters.search}
                        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setFilters((f) => ({ ...f, search: "" }));
                            e.currentTarget.blur();
                          }
                        }}
                        placeholder="Search requests"
                        className="h-full min-w-0 flex-1 bg-transparent text-ui text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none"
                      />
                      {filters.search ? (
                        <button
                          type="button"
                          aria-label="Clear search"
                          onClick={() => setFilters((f) => ({ ...f, search: "" }))}
                          className="text-fg-3 hover:text-fg"
                        >
                          <X size={14} />
                        </button>
                      ) : (
                        <Kbd className="max-sm:hidden">/</Kbd>
                      )}
                    </label>
                    <Picker
                      label="Sort requests"
                      value={sort}
                      onChange={setSort}
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

                <div className="@container md:min-h-0 md:flex-1 md:overflow-auto">
                  <RequestTable
                    rows={rows}
                    selectedId={selectedId}
                    onOpen={setSelectedId}
                    checked={checked}
                    onCheck={setChecked}
                    sort={sort}
                    onSort={setSort}
                    empty={
                      <EmptyState
                        title={hasFilters ? "No requests match these filters" : copy.emptyTitle}
                        body={hasFilters ? "Try removing a filter or searching for something else." : copy.emptyBody}
                        action={
                          hasFilters ? (
                            <Button onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</Button>
                          ) : null
                        }
                      />
                    }
                  />
                </div>
              </div>
            </section>
          </div>
        </main>

        {selected ? (
          <DetailPanel
            key={selected.id}
            request={selected}
            position={position && position.index >= 0 ? position : null}
            onClose={() => setSelectedId(null)}
            onStep={step}
          />
        ) : null}
      </div>

      <NewRequestDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(request) => {
          setCreating(false);
          changeScope({ kind: "view", id: "inbox" });
          setFilters(EMPTY_FILTERS);
          setSelectedId(request.id);
        }}
      />
    </div>
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
    setMessage(
      failures.length
        ? `${ids.length - failures.length} updated, ${failures.length} skipped: ${failures[0].ok ? "" : failures[0].error}`
        : `${ids.length} updated`,
    );
  }

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
        triggerClassName="flex h-7 items-center gap-1.5 rounded-control border border-line bg-shell px-2 text-ui text-fg-2 hover:text-fg"
      >
        <UserRound size={13} aria-hidden />
        Assign
      </Picker>
      <Picker
        label="Set priority for selected"
        value={null}
        onChange={(priority) => applyAll({ type: "set_priority", priority })}
        options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_META[p].label, icon: <PriorityIcon priority={p} /> }))}
        triggerClassName="flex h-7 items-center gap-1.5 rounded-control border border-line bg-shell px-2 text-ui text-fg-2 hover:text-fg"
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

function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-16 text-center">
      <p className="text-ui font-medium text-fg">{title}</p>
      <p className="max-w-[320px] text-meta text-fg-3">{body}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
