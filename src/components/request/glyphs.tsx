"use client";

import {
  Building2,
  FileSignature,
  KeyRound,
  Landmark,
  Laptop,
  Receipt,
  Tag,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import type { Priority, RequestStatus } from "@/domain/types";
import { cx } from "@/components/ui/cx";
import { useMotion } from "@/components/ui/motion";

export const STATUS_META: Record<
  RequestStatus,
  { label: string; color: string; verb: string }
> = {
  triage: { label: "Triage", color: "var(--color-st-triage)", verb: "Needs triage" },
  todo: { label: "To do", color: "var(--color-st-todo)", verb: "To do" },
  in_progress: { label: "In progress", color: "var(--color-st-progress)", verb: "In progress" },
  in_review: { label: "In review", color: "var(--color-st-review)", verb: "Awaiting approval" },
  done: { label: "Done", color: "var(--color-st-done)", verb: "Done" },
  declined: { label: "Declined", color: "var(--color-st-declined)", verb: "Declined" },
};

export const PRIORITY_META: Record<Priority, { label: string; rank: number }> = {
  urgent: { label: "Urgent", rank: 0 },
  high: { label: "High", rank: 1 },
  medium: { label: "Medium", rank: 2 },
  low: { label: "Low", rank: 3 },
  none: { label: "No priority", rank: 4 },
};

export function statusStyle(status: RequestStatus): CSSProperties {
  return { "--st": STATUS_META[status].color } as CSSProperties;
}

/** Progress-shaped glyph: the shape carries the state even without colour. */
export function StatusIcon({
  status,
  size = 14,
  className,
}: {
  status: RequestStatus;
  size?: number;
  className?: string;
}) {
  const color = STATUS_META[status].color;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 14 14",
    "aria-hidden": true,
    className: cx("shrink-0", className),
  } as const;
  switch (status) {
    case "triage":
      return (
        <svg {...common} fill="none">
          <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.5" strokeDasharray="2.1 1.9" />
        </svg>
      );
    case "todo":
      return (
        <svg {...common} fill="none">
          <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case "in_progress":
      return (
        <svg {...common} fill="none">
          <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.5" />
          <path d="M7 3.75a3.25 3.25 0 0 1 0 6.5z" fill={color} />
        </svg>
      );
    case "in_review":
      return (
        <svg {...common} fill="none">
          <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.5" />
          <path d="M7 3.75a3.25 3.25 0 1 1-3.25 3.25H7z" fill={color} />
        </svg>
      );
    case "done":
      return (
        <svg {...common} fill="none">
          <circle cx="7" cy="7" r="6.25" fill={color} />
          <path d="m4.4 7.1 1.75 1.75L9.6 5.4" stroke="#121212" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "declined":
      return (
        <svg {...common} fill="none">
          <circle cx="7" cy="7" r="6.25" fill={color} />
          <path d="m5 5 4 4m0-4-4 4" stroke="#121212" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}

export function StatusChip({
  status,
  label,
  className,
}: {
  status: RequestStatus;
  label?: string;
  className?: string;
}) {
  const motion = useMotion();
  return (
    <span
      className={cx(
        motion && "motion-colors",
        "status-chip inline-flex h-[22px] max-w-full items-center gap-1.5 rounded-chip pr-2 pl-1.5 text-meta font-medium whitespace-nowrap",
        className,
      )}
      style={statusStyle(status)}
    >
      <StatusIcon status={status} size={12} />
      <span className="truncate">{label ?? STATUS_META[status].label}</span>
    </span>
  );
}

export function PriorityIcon({
  priority,
  size = 14,
  className,
}: {
  priority: Priority;
  size?: number;
  className?: string;
}) {
  const label = PRIORITY_META[priority].label;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 14 14",
    role: "img",
    "aria-label": `Priority: ${label}`,
    className: cx("shrink-0", className),
  } as const;
  if (priority === "urgent") {
    return (
      <svg {...common} fill="none">
        <rect x="1" y="1" width="12" height="12" rx="3" fill="var(--color-danger)" />
        <path d="M7 3.75v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="7" cy="10.1" r="0.95" fill="#fff" />
      </svg>
    );
  }
  if (priority === "none") {
    return (
      <svg {...common} fill="none">
        <path d="M2.5 7h1.5M6.25 7h1.5M10 7h1.5" stroke="var(--color-fg-3)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  const filled = priority === "high" ? 3 : priority === "medium" ? 2 : 1;
  const bars = [
    { x: 1.5, h: 4 },
    { x: 5.75, h: 7 },
    { x: 10, h: 10 },
  ];
  return (
    <svg {...common} fill="none">
      {bars.map((bar, i) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={12 - bar.h}
          width="2.5"
          height={bar.h}
          rx="0.75"
          fill={i < filled ? "var(--color-fg-2)" : "var(--color-line-strong)"}
        />
      ))}
    </svg>
  );
}

const TYPE_ICONS: Record<string, LucideIcon> = {
  key: KeyRound,
  laptop: Laptop,
  receipt: Receipt,
  building: Building2,
  signature: FileSignature,
  landmark: Landmark,
};

export function TypeIcon({
  icon,
  size = 14,
  className,
}: {
  icon: string;
  size?: number;
  className?: string;
}) {
  const Icon = TYPE_ICONS[icon] ?? Tag;
  return <Icon size={size} aria-hidden className={className} />;
}
