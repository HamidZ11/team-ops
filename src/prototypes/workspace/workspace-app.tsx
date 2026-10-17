"use client";

import { Activity, CircleUserRound, Inbox, Stamp, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NewRequestDialog } from "@/components/request/new-request-dialog";
import { useWorkspace } from "@/components/request/workspace-context";
import { cx } from "@/components/ui/cx";
import { applyFilters, EMPTY_FILTERS, sortRequests, type SortKey } from "@/domain/query";
import { inView } from "@/domain/query";
import { decodeScope, encodeScope, sameScope, scopeCopy, scopeRequests, type Scope } from "../scope";
import { PrototypeWorkspace, usePrototype } from "../store";
import { isTypingTarget, readParams, writeParams } from "../url-state";
import { useMedia } from "../use-media";
import { ActivityFeed, buildFeed, type ActivityFilter } from "./activity-feed";
import { ActivitySidebar, RequestsSidebar } from "./context-sidebar";
import { QueueList } from "./queue-list";
import { Rail, type Area } from "./rail";
import { RequestView } from "./request-view";

export function WorkspaceApp() {
  return (
    <PrototypeWorkspace>
      <Workspace />
    </PrototypeWorkspace>
  );
}

const DEFAULT_SCOPE: Scope = { kind: "view", id: "inbox" };

function Workspace() {
  const api = useWorkspace();
  const extras = usePrototype();
  const [area, setArea] = useState<Area>("requests");
  const [scope, setScope] = useState<Scope>(DEFAULT_SCOPE);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const [following, setFollowing] = useState<string[]>(["req_1050", "req_1059", "req_1051"]);
  const [creating, setCreating] = useState(false);
  const [restored, setRestored] = useState(false);
  // Desktop shows list and detail together, so something is always open there.
  const split = useMedia("(min-width: 1024px)");

  useEffect(() => {
    const params = readParams();
    // Restoring from the URL after hydration; reading it during render would mismatch the static HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScope(decodeScope(params.get("scope"), DEFAULT_SCOPE));
    if (params.get("area") === "activity") setArea("activity");
    const key = params.get("r");
    const match = key ? api.requests.find((r) => api.keyOf(r) === key) : undefined;
    if (match) setSelectedId(match.id);
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ctx = { meId: api.me.id, today: api.today };
  const copy = scopeCopy(scope, api);
  const grouped = scope.kind !== "view" || ["my_work", "all", "due_soon", "closed"].includes(scope.id);
  const rows = useMemo(() => {
    const filtered = applyFilters(scopeRequests(api.requests, scope, ctx), { ...EMPTY_FILTERS, search }, api.keyOf);
    return sortRequests(filtered, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, scope, search, sort]);
  // Visual order matches grouping, so keyboard stepping follows what's on screen.
  const ordered = useMemo(() => {
    if (!grouped) return rows;
    const order = ["in_review", "in_progress", "todo", "triage", "done", "declined"];
    return [...rows].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
  }, [rows, grouped]);

  const selectedInList = selectedId && ordered.some((r) => r.id === selectedId) ? selectedId : null;
  const effectiveId = selectedId && api.request(selectedId) ? selectedId : split ? (ordered[0]?.id ?? null) : null;
  const selected = effectiveId ? api.request(effectiveId) : undefined;
  const position = selected
    ? { index: ordered.findIndex((r) => r.id === selected.id), total: ordered.length }
    : null;

  useEffect(() => {
    if (!restored) return;
    writeParams({
      scope: sameScope(scope, DEFAULT_SCOPE) ? null : encodeScope(scope),
      area: area === "activity" ? "activity" : null,
      r: area === "requests" && selectedId && selected ? api.keyOf(selected) : null,
    });
  }, [restored, scope, area, selectedId, selected, api]);

  const { markRead } = extras;
  useEffect(() => {
    if (area === "requests" && effectiveId) markRead(effectiveId);
  }, [area, effectiveId, markRead]);

  const changeScope = (next: Scope) => {
    setScope(next);
    setSelectedId(null);
    setArea("requests");
  };

  const step = useCallback(
    (direction: 1 | -1) => {
      if (!ordered.length) return;
      const index = effectiveId ? ordered.findIndex((r) => r.id === effectiveId) : -1;
      const next = ordered[Math.max(0, Math.min(ordered.length - 1, index + direction))];
      if (!next) return;
      setSelectedId(next.id);
      document.getElementById(`item-${next.id}`)?.scrollIntoView({ block: "nearest" });
    },
    [ordered, effectiveId],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e) || e.metaKey || e.ctrlKey || e.altKey || area !== "requests") return;
      if (e.key === "j") {
        e.preventDefault();
        step(1);
      } else if (e.key === "k") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Escape" && !split && selectedId) {
        setSelectedId(null);
      } else if (e.key === "c") {
        e.preventDefault();
        setCreating(true);
      } else if (e.key === "/") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>("input[data-search]")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, area, split, selectedId]);

  const feed = useMemo(
    () => buildFeed(extras.allEvents, extras.allComments, api.me.name),
    [extras.allEvents, extras.allComments, api.me.name],
  );
  const inboxCount = inView(api.requests, "inbox", ctx).length;
  const approvalsCount = inView(api.requests, "approvals", ctx).length;
  const mobileDetail = area === "requests" && !split && selected;

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas text-fg">
      <Rail
        area={area}
        onArea={(a) => {
          setArea(a);
          if (a === "activity") setSelectedId(null);
        }}
        onSetMe={extras.setMe}
        inboxDot={inboxCount > 0}
      />

      <aside aria-label={area === "requests" ? "Queues" : "Activity filters"} className="hidden w-[236px] shrink-0 border-r border-line bg-shell xl:block">
        {area === "requests" ? (
          <RequestsSidebar
            scope={scope}
            onScope={changeScope}
            search={search}
            onSearch={setSearch}
            onCreate={() => setCreating(true)}
          />
        ) : (
          <ActivitySidebar filter={activityFilter} onFilter={setActivityFilter} counts={feed.counts} />
        )}
      </aside>

      {area === "requests" ? (
        <>
          <section
            aria-label={copy.label}
            className={cx(
              "min-w-0 flex-1 border-line bg-canvas lg:w-[360px] lg:flex-none lg:border-r",
              mobileDetail && "hidden",
            )}
          >
            <QueueList
              scope={scope}
              onScope={changeScope}
              copy={copy}
              rows={ordered}
              grouped={grouped}
              selectedId={split ? effectiveId : selectedInList}
              onSelect={setSelectedId}
              isUnread={extras.isUnread}
              search={search}
              onSearch={setSearch}
              sort={sort}
              onSort={setSort}
              onCreate={() => setCreating(true)}
            />
          </section>
          <section
            aria-label="Request"
            className={cx("min-w-0 flex-1", !mobileDetail && "max-lg:hidden")}
          >
            {selected ? (
              <RequestView
                key={selected.id}
                request={selected}
                queueLabel={copy.label}
                position={position && position.index >= 0 ? position : null}
                onBack={() => setSelectedId(null)}
                onStep={step}
                following={following.includes(selected.id)}
                onToggleFollow={() =>
                  setFollowing((f) => (f.includes(selected.id) ? f.filter((x) => x !== selected.id) : [...f, selected.id]))
                }
              />
            ) : (
              <div className="grid h-full place-items-center px-6 text-center">
                <div>
                  <p className="text-ui font-medium text-fg">{copy.emptyTitle}</p>
                  <p className="mt-1 text-meta text-fg-3">{copy.emptyBody}</p>
                </div>
              </div>
            )}
          </section>
        </>
      ) : (
        <ActivityFeed
          items={feed.items.filter(feed.match[activityFilter])}
          filter={activityFilter}
          onFilter={setActivityFilter}
          onOpen={(requestId) => {
            setArea("requests");
            setScope({ kind: "view", id: "all" });
            const r = api.request(requestId);
            if (r && (r.status === "done" || r.status === "declined")) setScope({ kind: "view", id: "closed" });
            setSelectedId(requestId);
          }}
        />
      )}

      {mobileDetail ? null : (
        <MobileTabs
          area={area}
          scope={scope}
          inboxCount={inboxCount}
          approvalsCount={approvalsCount}
          onScope={changeScope}
          onActivity={() => {
            setArea("activity");
            setSelectedId(null);
          }}
        />
      )}

      <NewRequestDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(request) => {
          setCreating(false);
          changeScope({ kind: "view", id: "inbox" });
          setSearch("");
          setSelectedId(request.id);
        }}
      />
    </div>
  );
}

