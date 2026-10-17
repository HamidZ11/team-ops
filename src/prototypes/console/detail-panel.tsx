"use client";

import { ArrowLeft, Check, ChevronDown, ChevronUp, Link2, X } from "lucide-react";
import { useState } from "react";
import { Composer } from "@/components/request/composer";
import { TypeIcon } from "@/components/request/glyphs";
import { NextStep } from "@/components/request/next-step";
import { RequestProperties } from "@/components/request/properties";
import { Timeline } from "@/components/request/timeline";
import { useWorkspace } from "@/components/request/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { relativeTimeLong } from "@/domain/format";
import type { Request } from "@/domain/types";

export function DetailPanel({
  request,
  onClose,
  onStep,
  position,
}: {
  request: Request;
  onClose: () => void;
  onStep: (direction: 1 | -1) => void;
  position: { index: number; total: number } | null;
}) {
  const api = useWorkspace();
  const [filter, setFilter] = useState<"all" | "comments">("all");
  const [copied, setCopied] = useState(false);
  const type = api.type(request.typeId);
  const requester = api.member(request.requesterId);
  const key = api.keyOf(request);

  return (
    <aside
      aria-label={`${key} details`}
      className={cx(
        "fixed inset-0 z-40 flex flex-col bg-canvas [--panel-bg:var(--color-canvas)]",
        "md:inset-y-0 md:right-0 md:left-auto md:w-[440px] md:border-l md:border-line md:bg-shell md:shadow-sheet md:[--panel-bg:var(--color-shell)]",
        "xl:static xl:z-auto xl:h-full xl:shrink-0 xl:shadow-none",
      )}
    >
      <div className="flex h-12 shrink-0 items-center gap-1 border-b border-line px-2 md:pl-4">
        <Button variant="ghost" size="icon-md" onClick={onClose} aria-label="Back to list" className="md:hidden">
          <ArrowLeft size={17} />
        </Button>
        <span className="text-meta text-fg-3 tabular-nums">{key}</span>
        {position ? (
          <span className="ml-2 hidden text-meta text-fg-4 tabular-nums sm:inline">
            {position.index + 1} / {position.total}
          </span>
        ) : null}
        <span className="ml-auto flex items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" aria-label="Previous request (K)" title="Previous (K)" onClick={() => onStep(-1)}>
            <ChevronUp size={16} />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Next request (J)" title="Next (J)" onClick={() => onStep(1)}>
            <ChevronDown size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={copied ? "Link copied" : "Copy link"}
            title="Copy link"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).catch(() => {});
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check size={15} /> : <Link2 size={15} />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close details (Esc)"
            title="Close (Esc)"
            onClick={onClose}
            className="max-md:hidden"
          >
            <X size={16} />
          </Button>
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="px-4 pt-4 pb-6 md:px-5">
          <p className="flex items-center gap-1.5 text-meta text-fg-3">
            {type ? <TypeIcon icon={type.icon} size={13} /> : null}
            {type?.name}
          </p>
          <h2 className="mt-1.5 text-[17px] leading-6 font-semibold tracking-[-0.01em] text-balance text-fg">
            {request.title}
          </h2>
          <p className="mt-2 flex items-center gap-1.5 text-meta text-fg-3">
            <Avatar name={requester?.name} size={16} />
            <span>
              <span className="text-fg-2">{requester?.name}</span> requested{" "}
              {relativeTimeLong(request.createdAt, api.now)}
            </span>
          </p>

          <NextStep request={request} className="mt-4" />

          <div className="mt-4">
            <RequestProperties request={request} />
          </div>

          <section className="mt-4 border-t border-line pt-4" aria-labelledby={`${request.id}-desc`}>
            <h3 id={`${request.id}-desc`} className="mb-1.5 text-meta font-medium text-fg-3">
              Description
            </h3>
            {request.description ? (
              <p className="text-ui leading-5 whitespace-pre-wrap text-fg">{request.description}</p>
            ) : (
              <p className="text-ui text-fg-3">No description.</p>
            )}
          </section>

          <section className="mt-5 border-t border-line pt-4" aria-labelledby={`${request.id}-activity`}>
            <div className="mb-1 flex items-center justify-between">
              <h3 id={`${request.id}-activity`} className="text-meta font-medium text-fg-3">
                Activity
              </h3>
              <div role="group" aria-label="Show" className="flex gap-0.5">
                {(["all", "comments"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={filter === f}
                    onClick={() => setFilter(f)}
                    className={cx(
                      "h-6 rounded-[5px] px-2 text-meta transition-colors duration-100",
                      filter === f ? "bg-selected text-fg" : "text-fg-3 hover:text-fg-2",
                    )}
                  >
                    {f === "all" ? "All" : "Comments"}
                  </button>
                ))}
              </div>
            </div>
            <Timeline requestId={request.id} variant="compact" surface="var(--panel-bg)" filter={filter} />
          </section>
        </div>
      </div>

      <div className="safe-bottom shrink-0 border-t border-line p-3">
        <Composer key={request.id} requestId={request.id} />
      </div>
    </aside>
  );
}
