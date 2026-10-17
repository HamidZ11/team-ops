"use client";

import { domMax, LazyMotion, MotionConfig } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { TypeIcon } from "@/components/request/glyphs";
import { NewRequestDialog } from "@/components/request/new-request-dialog";
import { useWorkspace } from "@/components/request/workspace-context";
import { cx } from "@/components/ui/cx";
import { CalendarPickerContext } from "@/components/ui/date-picker";
import { MotionContext } from "@/components/ui/motion";
import { isPopoverOpen } from "@/components/ui/popover";
import { applyFilters, EMPTY_FILTERS, sortRequests, type RequestFilters, type SortKey } from "@/domain/query";
import type { Request } from "@/domain/types";
import type { ViewId } from "@/domain/views";
import { decodeScope, encodeScope, sameScope, scopeCopy, scopeRequests, type Scope } from "../scope";
import { PrototypeWorkspace, usePrototype } from "../store";
import { isTypingTarget, readParams, writeParams } from "../url-state";
import { useMedia } from "../use-media";
import { GROUP_ORDER, Queue } from "./queue";
import { RequestWorkspace } from "./request-workspace";
import { restoreSidebarPreference, setSidebarOpen, useSidebarOpen } from "./sidebar-state";
import { UnifiedSidebar, VIEW_ICONS } from "./sidebar";
import { EmptyState, TableView, type StatusTab } from "./table-view";

export function UnifiedApp() {
  return (
    <PrototypeWorkspace>
      {/* strict: only the lightweight `m.*` components may be used inside. */}
      <LazyMotion features={domMax} strict>
        {/* Honour reduced motion: Motion drops movement and layout animation, keeping brief fades. */}
        <MotionConfig reducedMotion="user">
          <MotionContext.Provider value={true}>
            <CalendarPickerContext.Provider value={true}>
              <Unified />
            </CalendarPickerContext.Provider>
          </MotionContext.Provider>
        </MotionConfig>
      </LazyMotion>
    </PrototypeWorkspace>
  );
}

const DEFAULT_SCOPE: Scope = { kind: "view", id: "inbox" };

/**
 * Work you act on one at a time gets the queue; everything else is a table
 * for scanning and comparing. Both open the same request workspace.
 */
const QUEUE_VIEWS: ViewId[] = ["inbox", "my_work", "approvals"];
const isQueue = (scope: Scope) => scope.kind === "view" && QUEUE_VIEWS.includes(scope.id);
const isGrouped = (scope: Scope) => scope.kind === "view" && scope.id === "my_work";
const SPLIT_QUERY = "(min-width: 1024px)";

/**
 * Where keyboard focus should land after the selection or view changes.
 * - list: the newly selected queue item or table row (focus follows selection)
 * - nav:  the same header control in the next request (e.g. "Next (J)")
 * - title: the opened request's title
 * - row:  returning to the table, the row that was opened (or its neighbour)
 */
type FocusIntent =
  | { kind: "list" }
  | { kind: "nav"; label: string }
  | { kind: "title" }
  | { kind: "row"; id: string; index: number };

/** The first match outside an inert subtree (e.g. the table hidden under an open request). */
function live(selector: string) {
  return [...document.querySelectorAll(selector)].find((el) => !el.closest("[inert]")) ?? null;
}

/**
 * Scrolls only the list or table that holds `el` so it's fully visible below any
 * sticky header. Unlike scrollIntoView, it never scrolls the page or a clipped
 * ancestor, so the shell can't shift.
 */
function reveal(el: Element | null) {
  const box = el?.closest<HTMLElement>("[data-table-scroll]") ?? el?.closest<HTMLElement>("[data-request-list]");
  if (!el || !box) return;
  const head = el.closest("section")?.querySelector<HTMLElement>("[data-sticky]") ?? box.querySelector<HTMLElement>("thead");
  const view = box.getBoundingClientRect();
  const item = el.getBoundingClientRect();
  const top = view.top + (head?.offsetHeight ?? 0);
  if (item.top < top) box.scrollTop -= top - item.top;
  else if (item.bottom > view.bottom) box.scrollTop += item.bottom - view.bottom;
}

/** Grouped queues step through requests in the order they're drawn. */
function ordered(list: Request[], scope: Scope) {
  if (!isGrouped(scope)) return list;
  return [...list].sort((a, b) => GROUP_ORDER.indexOf(a.status) - GROUP_ORDER.indexOf(b.status));
}

