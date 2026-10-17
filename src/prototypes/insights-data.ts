/**
 * PROTOTYPE ONLY — synthetic daily history for the trend strip. The final
 * point of each series is the live count from the store; everything before it
 * is a seeded random walk so screenshots are stable.
 */
import type { Request } from "@/domain/types";
import { isOpen } from "@/domain/types";

export type MetricId = "open" | "triage" | "awaiting" | "blocked";

export interface MetricDefinition {
  id: MetricId;
  label: string;
  /** Rising is bad for every metric here; deltas are coloured accordingly. */
  count: (requests: Request[]) => number;
  walk: { base: number; min: number; max: number; step: number; mean: number; pull: number; seed: number };
}

export const METRICS: MetricDefinition[] = [
  {
    id: "open",
    label: "Open requests",
    count: (rs) => rs.filter(isOpen).length,
    walk: { base: 26, min: 12, max: 34, step: 2, mean: 21, pull: 0.08, seed: 11 },
  },
  {
    id: "triage",
    label: "Needs triage",
    count: (rs) => rs.filter((r) => r.status === "triage").length,
    walk: { base: 6, min: 0, max: 10, step: 1.6, mean: 3, pull: 0.25, seed: 23 },
  },
  {
    id: "awaiting",
    label: "Awaiting approval",
    count: (rs) => rs.filter((r) => r.status === "in_review").length,
    walk: { base: 6, min: 0, max: 9, step: 1.3, mean: 4, pull: 0.2, seed: 37 },
  },
  {
    id: "blocked",
    label: "Blocked",
    count: (rs) => rs.filter((r) => isOpen(r) && r.blocked).length,
    walk: { base: 2, min: 0, max: 6, step: 1.1, mean: 2, pull: 0.3, seed: 41 },
  },
];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const HISTORY_DAYS = 180;

const cache = new Map<MetricId, number[]>();

function history(metric: MetricDefinition) {
  const cached = cache.get(metric.id);
  if (cached) return cached;
  const { base, min, max, step, mean, pull, seed } = metric.walk;
  const rand = mulberry32(seed);
  const out = new Array<number>(HISTORY_DAYS);
  out[HISTORY_DAYS - 1] = base;
  for (let i = HISTORY_DAYS - 2; i >= 0; i--) {
    const v = out[i + 1];
    const noise = Math.round((rand() * 2 - 1) * step);
    const reversion = Math.round((mean - v) * pull);
    out[i] = Math.max(min, Math.min(max, v + noise + reversion));
  }
  cache.set(metric.id, out);
  return out;
}

/** Daily values, oldest first, ending today with `current`. */
export function series(metric: MetricDefinition, current: number) {
  const values = history(metric).slice();
  values[values.length - 1] = current;
  return values;
}

/** Calendar dates matching `series` indices, oldest first. */
export function seriesDates(today: string) {
  const end = Date.parse(`${today}T12:00:00Z`);
  return Array.from({ length: HISTORY_DAYS }, (_, i) =>
    new Date(end - (HISTORY_DAYS - 1 - i) * 86_400_000).toISOString().slice(0, 10),
  );
}
