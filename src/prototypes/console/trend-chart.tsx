"use client";

import { useEffect, useRef, useState } from "react";
import { shortDate } from "@/domain/format";

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** A ceiling whose half is also a whole number: these are counts. */
function niceMax(value: number) {
  if (value <= 4) return 4;
  if (value <= 8) return 8;
  if (value <= 10) return 10;
  if (value <= 18) return 20;
  return Math.ceil((value * 1.1) / 10) * 10;
}

/** Step line: these are daily counts, so the value holds until the next day. */
function stepPath(values: number[], x: (i: number) => number, y: (v: number) => number) {
  let d = `M${x(0)},${y(values[0])}`;
  for (let i = 1; i < values.length; i++) d += `H${x(i)}V${y(values[i])}`;
  return d;
}

interface TrendChartProps {
  label: string;
  values: number[];
  previous: number[];
  dates: string[];
  compare: boolean;
  height?: number;
}

export function TrendChart({ label, values, previous, dates, compare, height = 140 }: TrendChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { top: 14, right: 14, bottom: 24, left: 30 };
  const n = values.length;
  const max = niceMax(Math.max(...values, ...(compare ? previous : [0])));
  const innerW = Math.max(0, width - pad.left - pad.right);
  const x = (i: number) => Math.round(pad.left + (i / (n - 1)) * innerW) + 0.5;
  const y = (v: number) => Math.round(pad.top + (1 - v / max) * (height - pad.top - pad.bottom)) + 0.5;
  const ticks = [0, max / 2, max];
  const labelIndices = [0, 1, 2, 3, 4].map((k) => Math.round((k * (n - 1)) / 4));
  const current = values[n - 1];
  const summary = `${label}: ${current} today, ${values[0]} ${n - 1} days ago${compare ? `, ${previous[n - 1]} in the previous period` : ""}.`;

  return (
    <div
      ref={ref}
      className="relative w-full select-none"
      style={{ height }}
      role="img"
      aria-label={summary}
      onPointerLeave={() => setHover(null)}
      onPointerMove={(e) => {
        if (!innerW) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const i = Math.round(((e.clientX - rect.left - pad.left) / innerW) * (n - 1));
        setHover(Math.max(0, Math.min(n - 1, i)));
      }}
    >
      {width > 0 ? (
        <svg width={width} height={height} aria-hidden className="block overflow-visible">
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--color-line)"
                strokeDasharray={t === 0 ? undefined : "2 4"}
              />
              <text
                x={pad.left - 8}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                fontSize="11"
                fill="var(--color-fg-3)"
                className="tabular-nums"
              >
                {t}
              </text>
            </g>
          ))}
          {labelIndices.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={height - 6}
              textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
              fontSize="11"
              fill="var(--color-fg-3)"
            >
              {shortDate(dates[i])}
            </text>
          ))}
          {compare ? (
            <path
              d={stepPath(previous, x, y)}
              fill="none"
              stroke="var(--color-fg-4)"
              strokeWidth="1.25"
              strokeDasharray="2 3"
            />
          ) : null}
          <path d={stepPath(values, x, y)} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
          <circle cx={x(n - 1)} cy={y(current)} r="3" fill="var(--color-accent)" stroke="var(--color-panel)" strokeWidth="2" />
          {hover !== null ? (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={height - pad.bottom} stroke="var(--color-line-strong)" />
              <circle cx={x(hover)} cy={y(values[hover])} r="3" fill="var(--color-accent)" />
              {compare ? <circle cx={x(hover)} cy={y(previous[hover])} r="2.5" fill="var(--color-fg-3)" /> : null}
            </g>
          ) : null}
        </svg>
      ) : null}
      {hover !== null && width > 0 ? (
        <div
          className="pointer-events-none absolute top-1 z-10 min-w-[132px] rounded-[8px] border border-line-strong bg-overlay px-2.5 py-2 text-meta shadow-float"
          style={
            x(hover) > width - 160
              ? { right: width - x(hover) + 10 }
              : { left: x(hover) + 10 }
          }
        >
          <div className="mb-1 font-medium text-fg">{shortDate(dates[hover])}</div>
          <div className="flex items-center justify-between gap-4 text-fg-2">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-2.5 rounded-full bg-accent" />
              This period
            </span>
            <span className="text-fg tabular-nums">{values[hover]}</span>
          </div>
          {compare ? (
            <div className="mt-0.5 flex items-center justify-between gap-4 text-fg-2">
              <span className="flex items-center gap-1.5">
                <span className="h-0 w-2.5 border-t border-dashed border-fg-3" />
                Previous
              </span>
              <span className="text-fg tabular-nums">{previous[hover]}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
