"use client";

import { Menu, PanelLeftOpen } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useSidebarOpen } from "./sidebar-state";

/**
 * The 48px bar at the top of every pane. Keeping one height and one bottom
 * rule across the table, the queue and the request means the line under the
 * header never jumps when you move between views.
 */
export function PaneHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <header className={`flex h-12 shrink-0 items-center gap-2.5 border-b border-line ${className ?? ""}`}>
      {children}
    </header>
  );
}

/**
 * Restores the collapsed sidebar. Lives at the start of the leftmost pane's
 * header; CSS grows it in as the sidebar leaves, so the title shifts smoothly.
 */
export function SidebarRestore({ onShow }: { onShow: () => void }) {
  const open = useSidebarOpen();
  return (
    <span data-sidebar-restore inert={open} className="shrink-0 max-md:hidden">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Show sidebar ([)"
        title="Show sidebar ([)"
        aria-expanded={false}
        aria-controls="app-sidebar"
        data-sidebar-toggle="show"
        onClick={onShow}
      >
        <PanelLeftOpen size={15} />
      </Button>
    </span>
  );
}

export function ViewTitle({
  icon,
  title,
  count,
  description,
  onMenu,
  onShowSidebar,
}: {
  icon: ReactNode;
  title: string;
  count?: number;
  description?: string;
  onMenu?: () => void;
  onShowSidebar?: () => void;
}) {
  return (
    <>
      {onShowSidebar ? <SidebarRestore onShow={onShowSidebar} /> : null}
      {onMenu ? (
        <Button variant="ghost" size="icon-md" className="-ml-2 md:hidden" aria-label="Open navigation" onClick={onMenu}>
          <Menu size={18} />
        </Button>
      ) : null}
      <span className="grid size-6 shrink-0 place-items-center rounded-[6px] border border-line bg-raised text-fg-2">
        {icon}
      </span>
      <h1 tabIndex={-1} data-view-title className="flex min-w-0 items-baseline gap-2 rounded-[3px]">
        <span className="truncate text-title font-medium text-fg">{title}</span>
        {count !== undefined ? <span className="text-ui text-fg-3 tabular-nums">{count}</span> : null}
      </h1>
      {description ? <p className="hidden min-w-0 truncate text-meta text-fg-3 lg:block">{description}</p> : null}
    </>
  );
}
