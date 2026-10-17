import type { Metadata } from "next";
import { WorkspaceApp } from "@/prototypes/workspace/workspace-app";

export const metadata: Metadata = { title: "B · Collaborative workspace — Team Ops prototype" };

export default function WorkspacePrototypePage() {
  return <WorkspaceApp />;
}
