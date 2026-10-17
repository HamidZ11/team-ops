"use client";

import {
  ArrowLeft,
  Bell,
  BellRing,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Link2,
} from "lucide-react";
import { useState } from "react";
import { Composer } from "@/components/request/composer";
import { PRIORITY_META, PriorityIcon, StatusChip, TypeIcon } from "@/components/request/glyphs";
import { NextStep } from "@/components/request/next-step";
import { RequestProperties } from "@/components/request/properties";
import { WorkflowStepper } from "@/components/request/stepper";
import { Timeline } from "@/components/request/timeline";
import { useWorkspace } from "@/components/request/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { dueLabel, firstName, relativeTimeLong } from "@/domain/format";
import type { Member, Request } from "@/domain/types";

export function RequestView({
  request,
  queueLabel,
  position,
  onBack,
  onStep,
  following,
  onToggleFollow,
}: {
  request: Request;
  queueLabel: string;
  position: { index: number; total: number } | null;
  onBack: () => void;
  onStep: (direction: 1 | -1) => void;
  following: boolean;
  onToggleFollow: () => void;
}) {
  const api = useWorkspace();
  const [filter, setFilter] = useState<"all" | "comments">("all");
  const [copied, setCopied] = useState(false);
  const type = api.type(request.typeId);
  const requester = api.member(request.requesterId);
  const key = api.keyOf(request);

  return (
    <div className="@container flex h-full min-w-0 flex-col bg-canvas">
      <header className="flex h-12 shrink-0 items-center gap-1 border-b border-line px-2 lg:px-4">
        <Button variant="ghost" size="icon-md" onClick={onBack} aria-label={`Back to ${queueLabel}`} className="lg:hidden">
          <ArrowLeft size={17} />
        </Button>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-meta">
          <span className="hidden truncate text-fg-3 lg:inline">{queueLabel}</span>
          <ChevronRight size={12} aria-hidden className="hidden text-fg-4 lg:block" />
          <span className="text-fg-2 tabular-nums">{key}</span>
        </nav>
        <span className="ml-auto flex items-center gap-0.5">
          {position ? (
            <span className="mr-1 hidden text-meta text-fg-3 tabular-nums sm:inline">
              {position.index + 1} of {position.total}
            </span>
          ) : null}
          <Button variant="ghost" size="icon-sm" aria-label="Previous (K)" title="Previous (K)" onClick={() => onStep(-1)}>
            <ChevronUp size={16} />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Next (J)" title="Next (J)" onClick={() => onStep(1)}>
            <ChevronDown size={16} />
          </Button>
          <span aria-hidden className="mx-1 h-4 w-px bg-line" />
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={following}
            onClick={onToggleFollow}
            className={cx("max-sm:px-1.5", following && "text-fg")}
          >
            {following ? <BellRing size={14} aria-hidden /> : <Bell size={14} aria-hidden />}
            <span className="max-sm:sr-only">{following ? "Following" : "Follow"}</span>
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
        </span>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <article className="mx-auto max-w-[720px] px-4 pt-5 pb-8 lg:px-8 lg:pt-7">
              <p className="flex items-center gap-1.5 text-meta text-fg-3">
                {type ? <TypeIcon icon={type.icon} size={13} /> : null}
                {type?.name}
              </p>
              <h2 className="mt-2 text-heading font-semibold tracking-[-0.015em] text-balance text-fg">
                {request.title}
              </h2>
              <p className="mt-2 flex items-center gap-1.5 text-meta text-fg-3">
                <Avatar name={requester?.name} size={16} />
                <span>
                  <span className="text-fg-2">{requester?.name}</span> requested{" "}
                  {relativeTimeLong(request.createdAt, api.now)}
                </span>
              </p>

              <WorkflowStepper request={request} className="mt-5 rounded-panel border border-line bg-panel px-3 py-2.5" />

              {/* Narrow layouts: the inspector folds into the reading column. */}
              <div className="mt-4 flex flex-col gap-3 @min-[760px]:hidden">
                <NextStep request={request} />
                <details className="group rounded-panel border border-line bg-panel">
                  <summary className="flex h-10 cursor-pointer list-none items-center gap-2 px-3 text-ui text-fg-2 [&::-webkit-details-marker]:hidden">
                    <span className="font-medium text-fg">Details</span>
                    <DetailsSummary request={request} />
                    <ChevronDown size={14} aria-hidden className="ml-auto text-fg-3 transition-transform duration-150 group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-line px-3 py-2">
                    <RequestProperties request={request} />
                  </div>
                </details>
              </div>

              <section className="mt-6" aria-labelledby={`${request.id}-desc`}>
                <h3 id={`${request.id}-desc`} className="sr-only">
                  Description
                </h3>
                {request.description ? (
                  <p className="text-read whitespace-pre-wrap text-fg">{request.description}</p>
                ) : (
                  <p className="text-read text-fg-3">No description.</p>
                )}
              </section>

              <section className="mt-8" aria-labelledby={`${request.id}-activity`}>
                <div className="mb-2 flex items-center justify-between border-b border-line pb-2">
                  <h3 id={`${request.id}-activity`} className="text-ui font-medium text-fg">
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
                        {f === "all" ? "Everything" : "Comments"}
                      </button>
                    ))}
                  </div>
                </div>
                <Timeline requestId={request.id} variant="comfortable" surface="var(--color-canvas)" filter={filter} />
              </section>
            </article>
          </div>
          <div className="safe-bottom shrink-0 px-3 pt-2 pb-3 lg:px-8 lg:pb-5">
            <div className="mx-auto max-w-[720px]">
              <Composer
                key={request.id}
                requestId={request.id}
                placeholder={`Reply to ${involved(request, api.member).filter((p) => p.member.id !== api.me.id).slice(0, 2).map((p) => firstName(p.member.name)).join(" and ") || "the team"}…`}
              />
            </div>
          </div>
        </div>

        <aside
          aria-label="Request inspector"
          className="hidden w-[304px] shrink-0 overflow-y-auto border-l border-line bg-shell @min-[760px]:block"
        >
          <div className="flex flex-col gap-5 p-4">
            <NextStep request={request} />
            <section aria-labelledby={`${request.id}-props`}>
              <h3 id={`${request.id}-props`} className="mb-1 text-micro font-medium tracking-[0.07em] text-fg-3 uppercase">
                Details
              </h3>
              <RequestProperties request={request} />
            </section>
            <section aria-labelledby={`${request.id}-people`}>
              <h3 id={`${request.id}-people`} className="mb-2 text-micro font-medium tracking-[0.07em] text-fg-3 uppercase">
                Involved
              </h3>
              <ul className="flex flex-col gap-2">
                {involved(request, api.member, api.timeline(request.id)).map(({ member, role }) => (
                  <li key={member.id} className="flex items-center gap-2.5">
                    <Avatar name={member.name} size={20} />
                    <span className="min-w-0 flex-1 truncate text-ui text-fg">
                      {member.name}
                      {member.id === api.me.id ? <span className="text-fg-3"> (you)</span> : null}
                    </span>
                    <span className="shrink-0 text-meta text-fg-3">{role}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailsSummary({ request }: { request: Request }) {
  const api = useWorkspace();
  const owner = api.member(request.assigneeId);
  const due = request.dueDate ? dueLabel(request.dueDate, api.today) : null;
  return (
    <span className="flex min-w-0 items-center gap-2 overflow-hidden text-meta text-fg-3">
      <StatusChip status={request.status} />
      <PriorityIcon priority={request.priority} size={12} />
      <span className="sr-only">{PRIORITY_META[request.priority].label}</span>
      {owner ? <Avatar name={owner.name} size={16} /> : null}
      {due ? <span className={cx("truncate", due.tone === "overdue" && "text-danger-fg")}>{due.text}</span> : null}
    </span>
  );
}

function involved(
  request: Request,
  member: (id: string | null) => Member | undefined,
  timeline: ReturnType<ReturnType<typeof useWorkspace>["timeline"]> = [],
) {
  const people: Array<{ member: Member; role: string }> = [];
  const add = (id: string | null, role: string) => {
    const m = member(id);
    if (m && !people.some((p) => p.member.id === m.id)) people.push({ member: m, role });
  };
  add(request.requesterId, "Requester");
  add(request.assigneeId, "Owner");
  add(request.approverId, "Approver");
  for (const item of timeline) if (item.kind === "comment") add(item.comment.authorId, "Commented");
  return people;
}