function Unified() {
  const api = useWorkspace();
  const extras = usePrototype();
  const [scope, setScope] = useState<Scope>(DEFAULT_SCOPE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Table views only: the selected request is open as a page. */
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<RequestFilters>(EMPTY_FILTERS);
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [following, setFollowing] = useState<string[]>(["req_1050", "req_1059", "req_1051"]);
  const [navOpen, setNavOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdByPointer, setCreatedByPointer] = useState(false);
  const [restored, setRestored] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  /*
   * How a selection change should move. "snap" when keys arrive faster than
   * motion can follow (< 160ms apart): indicators jump and content swaps
   * instantly, so motion never falls behind input.
   */
  const [selectionMotion, setSelectionMotion] = useState<"none" | "snap" | "animate">("none");
  const lastStep = useRef(0);
  const sidebarOpen = useSidebarOpen();
  // After a client-side navigation the bootstrap script hasn't run; apply the saved preference.
  useLayoutEffect(() => restoreSidebarPreference(), []);
  const focusIntent = useRef<FocusIntent | null>(null);
  // At 1024px and up the queue and the request sit side by side, so something is always selected.
  const split = useMedia(SPLIT_QUERY);

  /*
   * On desktop a queue always shows a request. The first one is selected
   * explicitly (not just displayed), so acting on it keeps it on screen with
   * its new state instead of jumping to the next item.
   */
  const firstIn = (next: Scope) =>
    isQueue(next) && window.matchMedia(SPLIT_QUERY).matches
      ? (ordered(sortRequests(scopeRequests(api.requests, next, { meId: api.me.id, today: api.today }), sort), next)[0]
          ?.id ?? null)
      : null;

  useEffect(() => {
    const params = readParams();
    const restoredScope = decodeScope(params.get("scope"), DEFAULT_SCOPE);
    // Restoring from the URL after hydration; reading it during render would mismatch the static HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScope(restoredScope);
    const key = params.get("r");
    const match = key ? api.requests.find((r) => api.keyOf(r) === key) : undefined;
    if (match) {
      setSelectedId(match.id);
      if (!isQueue(restoredScope)) setOpen(true);
    } else {
      setSelectedId(firstIn(restoredScope));
    }
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const queue = isQueue(scope);
  const ctx = { meId: api.me.id, today: api.today };
  const copy = scopeCopy(scope, api);
  const ViewIcon = scope.kind === "view" ? VIEW_ICONS[scope.id] : null;
  const icon = ViewIcon ? (
    <ViewIcon size={14} aria-hidden />
  ) : scope.kind === "type" ? (
    <TypeIcon icon={api.type(scope.id)?.icon ?? "tag"} size={14} />
  ) : null;

  const filtered = useMemo(
    () =>
      applyFilters(
        scopeRequests(api.requests, scope, ctx),
        queue ? { ...EMPTY_FILTERS, search: filters.search } : filters,
        api.keyOf,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api, scope, filters, queue],
  );
  const rows = useMemo(
    () =>
      ordered(
        sortRequests(statusTab === "all" || queue ? filtered : filtered.filter((r) => r.status === statusTab), sort),
        scope,
      ),
    [filtered, statusTab, sort, queue, scope],
  );

  const effectiveId = queue
    ? selectedId && api.request(selectedId)
      ? selectedId
      : split
        ? (rows[0]?.id ?? null)
        : null
    : selectedId;
  const selected = effectiveId ? api.request(effectiveId) : undefined;
  const position = selected ? { index: rows.findIndex((r) => r.id === selected.id), total: rows.length } : null;
  const showingRequest = queue ? Boolean(selected) : open && Boolean(selected);

  useEffect(() => {
    if (!restored) return;
    writeParams({
      scope: sameScope(scope, DEFAULT_SCOPE) ? null : encodeScope(scope),
      r: selected && (queue ? selectedId : open) ? api.keyOf(selected) : null,
    });
  }, [restored, scope, selected, selectedId, open, queue, api]);

  const { markRead } = extras;
  useEffect(() => {
    if (showingRequest && effectiveId) markRead(effectiveId);
  }, [showingRequest, effectiveId, markRead]);

  const changeScope = (next: Scope) => {
    setSelectionMotion("none");
    setScope(next);
    setSelectedId(firstIn(next));
    setOpen(false);
    setChecked([]);
    focusIntent.current = null;
    setStatusTab("all");
    setFilters(EMPTY_FILTERS);
    setNavOpen(false);
  };

  /*
   * j/k never takes focus from a text field (they don't reach here) or from an
   * unrelated control. Focus follows the selection only when it was already in
   * the list, nowhere, or on a control that's about to be replaced.
   */
  const intentForStep = useCallback((): FocusIntent | null => {
    const fallback: FocusIntent = !queue && open ? { kind: "title" } : { kind: "list" };
    const active = document.activeElement as HTMLElement | null;
    if (!active || active === document.body) return fallback;
    if (active.closest("[data-request-list]")) return { kind: "list" };
    const label = active.getAttribute("aria-label");
    if (active.closest("[data-request-nav]") && label) return { kind: "nav", label };
    if (active.closest("[data-request-workspace]")) return fallback;
    return null;
  }, [queue, open]);

  const step = useCallback(
    (direction: 1 | -1) => {
      if (!rows.length) return;
      const index = effectiveId ? rows.findIndex((r) => r.id === effectiveId) : -1;
      const next = rows[Math.max(0, Math.min(rows.length - 1, index + direction))];
      if (!next || next.id === effectiveId) return;
      const now = performance.now();
      setSelectionMotion(now - lastStep.current < 160 ? "snap" : "animate");
      lastStep.current = now;
      focusIntent.current = intentForStep();
      setSelectedId(next.id);
      reveal(document.getElementById(queue ? `item-${next.id}` : `row-${next.id}`));
    },
    [rows, effectiveId, queue, intentForStep],
  );

  const openRequest = (id: string) => {
    focusIntent.current = { kind: "title" };
    setSelectedId(id);
    setOpen(true);
  };

  const closeRequest = () => {
    focusIntent.current = selectedId
      ? { kind: "row", id: selectedId, index: rows.findIndex((r) => r.id === selectedId) }
      : null;
    setOpen(false);
  };

  // Apply focus after the DOM has updated. Focus never scrolls; lists are revealed explicitly.
  useLayoutEffect(() => {
    const intent = focusIntent.current;
    if (!intent) return;
    focusIntent.current = null;
    const focus = (el: Element | null | undefined) => {
      if (!(el instanceof HTMLElement)) return false;
      el.focus({ preventScroll: true });
      return document.activeElement === el;
    };
    const rowControl = (id: string | undefined) =>
      id ? document.querySelector(`#row-${id} [data-row-open]`) : null;
    switch (intent.kind) {
      case "list":
        if (!effectiveId) return;
        if (queue) focus(document.getElementById(`item-${effectiveId}`));
        else if (!open) focus(rowControl(effectiveId));
        else focus(live("[data-request-title]"));
        return;
      case "nav":
        if (!focus(live(`[data-request-workspace] [aria-label="${CSS.escape(intent.label)}"]`)))
          focus(live("[data-request-title]"));
        return;
      case "title":
        focus(live("[data-request-title]"));
        return;
      case "row": {
        // The table stayed mounted under the page, so its scroll is intact; j/k may have moved on a row.
        const neighbour = rows[Math.min(Math.max(intent.index, 0), rows.length - 1)];
        for (const id of [intent.id, neighbour?.id]) {
          const control = rowControl(id);
          reveal(control?.closest("tr") ?? null);
          if (focus(control)) return;
        }
        focus(live("[data-view-title]"));
        return;
      }
    }
  }, [effectiveId, open, queue, rows]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // While a picker or calendar is open, keys belong to it: nothing may change underneath.
      if (isTypingTarget(e) || isPopoverOpen() || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "j" || (e.key === "ArrowDown" && !queue && !open)) {
        e.preventDefault();
        step(1);
      } else if (e.key === "k" || (e.key === "ArrowUp" && !queue && !open)) {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Enter" && !queue && !open && selectedId) {
        const target = e.target as HTMLElement;
        if (target.closest("button, a, input")) return;
        e.preventDefault();
        openRequest(selectedId);
      } else if (e.key === "Escape") {
        if (!queue && open) closeRequest();
        else if (queue && !split && selectedId) setSelectedId(null);
      } else if (e.key === "c") {
        e.preventDefault();
        setCreatedByPointer(false);
        setCreating(true);
      } else if (e.key === "/") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>("input[data-search]")?.focus();
      } else if (e.key === "[") {
        e.preventDefault();
        toggleSidebar(!sidebarOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // openRequest/closeRequest read the latest render's values; rebinding on these covers them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, queue, open, split, selectedId, rows, sidebarOpen]);

  /*
   * Collapse/expand the sidebar. If focus was on the toggle, in the sidebar, or
   * nowhere, it moves to the counterpart control so keyboard users stay oriented.
   */
  function toggleSidebar(nextOpen: boolean) {
    const active = document.activeElement as HTMLElement | null;
    const handoff =
      !active ||
      active === document.body ||
      Boolean(active.closest("[data-sidebar-toggle]")) ||
      Boolean(active.closest("#app-sidebar"));
    setSidebarOpen(nextOpen);
    if (!handoff) return;
    requestAnimationFrame(() => {
      const target = live(nextOpen ? '[data-sidebar-toggle="hide"]' : '[data-sidebar-toggle="show"]');
      if (target instanceof HTMLElement) target.focus({ preventScroll: true });
    });
  }

  const sidebar = (onClose?: () => void) => (
    <UnifiedSidebar
      scope={scope}
      onScope={changeScope}
      onCreate={(byPointer) => {
        setNavOpen(false);
        setCreatedByPointer(byPointer);
        setCreating(true);
      }}
      onSearch={() => {
        setNavOpen(false);
        if (!queue && open) {
          focusIntent.current = null;
          setOpen(false);
        }
        requestAnimationFrame(() => document.querySelector<HTMLInputElement>("input[data-search]")?.focus());
      }}
      onSetMe={extras.setMe}
      onHide={onClose ? undefined : () => toggleSidebar(false)}
      onClose={onClose}
    />
  );

  const workspace = (mode: "split" | "page") =>
    selected ? (
      <RequestWorkspace
        key={selected.id}
        request={selected}
        context={{ label: copy.label, mode }}
        onBack={() => (mode === "page" ? closeRequest() : setSelectedId(null))}
        position={position && position.index >= 0 ? position : null}
        onStep={step}
        following={following.includes(selected.id)}
        onToggleFollow={() =>
          setFollowing((f) => (f.includes(selected.id) ? f.filter((x) => x !== selected.id) : [...f, selected.id]))
        }
        onShowSidebar={mode === "page" ? () => toggleSidebar(true) : undefined}
      />
    ) : null;

  const mobileDetail = queue && !split && Boolean(selected);

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas text-fg">
      {/* Width animates in CSS from <html data-sidebar>; the contents keep their width and slide out. */}
      <aside
        id="app-sidebar"
        aria-label="Navigation"
        data-sidebar-panel
        inert={!sidebarOpen}
        className="hidden shrink-0 overflow-hidden md:block"
      >
        <div data-sidebar-inner className="h-full border-r border-line bg-shell">
          {sidebar()}
        </div>
      </aside>

      {navOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-black/60" onClick={() => setNavOpen(false)} />
          <aside aria-label="Navigation" className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-line bg-shell">
            {sidebar(() => setNavOpen(false))}
          </aside>
        </div>
      ) : null}

      <main className="flex min-w-0 flex-1">
        {/*
          Views and requests swap in place, in one frame: headers and toolbars never move or
          blank out. The sliding selection in the sidebar, queue and table carries continuity.
        */}
        <div key={encodeScope(scope)} className="flex min-w-0 flex-1">
        {queue ? (
          <>
            <section
              aria-label={copy.label}
              className={cx(
                "min-w-0 flex-1 bg-canvas lg:w-[clamp(300px,24vw,380px)] lg:flex-none lg:border-r lg:border-line",
                mobileDetail && "hidden",
              )}
            >
              <Queue
                icon={icon}
                copy={copy}
                rows={rows}
                grouped={isGrouped(scope)}
                groupLabel={(s) => (s === "in_review" ? "Waiting on approval" : undefined)}
                selectedId={effectiveId}
                onSelect={(id) => {
                  setSelectionMotion("animate");
                  setSelectedId(id);
                }}
                isUnread={extras.isUnread}
                search={filters.search}
                onSearch={(search) => setFilters((f) => ({ ...f, search }))}
                sort={sort}
                onSort={setSort}
                onMenu={() => setNavOpen(true)}
                onShowSidebar={() => toggleSidebar(true)}
                snap={selectionMotion === "snap"}
                layoutKey={`queue:${encodeScope(scope)}`}
              />
            </section>
            <section aria-label="Request" className={cx("min-w-0 flex-1", !mobileDetail && "max-lg:hidden")}>
              {workspace("split") ?? (
                <div className="grid h-full place-items-center">
                  <EmptyState title={copy.emptyTitle} body={copy.emptyBody} />
                </div>
              )}
            </section>
          </>
        ) : (
          /*
           * An opened request covers the table, which stays mounted underneath (hidden and
           * inert) so its scroll position and ticked rows are intact when you come back.
           */
          <div className="relative min-w-0 flex-1">
            <div
              className={cx("absolute inset-0 flex", open && selected && "invisible")}
              inert={Boolean(open && selected)}
            >
              <TableView
                icon={icon}
                copy={copy}
                filtered={filtered}
                rows={rows}
                statusTab={statusTab}
                onStatusTab={setStatusTab}
                filters={filters}
                onFilters={setFilters}
                sort={sort}
                onSort={setSort}
                selectedId={selectedId}
                onOpen={(id) => openRequest(id)}
                checked={checked}
                onCheck={setChecked}
                onMenu={() => setNavOpen(true)}
                onShowSidebar={() => toggleSidebar(true)}
                snap={selectionMotion === "snap"}
                layoutKey={`table:${encodeScope(scope)}`}
              />
            </div>
            {open && selected ? (
              // A block, not a flex row: the workspace is a size container and would shrink to nothing.
              <section aria-label="Request" className="absolute inset-0 bg-canvas">
                {workspace("page")}
              </section>
            ) : null}
          </div>
        )}
        </div>
      </main>

      <NewRequestDialog
        instant={!createdByPointer}
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(request) => {
          setCreating(false);
          changeScope({ kind: "view", id: "inbox" });
          setSelectedId(request.id);
        }}
      />
    </div>
  );
}
