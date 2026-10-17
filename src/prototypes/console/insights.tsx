"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useWorkspace } from "@/components/request/workspace-context";
import { cx } from "@/components/ui/cx";
import { METRICS, series, seriesDates, type MetricId } from "../insights-data";
import { TrendChart } from "./trend-chart";

const RANGES = [30, 90] as const;

/**
 * Trend strip above the table. Each tab answers one "are we keeping up?"
 * question; the chart shows its daily level against the previous period.
 */
export function Insights() {
  const api = useWorkspace();
  const [metricId, setMetricId] = useState<MetricId>("open");
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);
  const [compare, setCompare] = useState(true);
  const [chartOpen, setChartOpen] = useState<boolean | null>(null);
  const dates = useMemo(() => seriesDates(api.today), [api.today]);

  const data = METRICS.map((metric) => {
    const all = series(metric, metric.count(api.requests));
    const values = all.slice(-(range + 1));
    const previous = all.slice(-(2 * range + 1), -range);
    const current = values[values.length - 1];
    return { metric, values, previous, current, delta: current - values[0] };
  });
  const selected = data.find((d) => d.metric.id === metricId)!;

  // null = follow the viewport default (open on desktop, closed on phones).
  const chartClass =
    chartOpen === null ? "hidden md:block" : chartOpen ? "block" : "hidden";

  return (
    <section aria-label="Trends" className="@container rounded-tray border border-line bg-shell p-1">
      <div className="overflow-hidden rounded-panel border border-line bg-panel">
        <div className="flex items-stretch border-b border-line">
          <div role="tablist" aria-label="Metric" className="scroll-row flex min-w-0 flex-1">
            {data.map(({ metric, current, delta }) => {
              const active = metric.id === metricId;
              return (
                <button
                  key={metric.id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => {
                    setMetricId(metric.id);
                    if (chartOpen === false) setChartOpen(true);
                  }}
                  className={cx(
                    "relative flex w-[46%] shrink-0 flex-col gap-1.5 border-r border-line px-4 py-3 text-left transition-colors duration-100 @min-[560px]:w-auto @min-[560px]:max-w-[200px] @min-[560px]:min-w-0 @min-[560px]:flex-1 @min-[560px]:shrink",
                    active ? "bg-raised" : "hover:bg-raised/50",
                  )}
                >
                  <span className="truncate text-meta text-fg-2">{metric.label}</span>
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-[20px] leading-6 font-medium tracking-[-0.01em] text-fg tabular-nums">
                      {current}
                    </span>
                    <span
                      className={cx(
                        "text-meta tabular-nums",
                        delta > 0 ? "text-danger-fg" : delta < 0 ? "text-success-fg" : "text-fg-3",
                      )}
                    >
                      {delta > 0 ? "+" : delta < 0 ? "−" : "±"}
                      {Math.abs(delta)}
                      <span className="sr-only"> versus {range} days ago</span>
                    </span>
                  </span>
                  {active ? <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-fg" /> : null}
                </button>
              );
            })}
          </div>
          <div className="hidden shrink-0 items-center gap-1 px-2 @min-[900px]:flex">
            <div role="group" aria-label="Range" className="flex rounded-control border border-line p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={range === r}
                  onClick={() => setRange(r)}
                  className={cx(
                    "h-6 rounded-[4px] px-2 text-meta tabular-nums transition-colors duration-100",
                    range === r ? "bg-selected text-fg" : "text-fg-3 hover:text-fg-2",
                  )}
                >
                  {r}d
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-pressed={compare}
              onClick={() => setCompare((c) => !c)}
              className={cx(
                "flex h-7 items-center gap-1.5 rounded-control px-2 text-meta transition-colors duration-100",
                compare ? "text-fg-2 hover:text-fg" : "text-fg-3 hover:text-fg-2",
              )}
            >
              <span
                aria-hidden
                className={cx("w-3 border-t border-dashed", compare ? "border-fg-2" : "border-fg-4")}
              />
              Previous {range}d
            </button>
          </div>
          <button
            type="button"
            aria-expanded={chartOpen ?? undefined}
            aria-label={chartOpen === false ? "Show chart" : "Hide chart"}
            onClick={() =>
              setChartOpen((open) =>
                open === null ? !window.matchMedia("(min-width: 768px)").matches : !open,
              )
            }
            className="grid w-10 shrink-0 place-items-center border-l border-line text-fg-3 transition-colors duration-100 hover:bg-raised hover:text-fg"
          >
            <ChevronDown
              size={15}
              aria-hidden
              className={cx(
                "transition-transform duration-150",
                chartOpen === null ? "md:rotate-180" : chartOpen && "rotate-180",
              )}
            />
          </button>
        </div>
        <div className={cx("px-2 pt-1", chartClass)}>
          <TrendChart
            label={selected.metric.label}
            values={selected.values}
            previous={selected.previous}
            dates={dates.slice(-(range + 1))}
            compare={compare}
            height={132}
          />
        </div>
      </div>
    </section>
  );
}
