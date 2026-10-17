"use client";

import { Activity, ChartColumn, Inbox, Settings, Users, type LucideIcon } from "lucide-react";
import { useWorkspace } from "@/components/request/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import { cx } from "@/components/ui/cx";
import { ViewAs } from "../view-as";

export type Area = "requests" | "activity";

function RailButton({
  icon: Icon,
  label,
  active,
  disabled,
  dot,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  dot?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={disabled ? `${label} (not in this prototype)` : label}
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      className={cx(
        "group relative grid size-9 place-items-center rounded-[9px] transition-colors duration-100",
        active && "bg-selected text-fg",
        !active && !disabled && "text-fg-3 hover:bg-raised hover:text-fg-2",
        disabled && "cursor-default text-fg-4",
      )}
    >
      <Icon size={18} aria-hidden />
      {dot ? (
        <span aria-hidden className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent ring-2 ring-rail" />
      ) : null}
      <span
        role="presentation"
        className="pointer-events-none absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2 rounded-[6px] border border-line-strong bg-overlay px-2 py-1 text-meta whitespace-nowrap text-fg opacity-0 shadow-float transition-opacity duration-100 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {label}
        {disabled ? <span className="text-fg-3"> · later</span> : null}
      </span>
    </button>
  );
}

export function Rail({
  area,
  onArea,
  onSetMe,
  inboxDot,
}: {
  area: Area;
  onArea: (area: Area) => void;
  onSetMe: (id: string) => void;
  inboxDot: boolean;
}) {
  const api = useWorkspace();
  return (
    <nav
      aria-label="Workspace"
      className="hidden w-14 shrink-0 flex-col items-center border-r border-line bg-rail py-3 md:flex"
    >
      <span
        aria-label={`Workspace: ${api.workspace.name}`}
        role="img"
        className="grid size-8 place-items-center rounded-[9px] bg-fg text-[13px] font-bold text-canvas"
      >
        M
      </span>
      <div className="mt-4 flex flex-col items-center gap-1">
        <RailButton icon={Inbox} label="Requests" active={area === "requests"} dot={inboxDot} onClick={() => onArea("requests")} />
        <RailButton icon={Activity} label="Activity" active={area === "activity"} onClick={() => onArea("activity")} />
        <span aria-hidden className="my-1.5 h-px w-5 bg-line" />
        <RailButton icon={ChartColumn} label="Insights" disabled />
        <RailButton icon={Users} label="People" disabled />
      </div>
      <div className="mt-auto flex flex-col items-center gap-2">
        <RailButton icon={Settings} label="Settings" disabled />
        <ViewAs onChange={onSetMe} triggerClassName="rounded-full p-0.5 hover:ring-2 hover:ring-line-strong">
          <Avatar name={api.me.name} size={28} />
        </ViewAs>
      </div>
    </nav>
  );
}
