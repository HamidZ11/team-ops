"use client";

import { ArrowLeft, Bell, BellRing, Check, ChevronDown, ChevronRight, ChevronUp, Link2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Composer } from "@/components/request/composer";
import { StatusIcon, statusStyle, TypeIcon } from "@/components/request/glyphs";
import { NextStep } from "@/components/request/next-step";
import { RequestProperties } from "@/components/request/properties";
import { WorkflowStepper } from "@/components/request/stepper";
import { Timeline } from "@/components/request/timeline";
import { useWorkspace, type TimelineItem } from "@/components/request/workspace-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { firstName, relativeTimeLong } from "@/domain/format";
import type { ActivityEvent, Member, Request, RequestStatus } from "@/domain/types";
import { useMotion } from "@/components/ui/motion";
import { fadeIn, panelSpring } from "@/components/ui/springs";
import { m } from "motion/react";
import { AutoHeight } from "./auto-height";
import { can } from "@/domain/workflow";
import { useWorkflowAction } from "@/components/request/workflow-feedback";
import { PaneHeader, SidebarRestore } from "./view-header";

/*
 * One request layout, used beside the queue (Inbox, My work, Approvals) and on
 * its own when opened from a table.
 *
 *   ┌ header: where you are · position · follow ───────────────┐
 *   │ title, then the state block (progress + the decision)  │ inspector │
 *   │ description                                            │ details   │
 *   │ activity and comments                                  │ involved  │
 *   │ composer (pinned)                                      │           │
 *
 * State changes live in the reading column, under the title, so the decision
 * is the first thing read. The inspector holds properties (owner, priority,
 * approver, due date; each editable inline) and people. Because it holds no
 * state changes, it can fold away: below 840px of available width its details
 * move inline above the description.
 */
