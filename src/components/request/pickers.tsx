"use client";

import type { ReactNode } from "react";
import { PRIORITIES, type Member, type Priority } from "@/domain/types";
import { Avatar } from "@/components/ui/avatar";
import { Picker, type PickerOption } from "@/components/ui/picker";
import { PRIORITY_META, PriorityIcon } from "./glyphs";
import { useWorkspace } from "./workspace-context";

const NONE = "__none__";

interface MemberPickerProps {
  label: string;
  value: string | null;
  onChange: (memberId: string | null) => void;
  children: ReactNode;
  triggerClassName?: string;
  /** Label for the "nobody" option; omit to require a member. */
  noneLabel?: string;
  exclude?: (member: Member) => boolean;
  /** Member to describe beside each option, e.g. their open workload. */
  hint?: (member: Member) => string | undefined;
  disabled?: boolean;
  invalid?: boolean;
  align?: "start" | "end";
}

export function MemberPicker({
  label,
  value,
  onChange,
  children,
  triggerClassName,
  noneLabel,
  exclude,
  hint,
  disabled,
  invalid,
  align,
}: MemberPickerProps) {
  const { members, me } = useWorkspace();
  const sorted = [me, ...members.filter((m) => m.id !== me.id)];
  const options: PickerOption<string>[] = sorted
    .filter((m) => !exclude?.(m))
    .map((m) => ({
      value: m.id,
      label: m.id === me.id ? `${m.name} (you)` : m.name,
      icon: <Avatar name={m.name} size={18} />,
      keywords: `${m.title} ${m.email}`,
      hint: hint?.(m),
    }));
  if (noneLabel) {
    options.unshift({
      value: NONE,
      label: noneLabel,
      icon: <Avatar name={null} size={18} />,
    });
  }
  return (
    <Picker
      label={label}
      options={options}
      value={value ?? (noneLabel ? NONE : null)}
      onChange={(v) => onChange(v === NONE ? null : v)}
      searchable
      searchPlaceholder="Search people…"
      triggerClassName={triggerClassName}
      disabled={disabled}
      invalid={invalid}
      align={align}
      width={260}
    >
      {children}
    </Picker>
  );
}

export function PriorityPicker({
  value,
  onChange,
  children,
  triggerClassName,
  disabled,
  align,
}: {
  value: Priority;
  onChange: (priority: Priority) => void;
  children: ReactNode;
  triggerClassName?: string;
  disabled?: boolean;
  align?: "start" | "end";
}) {
  const options: PickerOption<Priority>[] = PRIORITIES.map((p) => ({
    value: p,
    label: PRIORITY_META[p].label,
    icon: <PriorityIcon priority={p} />,
  }));
  return (
    <Picker
      label="Change priority"
      options={options}
      value={value}
      onChange={onChange}
      triggerClassName={triggerClassName}
      disabled={disabled}
      align={align}
      width={200}
    >
      {children}
    </Picker>
  );
}
