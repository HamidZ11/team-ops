"use client";

/**
 * PROTOTYPE ONLY — the prototype skill's variant picker, adapted to routes:
 * each concept is its own isolated route, so switching navigates instead of
 * re-mounting in place. Markup, styles and key bindings follow PICKER.md.
 * Rendered only by the development-only /explore and /prototypes layouts; the
 * application at "/" never shows it. Hidden with ?capture=1 for screenshots.
 * Over Unified-based experiments (UNIFIED_ROUTES) it starts hidden: press `
 * (backtick) or add ?picker=1 to show it. Number keys only switch while visible.
 */
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import "./concept-picker.css";

const CONCEPTS = [
  { href: "/prototypes/console", label: "A · Operations console" },
  { href: "/prototypes/workspace", label: "B · Collaborative workspace" },
  { href: "/", label: "Unified" },
];

/** Routes that render the Unified app, where the picker would cover its header. */
const UNIFIED_ROUTES: string[] = [];

const noopSubscribe = () => () => {};

export function ConceptPicker() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const capture = useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).has("capture"),
    () => true,
  );
  const requested = useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).has("picker"),
    () => false,
  );
  const [toggled, setToggled] = useState<boolean | null>(null);
  const inUnified = UNIFIED_ROUTES.includes(pathname);
  const shown = toggled ?? (requested || !inUnified);
  const hidden = capture || !shown;
  const [ready, setReady] = useState(false);
  // -1 on the explore index itself: nothing is highlighted.
  const current = CONCEPTS.findIndex((c) => c.href === pathname || (c.href !== "/" && pathname.startsWith(`${c.href}/`)));

  const moveHighlight = useCallback(() => {
    const el = itemRefs.current[current];
    const highlight = highlightRef.current;
    if (!el || !highlight) return;
    highlight.style.width = `${el.offsetWidth}px`;
    highlight.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [current]);

  useLayoutEffect(() => {
    if (hidden) return;
    moveHighlight();
  }, [moveHighlight, hidden]);

  useEffect(() => {
    if (hidden) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    window.addEventListener("resize", moveHighlight);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", moveHighlight);
    };
  }, [moveHighlight, hidden]);

  const setActive = useCallback(
    (i: number) => {
      if (i < 0 || i >= CONCEPTS.length || i === current) return;
      router.push(CONCEPTS[i].href);
    },
    [current, router],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) return;
      if (target.closest("dialog[open]") || target.closest('[role="listbox"]')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "`") {
        setToggled(!shown);
        return;
      }
      if (hidden) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= CONCEPTS.length) setActive(num - 1);
      else if (e.key === "ArrowRight" && e.shiftKey) setActive((Math.max(current, -1) + 1) % CONCEPTS.length);
      else if (e.key === "ArrowLeft" && e.shiftKey)
        setActive((current - 1 + CONCEPTS.length) % CONCEPTS.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, setActive, shown, hidden]);

  if (hidden) return null;

  return (
    <nav
      ref={navRef}
      className="proto-picker"
      aria-label="Prototype variants"
      data-ready={ready ? "" : undefined}
      data-position="top"
    >
      <span ref={highlightRef} className="proto-picker-highlight" aria-hidden="true" />
      {CONCEPTS.map((concept, i) => (
        <button
          key={concept.href}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          type="button"
          className="proto-picker-item"
          data-active={i === current ? "" : undefined}
          aria-current={i === current ? "true" : undefined}
          onClick={() => setActive(i)}
        >
          {concept.label}
        </button>
      ))}
    </nav>
  );
}
