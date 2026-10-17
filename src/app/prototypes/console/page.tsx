import type { Metadata } from "next";
import { ConsoleApp } from "@/prototypes/console/console-app";

export const metadata: Metadata = { title: "A · Operations console — Team Ops prototype" };

export default function ConsolePrototypePage() {
  return <ConsoleApp />;
}
