"use client";

import type { ReactNode } from "react";
import { useWorkspace } from "@/components/request/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import { Picker } from "@/components/ui/picker";
import { OPS_TEAM } from "./fixtures";

/**
 * PROTOTYPE ONLY — switch the signed-in person to see how next steps change
 * with ownership and approval rights.
 */
export function ViewAs({
  onChange,
  children,
  triggerClassName,
  align = "start",
}: {
  onChange: (memberId: string) => void;
  children: ReactNode;
  triggerClassName?: string;
  align?: "start" | "end";
}) {
  const { members, me } = useWorkspace();
  const people = [
    ...members.filter((m) => OPS_TEAM.includes(m.id)),
    ...members.filter((m) => !OPS_TEAM.includes(m.id)),
  ];
  return (
    <Picker
      label={`Signed in as ${me.name}. View the prototype as someone else`}
      title="View prototype as"
      value={me.id}
      onChange={onChange}
      searchable
      searchPlaceholder="Search people…"
      align={align}
      width={260}
      triggerClassName={triggerClassName}
      options={people.map((m, i) => ({
        value: m.id,
        label: m.name,
        hint: m.title,
        icon: <Avatar name={m.name} size={18} />,
        separated: i === OPS_TEAM.length,
      }))}
    >
      {children}
    </Picker>
  );
}
