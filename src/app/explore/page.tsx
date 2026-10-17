import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Explore — Meridian" };

const ENTRIES = [
  {
    href: "/",
    name: "Unified · the application",
    summary: "A's shell, table and visual language with B's queue, request workspace and inspector. Served at /.",
  },
  {
    href: "/prototypes/console",
    name: "A · Operations console",
    summary:
      "Table-first. One sidebar, scope filters, a trend strip and a dense request table with a docked detail panel.",
  },
  {
    href: "/prototypes/workspace",
    name: "B · Collaborative workspace",
    summary:
      "Queue-first. Icon rail and contextual sidebar, a shared inbox list, and a selected request with a rich inspector.",
  },
];

/** Development-only index of the design exploration. */
export default function Explore() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-meta text-fg-3">Meridian · design exploration (development only)</p>
        <h1 className="text-heading font-semibold tracking-[-0.01em]">Concepts and experiments</h1>
        <p className="text-read text-fg-2">
          Everything here runs on the same domain workflow and the same fictional data. Switch between them with
          the picker at the top, or press 1–3.
        </p>
      </div>
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-panel border border-line bg-panel">
        {ENTRIES.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="group flex items-center gap-4 px-4 py-4 hover:bg-raised">
              <span className="min-w-0 flex-1">
                <span className="block text-ui font-medium text-fg">{c.name}</span>
                <span className="mt-1 block text-meta text-fg-3">{c.summary}</span>
              </span>
              <ArrowRight size={16} className="text-fg-3 group-hover:text-fg" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-meta text-fg-3">
        Product structure and visual direction: <code className="text-fg-2">docs/PRODUCT.md</code>,{" "}
        <code className="text-fg-2">docs/DESIGN.md</code>.
      </p>
    </main>
  );
}