function MobileTabs({
  area,
  scope,
  inboxCount,
  approvalsCount,
  onScope,
  onActivity,
}: {
  area: Area;
  scope: Scope;
  inboxCount: number;
  approvalsCount: number;
  onScope: (scope: Scope) => void;
  onActivity: () => void;
}) {
  const tabs: Array<{ key: string; label: string; icon: LucideIcon; active: boolean; count?: number; onClick: () => void }> = [
    { key: "inbox", label: "Inbox", icon: Inbox, active: area === "requests" && sameScope(scope, { kind: "view", id: "inbox" }), count: inboxCount, onClick: () => onScope({ kind: "view", id: "inbox" }) },
    { key: "my_work", label: "My work", icon: CircleUserRound, active: area === "requests" && sameScope(scope, { kind: "view", id: "my_work" }), onClick: () => onScope({ kind: "view", id: "my_work" }) },
    { key: "approvals", label: "Approvals", icon: Stamp, active: area === "requests" && sameScope(scope, { kind: "view", id: "approvals" }), count: approvalsCount, onClick: () => onScope({ kind: "view", id: "approvals" }) },
    { key: "activity", label: "Activity", icon: Activity, active: area === "activity", onClick: onActivity },
  ];
  return (
    <nav aria-label="Primary" className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-shell md:hidden">
      <div className="grid h-14 grid-cols-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-current={t.active ? "page" : undefined}
            onClick={t.onClick}
            className={cx(
              "relative flex flex-col items-center justify-center gap-1 text-micro transition-colors duration-100",
              t.active ? "text-fg" : "text-fg-3",
            )}
          >
            <span className="relative">
              <t.icon size={19} aria-hidden />
              {t.count ? (
                <span className="absolute -top-1.5 left-3 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] leading-none font-semibold text-white tabular-nums">
                  {t.count}
                </span>
              ) : null}
            </span>
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
