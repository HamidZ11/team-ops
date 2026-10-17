"use client";

import { m, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { instant, layoutSpring } from "@/components/ui/springs";

/**
 * Animates its height to fit its content, so the content below moves smoothly
 * instead of jumping. Only resizes caused by a new `animateKey` (a state change)
 * animate; resizes from typing or wrapping follow instantly so text never clips.
 */
export function AutoHeight({ animateKey, children }: { animateKey: string; children: ReactNode }) {
  const inner = useRef<HTMLDivElement>(null);
  const currentKey = useRef(animateKey);
  const measuredKey = useRef(animateKey);
  const reduce = useReducedMotion();
  const [target, setTarget] = useState<{ height: number | "auto"; animate: boolean }>({
    height: "auto",
    animate: false,
  });

  useLayoutEffect(() => {
    currentKey.current = animateKey;
  }, [animateKey]);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const animate = currentKey.current !== measuredKey.current;
      measuredKey.current = currentKey.current;
      setTarget({ height: entry.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight, animate });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <m.div
      initial={false}
      animate={{ height: target.height }}
      transition={target.animate && !reduce ? layoutSpring : instant}
      style={{ overflow: "hidden" }}
    >
      <div ref={inner}>{children}</div>
    </m.div>
  );
}
