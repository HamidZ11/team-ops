"use client";

import { Ban } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { Request, RequestStatus } from "@/domain/types";
import { STAGES } from "@/domain/workflow";
import { cx } from "@/components/ui/cx";
import { ease, popSpring } from "@/components/ui/springs";
import { STATUS_META, StatusIcon } from "./glyphs";

const STAGE_LABEL: Partial<Record<RequestStatus, string>> = {
  triage: "Triage",
  todo: "To do",
  in_progress: "In progress",
  in_review: "Approval",
  done: "Done",
};

/**
 * Where the request sits in the workflow, including skipped and blocked stages.
 * `fillFrom` (with a `fillKey` that changes per action) animates only the
 * segments just completed — e.g. Approval→Done after an approval.
 * `accentDone` shows a finished request's final stage as a green check;
 * `celebrate` lets the newly reached stage settle in (and the check draw itself).
 */
export function WorkflowStepper({
  request,
  className,
  fillFrom = null,
  fillKey,
  accentDone = false,
  celebrate = false,
}: {
  request: Request;
  className?: string;
  fillFrom?: RequestStatus | null;
  fillKey?: string;
  accentDone?: boolean;
  celebrate?: boolean;
}) {
  const reduce = useReducedMotion();
  if (request.status === "declined") {
    return (
      <ol aria-label="Progress" className={cx("flex items-center gap-2 text-meta", className)}>
        <li className="flex items-center gap-1.5 text-fg-3">
          <StatusIcon status="triage" size={12} />
          Triage
        </li>
        <li aria-hidden className="h-px w-8 bg-line-strong" />
        <li aria-current="step" className="flex items-center gap-1.5 font-medium text-fg">
          <StatusIcon status="declined" size={14} />
          Declined
        </li>
      </ol>
    );
  }

  const current = STAGES.indexOf(request.status);
  const needsApproval = request.approverId !== null;
  const from = fillFrom ? STAGES.indexOf(fillFrom) : -1;
  // Done has no "current" stage; its last segment ends at the final index.
  const reached = request.status === "done" ? STAGES.length - 1 : current;

  return (
    <ol
      aria-label={`Progress: ${STATUS_META[request.status].label}${request.blocked ? ", blocked" : ""}`}
      className={cx("flex items-center text-meta", className)}
    >
      {STAGES.map((stage, i) => {
        // Whether approval is needed is decided at triage, so don't call it skipped before then.
        const skipped = stage === "in_review" && !needsApproval && request.status !== "triage";
        const complete = i < current || request.status === "done";
        const isCurrent = i === current && request.status !== "done";
        const last = i === STAGES.length - 1;
        const isEnd = accentDone && last && request.status === "done";
        // The stage this action just reached settles in after its segment fills.
        const settle = (glyph: ReactNode) =>
          celebrate ? (
            <m.span
              key={fillKey}
              className="inline-flex"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...popSpring, delay: 0.12 }}
            >
              {glyph}
            </m.span>
          ) : (
            glyph
          );
        return (
          <li
            key={stage}
            aria-current={isCurrent || isEnd ? "step" : undefined}
            className={cx("flex min-w-0 items-center", !last && "flex-1")}
          >
            <span
              className={cx(
                "flex shrink-0 items-center gap-1.5 whitespace-nowrap",
                isCurrent || isEnd ? "font-medium text-fg" : "text-fg-3",
                skipped && "line-through decoration-fg-4",
                !isCurrent && !isEnd && "max-sm:[&>span]:sr-only",
              )}
            >
              {isEnd ? (
                settle(<DoneMark draw={celebrate && !reduce} />)
              ) : isCurrent && request.blocked ? (
                <Ban size={14} aria-hidden className="text-danger-fg" />
              ) : isCurrent ? (
                settle(<StatusIcon status={request.status} size={14} />)
              ) : complete && !skipped ? (
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                  <circle cx="6" cy="6" r="5.5" fill="var(--color-fg-4)" />
                  <path d="m3.6 6.1 1.6 1.6 3.2-3.3" stroke="#121212" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                  <circle
                    cx="6"
                    cy="6"
                    r="5"
                    fill="none"
                    stroke="var(--color-fg-4)"
                    strokeWidth="1.25"
                    strokeDasharray={skipped ? "1.6 1.6" : undefined}
                  />
                </svg>
              )}
              <span>
                {skipped ? "No approval" : STAGE_LABEL[stage]}
                {isCurrent && request.blocked ? (
                  <span className="text-danger-fg"> · Blocked</span>
                ) : null}
              </span>
            </span>
            {!last ? (
              from >= 0 && i >= from && i < reached ? (
                <span aria-hidden className="relative mx-1.5 h-px min-w-2 flex-1 bg-line-strong">
                  <span key={fillKey} className="motion-fill absolute inset-0 bg-fg-4" />
                </span>
              ) : (
                <span
                  aria-hidden
                  className={cx(
                    "mx-1.5 h-px min-w-2 flex-1",
                    i < current || (request.status === "done" && i < reached) ? "bg-fg-4" : "bg-line-strong",
                  )}
                />
              )
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/** The finished state's check; draws itself once when the request is completed in view. */
function DoneMark({ draw }: { draw: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0">
      <circle cx="7" cy="7" r="6.25" fill="var(--color-st-done)" />
      <m.path
        d="m4.4 7.1 1.75 1.75L9.6 5.4"
        stroke="#121212"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={draw ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.32, ease, delay: 0.22 }}
      />
    </svg>
  );
}
