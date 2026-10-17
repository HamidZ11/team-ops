"use client";

import {
  Archive,
  AtSign,
  Ban,
  CalendarClock,
  ChevronDown,
  CircleUserRound,
  Gavel,
  Inbox,
  Layers,
  MessageSquare,
  Rows3,
  Search,
  SquarePen,
  Stamp,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { TypeIcon } from "@/components/request/glyphs";
import { useWorkspace } from "@/components/request/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { Kbd } from "@/components/ui/kbd";
import { isOpen } from "@/domain/types";
import type { ViewId } from "@/domain/views";
import { OPS_TEAM } from "../fixtures";
import { sameScope, scopeRequests, type Scope } from "../scope";
import type { ActivityFilter } from "./activity-feed";

export const B_VIEW_ICONS: Record<ViewId, LucideIcon> = {
  inbox: Inbox,
  my_work: CircleUserRound,
  approvals: Stamp,
  all: Layers,
  blocked: Ban,
  due_soon: CalendarClock,
  closed: Archive,
};

function Item({
  active,
  icon,
  label,
  count,
  badge,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  count?: number;
  badge?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cx(
        "group flex h-[30px] w-full items-center gap-2.5 rounded-control px-2 text-left text-ui transition-colors duration-100",
        active ? "bg-selected text-fg" : "text-fg-2 hover:bg-raised hover:text-fg",
      )}
    >
      <span className={cx("flex w-4 justify-center", active ? "text-fg" : "text-fg-3 group-hover:text-fg-2")}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count ? (
        badge ? (
          <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent/18 px-1 text-micro font-semibold text-accent-fg tabular-nums">
            {count}
          </span>
        ) : (
          <span className="text-meta text-fg-3 tabular-nums">{count}</span>
        )
      ) : null}
    </button>
  );
}

function Section({
  label,
  children,
  defaultOpen = true,
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 w-full items-center justify-between rounded-control px-2 text-micro font-medium tracking-[0.07em] text-fg-3 uppercase hover:text-fg-2"
      >
        {label}
        <ChevronDown size={12} aria-hidden className={cx("transition-transform duration-150", !open && "-rotate-90")} />
      </button>
      {open ? <div className="flex flex-col gap-px">{children}</div> : null}
    </div>
  );
}

export function RequestsSidebar({
  scope,
  onScope,
  search,
  onSearch,
  onCreate,
}: {
  scope: Scope;
  onScope: (scope: Scope) => void;
  search: string;
  onSearch: (value: string) => void;
  onCreate: () => void;
}) {
  const api = useWorkspace();
  const ctx = { meId: api.me.id, today: api.today };
  const count = (s: Scope) => scopeRequests(api.requests, s, ctx).length;
  const view = (id: ViewId, label: string, badge?: boolean) => {
    const s: Scope = { kind: "view", id };
    const Icon = B_VIEW_ICONS[id];
    return (
      <Item
        key={id}
        active={sameScope(scope, s)}
        icon={<Icon size={15} aria-hidden />}
        label={label}
        count={id === "closed" ? undefined : count(s)}
        badge={badge}
        onClick={() => onScope(s)}
      />
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between pr-2 pl-4">
        <h2 className="text-ui font-semibold text-fg">Requests</h2>
        <Button variant="ghost" size="icon-sm" aria-label="New request (C)" title="New request (C)" onClick={onCreate}>
          <SquarePen size={15} />
        </Button>
      </div>
      <div className="px-3">
        <label className="flex h-8 items-center gap-2 rounded-control border border-line bg-canvas px-2.5 text-fg-3 focus-within:border-line-strong">
          <Search size={14} aria-hidden />
          <span className="sr-only">Search requests</span>
          <input
            data-search
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onSearch("");
                e.currentTarget.blur();
              }
            }}
            placeholder="Search requests"
            className="h-full min-w-0 flex-1 bg-transparent text-ui text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none"
          />
          <Kbd>/</Kbd>
        </label>
      </div>
      <nav aria-label="Queues" className="min-h-0 flex-1 overflow-y-auto px-2 pt-1 pb-4">
        <Section label="Queues">
          {view("inbox", "Inbox")}
          {view("my_work", "My work")}
          {view("approvals", "Approvals", true)}
        </Section>
        <Section label="Views">
          {view("all", "All open")}
          {view("blocked", "Blocked")}
          {view("due_soon", "Due this week")}
          {view("closed", "Closed")}
        </Section>
        <Section label="Team">
          {api.members
            .filter((m) => OPS_TEAM.includes(m.id))
            .map((m) => {
              const s: Scope = { kind: "member", id: m.id };
              return (
                <Item
                  key={m.id}
                  active={sameScope(scope, s)}
                  icon={<Avatar name={m.name} size={18} />}
                  label={m.id === api.me.id ? `${m.name} (you)` : m.name}
                  count={api.requests.filter((r) => isOpen(r) && r.assigneeId === m.id).length}
                  onClick={() => onScope(s)}
                />
              );
            })}
        </Section>
        <Section label="Types" defaultOpen={false}>
          {api.types.map((t) => {
            const s: Scope = { kind: "type", id: t.id };
            return (
              <Item
                key={t.id}
                active={sameScope(scope, s)}
                icon={<TypeIcon icon={t.icon} size={15} />}
                label={t.name}
                count={api.requests.filter((r) => isOpen(r) && r.typeId === t.id).length}
                onClick={() => onScope(s)}
              />
            );
          })}
        </Section>
      </nav>
      <p className="flex shrink-0 items-center gap-2 border-t border-line px-4 py-3 text-meta text-fg-3">
        <span className="size-1.5 rounded-full bg-[var(--color-st-progress)]" aria-hidden />
        Prototype · sample data
      </p>
    </div>
  );
}

export const ACTIVITY_FILTERS: Array<{ id: ActivityFilter; label: string; icon: LucideIcon }> = [
  { id: "all", label: "All activity", icon: Rows3 },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "decisions", label: "Decisions", icon: Gavel },
  { id: "mentions", label: "Mentions", icon: AtSign },
];

export function ActivitySidebar({
  filter,
  onFilter,
  counts,
}: {
  filter: ActivityFilter;
  onFilter: (filter: ActivityFilter) => void;
  counts: Record<ActivityFilter, number>;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center pl-4">
        <h2 className="text-ui font-semibold text-fg">Activity</h2>
      </div>
      <nav aria-label="Activity filters" className="px-2">
        <Section label="Show">
          {ACTIVITY_FILTERS.map((f) => (
            <Item
              key={f.id}
              active={filter === f.id}
              icon={<f.icon size={15} aria-hidden />}
              label={f.label}
              count={f.id === "all" ? undefined : counts[f.id]}
              badge={f.id === "mentions"}
              onClick={() => onFilter(f.id)}
            />
          ))}
        </Section>
      </nav>
      <p className="mt-auto flex shrink-0 items-center gap-2 border-t border-line px-4 py-3 text-meta text-fg-3">
        <span className="size-1.5 rounded-full bg-[var(--color-st-progress)]" aria-hidden />
        Prototype · sample data
      </p>
    </div>
  );
}
