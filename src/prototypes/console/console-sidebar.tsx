"use client";

import {
  Archive,
  Ban,
  CalendarClock,
  ChevronsUpDown,
  CircleUserRound,
  Inbox,
  Layers,
  Search,
  Stamp,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { TypeIcon } from "@/components/request/glyphs";
import { useWorkspace } from "@/components/request/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { isOpen } from "@/domain/types";
import type { ViewId } from "@/domain/views";
import { sameScope, scopeRequests, type Scope } from "../scope";
import { ViewAs } from "../view-as";

export const VIEW_ICONS: Record<ViewId, LucideIcon> = {
  inbox: Inbox,
  my_work: CircleUserRound,
  approvals: Stamp,
  all: Layers,
  blocked: Ban,
  due_soon: CalendarClock,
  closed: Archive,
};

function NavItem({
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
        "group flex h-8 w-full items-center gap-2.5 rounded-control px-2 text-left text-ui transition-colors duration-100",
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

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="px-2 pt-5 pb-1.5 text-meta text-fg-3">{children}</p>;
}

export function ConsoleSidebar({
  scope,
  onScope,
  onSetMe,
  onSearch,
  onClose,
}: {
  scope: Scope;
  onScope: (scope: Scope) => void;
  onSetMe: (memberId: string) => void;
  onSearch: () => void;
  /** Present when the sidebar is shown as a drawer. */
  onClose?: () => void;
}) {
  const api = useWorkspace();
  const ctx = { meId: api.me.id, today: api.today };
  const count = (s: Scope) => scopeRequests(api.requests, s, ctx).length;
  const view = (id: ViewId, label?: string, badge?: boolean) => {
    const s: Scope = { kind: "view", id };
    const Icon = VIEW_ICONS[id];
    return (
      <NavItem
        key={id}
        active={sameScope(scope, s)}
        icon={<Icon size={15} aria-hidden />}
        label={label ?? s.id}
        count={id === "closed" ? undefined : count(s)}
        badge={badge}
        onClick={() => onScope(s)}
      />
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center gap-1 pr-2 pl-3">
        <button
          type="button"
          className="-ml-1 flex min-w-0 items-center gap-2 rounded-control px-1 py-1 text-ui font-medium text-fg hover:bg-raised"
          aria-label="Workspace: Meridian"
        >
          <span className="grid size-5 place-items-center rounded-[5px] bg-fg text-[11px] font-bold text-canvas">
            M
          </span>
          <span className="truncate">{api.workspace.name}</span>
          <ChevronsUpDown size={13} aria-hidden className="text-fg-3" />
        </button>
        <span className="ml-auto flex items-center">
          <Button variant="ghost" size="icon-sm" aria-label="Search requests" onClick={onSearch}>
            <Search size={15} />
          </Button>
          {onClose ? (
            <Button variant="ghost" size="icon-sm" aria-label="Close navigation" onClick={onClose}>
              <X size={16} />
            </Button>
          ) : null}
        </span>
      </div>

      <nav aria-label="Requests" className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <div className="flex flex-col gap-px pt-1">
          {view("inbox", "Inbox")}
          {view("my_work", "My work")}
          {view("approvals", "Approvals", true)}
          {view("all", "All requests")}
        </div>

        <SectionLabel>Views</SectionLabel>
        <div className="flex flex-col gap-px">
          {view("blocked", "Blocked")}
          {view("due_soon", "Due this week")}
          {view("closed", "Closed")}
        </div>

        <SectionLabel>Types</SectionLabel>
        <div className="flex flex-col gap-px">
          {api.types.map((t) => {
            const s: Scope = { kind: "type", id: t.id };
            return (
              <NavItem
                key={t.id}
                active={sameScope(scope, s)}
                icon={<TypeIcon icon={t.icon} size={15} />}
                label={t.name}
                count={api.requests.filter((r) => isOpen(r) && r.typeId === t.id).length}
                onClick={() => onScope(s)}
              />
            );
          })}
        </div>
      </nav>

      <div className="safe-bottom shrink-0 border-t border-line p-2">
        <p className="flex items-center gap-2 px-2 pt-1 pb-2 text-meta text-fg-3">
          <span className="size-1.5 rounded-full bg-[var(--color-st-progress)]" aria-hidden />
          Prototype · sample data
        </p>
        <ViewAs
          onChange={onSetMe}
          triggerClassName="flex w-full items-center gap-2.5 rounded-control px-2 py-1.5 text-left hover:bg-raised"
        >
          <Avatar name={api.me.name} size={24} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-ui text-fg">{api.me.name}</span>
            <span className="block truncate text-meta text-fg-3">{api.me.title}</span>
          </span>
          <ChevronsUpDown size={13} aria-hidden className="text-fg-3" />
        </ViewAs>
      </div>
    </div>
  );
}
