"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { cx } from "./cx";

/*
 * Transient layers: pickers, filter and sort menus, the account menu and the
 * date picker. They share three rules:
 *
 * - One at a time. Opening a layer (by pointer or keyboard), or a dialog,
 *   closes whichever is open. Page shortcuts stand aside while one is open.
 * - Top layer. Each renders through the Popover API, so it sits above dialogs
 *   and is never clipped by a scrolling or transformed ancestor — no z-index.
 *   Inside a modal dialog it's portalled into the dialog, so it stays usable.
 * - Dismissal. Escape and choosing a value return focus to the trigger.
 *   Clicking elsewhere, scrolling what's behind it or resizing the window
 *   close it and leave focus where the user went.
 */

let active: { dismiss: () => void } | null = null;

/** Closes the open transient layer, if any (e.g. before a dialog opens). */
export function dismissActivePopover() {
  const layer = active;
  active = null;
  layer?.dismiss();
}

/** True while a transient layer is open. */
export function isPopoverOpen() {
  return active !== null;
}

const TOP_LAYER =
  typeof HTMLElement !== "undefined" && typeof HTMLElement.prototype.showPopover === "function";

export interface PopoverPlacement {
  top: number;
  left: number;
  maxHeight: number;
  /** Which side of the trigger it opened on; sets the entrance direction. */
  side: "top" | "bottom";
  /** The open modal dialog that holds the trigger, or the document body. */
  container: HTMLElement;
}

/**
 * Coordination, placement and dismissal for one anchored layer. `dismiss`
 * closes without moving focus; the caller handles Escape and selection.
 */
export function useAnchoredPopover({
  open,
  dismiss,
  triggerRef,
  popoverRef,
  width,
  align = "start",
  height = 320,
  minHeight = 220,
}: {
  open: boolean;
  dismiss: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  popoverRef: RefObject<HTMLElement | null>;
  width: number;
  align?: "start" | "end";
  /** Height it would like; it opens above the trigger when there's more room there. */
  height?: number;
  /**
   * Least height that's still usable below the trigger. Scrolling lists can shrink;
   * fixed content (a calendar) passes its full height so it's never clipped.
   */
  minHeight?: number;
}) {
  const [placement, setPlacement] = useState<PopoverPlacement | null>(null);
  const dismissRef = useRef(dismiss);
  useLayoutEffect(() => {
    dismissRef.current = dismiss;
  });

  // One at a time: claiming the slot closes the previous layer in the same commit.
  useLayoutEffect(() => {
    if (!open) return;
    const layer = { dismiss: () => dismissRef.current() };
    const previous = active;
    active = layer;
    previous?.dismiss();
    return () => {
      if (active === layer) active = null;
    };
  }, [open]);

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const gap = 4;
    const margin = 8;
    const below = window.innerHeight - rect.bottom - margin;
    const above = rect.top - margin;
    const opensBelow = below >= Math.min(height, minHeight) || below >= above;
    const maxHeight = Math.min(height, opensBelow ? below : above);
    const top = opensBelow ? rect.bottom + gap : rect.top - gap - maxHeight;
    const rawLeft = align === "end" ? rect.right - width : rect.left;
    const left = Math.max(margin, Math.min(rawLeft, window.innerWidth - width - margin));
    const container = trigger.closest<HTMLElement>("dialog[open]") ?? document.body;
    setPlacement({ top, left, maxHeight, side: opensBelow ? "bottom" : "top", container });
  }, [triggerRef, align, width, height, minHeight]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const inside = (target: EventTarget | null) =>
      target instanceof Node &&
      Boolean(popoverRef.current?.contains(target) || triggerRef.current?.contains(target));
    // Capture phase, so nothing that stops propagation can leave a layer open behind it.
    const onPointerDown = (event: PointerEvent) => {
      if (!inside(event.target)) dismissRef.current();
    };
    const onScroll = (event: Event) => {
      if (!popoverRef.current?.contains(event.target as Node)) dismissRef.current();
    };
    const onResize = () => dismissRef.current();
    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, popoverRef, triggerRef]);

  return open ? placement : null;
}

/** The floating surface. Shown in the top layer as soon as it mounts. */
export function PopoverSurface({
  placement,
  popoverRef,
  width,
  className,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  placement: PopoverPlacement;
  popoverRef: RefObject<HTMLDivElement | null>;
  width: number;
}) {
  useLayoutEffect(() => {
    const el = popoverRef.current;
    if (TOP_LAYER && el && !el.matches(":popover-open")) el.showPopover();
  }, [popoverRef]);

  return createPortal(
    <div
      ref={popoverRef}
      popover={TOP_LAYER ? "manual" : undefined}
      data-side={placement.side}
      className={cx(
        // The UA centres popovers with `inset: 0; margin: auto`; anchor it instead.
        "fixed inset-auto m-0 overflow-hidden rounded-[9px] border border-line-strong bg-overlay p-0 text-fg shadow-float",
        !TOP_LAYER && "z-[100]",
        className,
      )}
      style={{ top: placement.top, left: placement.left, width, maxHeight: placement.maxHeight, ...style }}
      {...props}
    />,
    placement.container,
  );
}