export function RequestWorkspace({
  request,
  context,
  onBack,
  position,
  onStep,
  following,
  onToggleFollow,
  onShowSidebar,
}: {
  request: Request;
  /** Where the request was opened from: shown as the breadcrumb or back link. */
  context: { label: string; mode: "split" | "page" };
  onBack: () => void;
  position: { index: number; total: number } | null;
  onStep: (direction: 1 | -1) => void;
  following: boolean;
  onToggleFollow: () => void;
  /** Page mode only: restores the collapsed sidebar from this header. */
  onShowSidebar?: () => void;
}) {
  const api = useWorkspace();
  const perform = useWorkflowAction();
  const [filter, setFilter] = useState<"all" | "comments">("all");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLElement>(null);
  const [stateInView, setStateInView] = useState(true);
  const [openChanges, setOpenChanges] = useState(0);
  const [dockError, setDockError] = useState<string | null>(null);
  const motion = useMotion();
  // Everything already in the history when this request was opened. Only what happens
  // after that animates, so switching requests or reopening one never replays motion.
  const [initialIds] = useState(() => new Set(api.timeline(request.id).map(itemId)));

  // Tracks whether the decision in the state block is on screen.
  useEffect(() => {
    const el = stateRef.current;
    const root = scrollRef.current;
    if (!el || !root) return;
    // The decision's buttons sit ~44px above the block's bottom edge. Treat the block as
    // out of view once fewer than 44px remain, so the dock appears before they scroll away.
    const observer = new IntersectionObserver(([entry]) => setStateInView(entry.isIntersecting), {
      root,
      rootMargin: "-44px 0px 0px 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const type = api.type(request.typeId);
  const requester = api.member(request.requesterId);
  const timeline = api.timeline(request.id);
  const people = involved(request, api.member, timeline);
  const commentCount = timeline.filter((i) => i.kind === "comment").length;
  const canDecide = can(request, "approve", { id: api.me.id, role: api.me.role }).ok;
  const latestPhase = [...timeline].reverse().find(
    (i): i is Extract<TimelineItem, { kind: "event" }> => i.kind === "event" && PHASE_EVENTS.has(i.event.payload.type),
  )?.event;
  const phaseChangedHere = Boolean(latestPhase && !initialIds.has(latestPhase.id));
  const fillFrom = phaseChangedHere && latestPhase ? statusBefore(latestPhase) : null;
  // Keep the dock's reserved space for a moment after deciding, so the conversation doesn't jump.
  const decidedHere =
    phaseChangedHere && (latestPhase?.payload.type === "approved" || latestPhase?.payload.type === "changes_requested");
  const reserveDockSpace = canDecide || decidedHere;
  const phaseKey = `${request.status}:${request.blocked ? "blocked" : ""}`;
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const replyTo = people
    .filter((p) => p.member.id !== api.me.id)
    .slice(0, 2)
    .map((p) => firstName(p.member.name))
    .join(" and ");

  return (
    <div data-request-workspace className="@container flex h-full min-w-0 flex-col bg-canvas">
      <PaneHeader className="px-2 lg:px-4">
        {context.mode === "page" && onShowSidebar ? <SidebarRestore onShow={onShowSidebar} /> : null}
        {context.mode === "page" ? (
          <Button
            variant="ghost"
            onClick={onBack}
            aria-label={`Back to ${context.label} (Esc)`}
            title="Back (Esc)"
            data-request-nav
            className="-ml-1 px-2"
          >
            <ArrowLeft size={15} aria-hidden />
            <span className="max-sm:hidden">{context.label}</span>
          </Button>
        ) : (
          <Button variant="ghost" size="icon-md" onClick={onBack} aria-label={`Back to ${context.label}`} className="lg:hidden">
            <ArrowLeft size={17} />
          </Button>
        )}
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-meta">
          {context.mode === "split" ? (
            <>
              <span className="hidden truncate text-fg-3 lg:inline">{context.label}</span>
              <ChevronRight size={12} aria-hidden className="hidden text-fg-4 lg:block" />
            </>
          ) : (
            <ChevronRight size={12} aria-hidden className="text-fg-4 max-sm:hidden" />
          )}
          <span className="text-fg-2 tabular-nums">{api.keyOf(request)}</span>
        </nav>
        <span data-request-nav className="ml-auto flex items-center gap-0.5">
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
      </PaneHeader>

      {/* Switching requests swaps this in place: no fade from empty, no offset. */}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <article
              className={cx(
                "mx-auto max-w-[720px] px-4 pt-6 lg:px-8",
                // Room for the overlaid dock, so the last entry is never hidden beneath it.
                reserveDockSpace ? "pb-[88px]" : "pb-10",
              )}
            >
              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-meta text-fg-3">
                {type ? <TypeIcon icon={type.icon} size={13} /> : null}
                <span>{type?.name}</span>
                <span aria-hidden>·</span>
                <Avatar name={requester?.name} size={16} />
                <span>
                  <span className="text-fg-2">{requester?.name}</span> requested{" "}
                  {relativeTimeLong(request.createdAt, api.now)}
                </span>
              </p>
              <h2
                tabIndex={-1}
                data-request-title
                className="mt-2 rounded-[3px] text-heading font-semibold tracking-[-0.015em] text-balance wrap-break-word text-fg"
              >
                {request.title}
              </h2>

              {/* State: where it is in the workflow, and what happens next for you. */}
              <section
                ref={stateRef}
                aria-label="Current state"
                className="mt-5 scroll-mt-4 overflow-hidden rounded-panel border border-line bg-panel"
              >
                <WorkflowStepper
                  request={request}
                  className="border-b border-line px-4 py-2.5"
                  fillFrom={motion ? fillFrom : null}
                  fillKey={latestPhase?.id}
                  accentDone
                  celebrate={motion && phaseChangedHere}
                />
                {/*
                  The panel's height follows its content with a spring, so what's below moves
                  instead of jumping. New content settles in only if the state changed while viewing.
                */}
                <AutoHeight animateKey={`${phaseKey}:${openChanges}`}>
                  <m.div
                    key={phaseKey}
                    initial={motion && phaseChangedHere ? { opacity: 0, y: 8 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ opacity: fadeIn, y: panelSpring }}
                  >
                    <NextStep request={request} embedded openChanges={openChanges} />
                  </m.div>
                </AutoHeight>
              </section>

              {/* No room for the inspector: its details become a compact strip of facts here. */}
              <section aria-label="Details" className="mt-3 rounded-panel border border-line px-4 py-2.5 @min-[840px]:hidden">
                <div className="hidden @min-[600px]:block">
                  <RequestProperties request={request} layout="facts" />
                </div>
                <div className="@min-[600px]:hidden">
                  <h3 className="pt-0.5 pb-1 text-meta font-medium text-fg-3">Details</h3>
                  <RequestProperties request={request} />
                </div>
              </section>

              <section className="mt-7" aria-labelledby={`${request.id}-desc`}>
                <h3 id={`${request.id}-desc`} className="mb-2 text-meta font-medium text-fg-3">
                  Description
                </h3>
                {request.description ? (
                  <p className="text-read wrap-break-word whitespace-pre-wrap text-fg">{request.description}</p>
                ) : (
                  <p className="text-read text-fg-3">No description.</p>
                )}
              </section>

              <section className="mt-8" aria-labelledby={`${request.id}-activity`}>
                <div className="mb-2 flex items-center justify-between border-b border-line pb-2">
                  <h3 id={`${request.id}-activity`} className="flex items-baseline gap-2 text-ui font-medium text-fg">
                    Activity
                    <span className="text-meta font-normal text-fg-3 tabular-nums">
                      {commentCount} {commentCount === 1 ? "comment" : "comments"}
                    </span>
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
                <Timeline
                  requestId={request.id}
                  variant="comfortable"
                  surface="var(--color-canvas)"
                  filter={filter}
                  isNew={motion ? (id) => !initialIds.has(id) : undefined}
                />
              </section>
            </article>
          </div>
          <div className="safe-bottom shrink-0 px-3 pt-2 pb-3 lg:px-8 lg:pb-5">
            <div ref={composerRef} className="relative mx-auto max-w-[656px]">
              {/*
                Decision dock. Only for the person who must decide, and only while the
                decision above is scrolled out of view, so the controls are never on
                screen twice. It overlays the conversation (space is reserved below the
                last entry) so the reading area never resizes. Hidden means inert.
                Request changes returns to the one reason form above.
              */}
              {canDecide ? (
                <div
                  role="region"
                  aria-label="Pending decision"
                  data-state={stateInView ? "closed" : "open"}
                  inert={stateInView}
                  className="decision-dock tinted-card absolute right-0 bottom-full left-0 z-10 mb-2 flex items-center gap-3 rounded-panel border py-2 pr-2 pl-3 shadow-[0_10px_24px_-10px_rgb(0_0_0/0.7)]"
                  style={statusStyle("in_review")}
                >
                  <StatusIcon status="in_review" />
                  {/* Who submitted and when is in the state block; the dock only carries the decision. */}
                  <p className="min-w-0 flex-1 truncate text-ui font-medium text-fg">
                    Your approval is needed
                    {dockError ? (
                      <span role="alert" className="font-normal text-danger-fg">
                        {" "}
                        · {dockError}
                      </span>
                    ) : null}
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      // Announced, but focus stays near the dock (the panel above is out of view).
                      const result = perform(request, { type: "approve" }, { focus: false });
                      setDockError(result.ok ? null : result.error);
                      // The dock disappears once approved; keep keyboard focus where the user is.
                      if (result.ok)
                        requestAnimationFrame(() =>
                          composerRef.current?.querySelector("textarea")?.focus({ preventScroll: true }),
                        );
                    }}
                  >
                    <Check size={14} aria-hidden />
                    Approve
                  </Button>
                  <Button
                    onClick={() => {
                      stateRef.current?.scrollIntoView({ block: "start", behavior: reduceMotion() ? "auto" : "smooth" });
                      // If the reason form is already open, return to it rather than resetting what was typed.
                      const open = stateRef.current?.querySelector("textarea");
                      if (open) open.focus({ preventScroll: true });
                      else setOpenChanges((n) => n + 1);
                    }}
                  >
                    Request changes
                  </Button>
                </div>
              ) : null}
              <Composer
                key={request.id}
                requestId={request.id}
                placeholder={`Reply to ${replyTo || "the team"}…`}
                onSubmitted={() =>
                  requestAnimationFrame(() => {
                    const el = scrollRef.current;
                    if (!el) return;
                    el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion() ? "auto" : "smooth" });
                  })
                }
              />
            </div>
          </div>
        </div>

        <aside
          aria-label="Request details"
          className="hidden w-[288px] shrink-0 overflow-y-auto border-l border-line bg-shell @min-[840px]:block"
        >
          <section aria-labelledby={`${request.id}-props`} className="px-4 pt-4 pb-3">
            <h3 id={`${request.id}-props`} className="mb-1 text-meta font-medium text-fg-3">
              Details
            </h3>
            <RequestProperties request={request} />
          </section>
          <section aria-labelledby={`${request.id}-people`} className="border-t border-line px-4 pt-4 pb-4">
            <h3 id={`${request.id}-people`} className="mb-2.5 text-meta font-medium text-fg-3">
              Involved
            </h3>
            <ul className="flex flex-col gap-2.5">
              {people.map(({ member, role }) => (
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
        </aside>
      </div>
    </div>
  );
}

/** Events that change a request's state (and so its decision panel). */
const PHASE_EVENTS = new Set<ActivityEvent["payload"]["type"]>([
  "accepted",
  "declined",
  "status_changed",
  "approved",
  "changes_requested",
  "blocked",
  "unblocked",
]);

function itemId(item: TimelineItem) {
  return item.kind === "comment" ? item.comment.id : item.event.id;
}

/** The status a state-changing event moved the request away from. */
function statusBefore(event: ActivityEvent): RequestStatus | null {
  const p = event.payload;
  switch (p.type) {
    case "accepted":
      return "triage";
    case "status_changed":
      return p.from;
    case "approved":
    case "changes_requested":
      return "in_review";
    default:
      return null;
  }
}

function involved(request: Request, member: (id: string | null) => Member | undefined, timeline: TimelineItem[]) {
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
