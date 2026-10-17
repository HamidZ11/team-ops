"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  addDays,
  addMonths,
  dayLabel,
  isCalendarDate,
  monthLabel,
  monthWeeks,
  sameMonth,
  weekdayIndex,
  WEEKDAYS,
} from "@/domain/calendar";
import { Button } from "./button";
import { cx } from "./cx";
import { useMotion } from "./motion";
import { PopoverSurface, useAnchoredPopover } from "./popover";

/**
 * On in the unified prototype: date fields open this calendar instead of the
 * browser's own picker (which can't be styled or coordinated with other popovers).
 */
export const CalendarPickerContext = createContext(false);

export function useCalendarPicker() {
  return useContext(CalendarPickerContext);
}

const CELL = 32;
/** Seven day cells, side padding and the border. */
const WIDTH = CELL * 7 + 16 + 2;
const HEIGHT = 312;

/**
 * A button that opens a month calendar (WAI-ARIA date picker dialog pattern).
 * Values are plain dates (`yyyy-mm-dd`); `today` comes from the workspace so
 * "today" matches due-date labels everywhere else.
 *
 * Keyboard: arrows move by day and week, Home/End to the week's start/end,
 * Page Up/Down by month (with Shift, by year), Enter or Space chooses, Escape
 * closes and returns to the trigger. Tab stays within the calendar.
 */
export function DatePicker({
  label,
  title,
  value,
  onChange,
  today,
  min,
  clearable = false,
  children,
  triggerClassName,
  disabled,
  align = "start",
}: {
  /** Accessible name of the trigger, including the current value. */
  label: string;
  /** Name of the calendar dialog, e.g. "Due date". */
  title: string;
  value: string | null;
  onChange: (value: string | null) => void;
  today: string;
  /** Earliest date that can be chosen. */
  min?: string;
  /** Offer "Clear" when a date is set. */
  clearable?: boolean;
  children: ReactNode;
  triggerClassName?: string;
  disabled?: boolean;
  align?: "start" | "end";
}) {
  const selected = value && isCalendarDate(value) ? value : null;
  const [open, setOpen] = useState(false);
  const [openedByPointer, setOpenedByPointer] = useState(false);
  // The day with the roving tab stop; the visible month is the one that contains it.
  const [focused, setFocused] = useState(selected ?? today);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);
  const focusDay = useRef(false);
  const headingId = useId();
  const motion = useMotion();

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  const placement = useAnchoredPopover({
    open,
    dismiss: () => close(false),
    triggerRef,
    popoverRef,
    width: WIDTH,
    align,
    height: HEIGHT,
    minHeight: HEIGHT,
  });

  const unavailable = (date: string) => Boolean(min && date < min);

  function show(byPointer: boolean) {
    setFocused(selected ?? (min && today < min ? min : today));
    setOpenedByPointer(byPointer);
    focusDay.current = true;
    setOpen(true);
  }

  function choose(date: string | null) {
    if (date && unavailable(date)) return;
    onChange(date);
    close();
  }

  // Focus follows the roving day after opening and after each keyboard move.
  useLayoutEffect(() => {
    if (!placement || !focusDay.current) return;
    focusDay.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${focused}"]`)?.focus({ preventScroll: true });
  });

  function onGridKeyDown(event: KeyboardEvent) {
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -weekdayIndex(focused)),
      End: () => addDays(focused, 6 - weekdayIndex(focused)),
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    focusDay.current = true;
    setFocused(move());
  }

  function onSurfaceKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      // Also keeps an enclosing dialog open: Escape closes one layer at a time.
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === "Tab") {
      const stops = [...(popoverRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled)") ?? [])].filter(
        (el) => el.tabIndex >= 0,
      );
      if (!stops.length) return;
      event.preventDefault();
      const i = stops.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey ? (i <= 0 ? stops.length - 1 : i - 1) : (i + 1) % stops.length;
      stops[next].focus({ preventScroll: true });
    }
  }

  const { month, year } = monthLabel(focused);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={(e) => (open ? close() : show(e.detail > 0))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            show(false);
          }
        }}
        className={cx("disabled:cursor-default", triggerClassName)}
      >
        {children}
      </button>
      {placement ? (
        <PopoverSurface
          placement={placement}
          popoverRef={popoverRef}
          width={WIDTH}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cx(motion && openedByPointer && "motion-pop")}
          onKeyDown={onSurfaceKeyDown}
        >
          <div className="flex h-10 items-center gap-0.5 pr-1.5 pl-3">
            <h2 id={headingId} aria-live="polite" className="min-w-0 flex-1 text-ui font-medium text-fg">
              {month} <span className="font-normal text-fg-3 tabular-nums">{year}</span>
            </h2>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Previous month"
              title="Previous month (Page Up)"
              onClick={() => setFocused(addMonths(focused, -1))}
            >
              <ChevronLeft size={15} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Next month"
              title="Next month (Page Down)"
              onClick={() => setFocused(addMonths(focused, 1))}
            >
              <ChevronRight size={15} />
            </Button>
          </div>

          <table
            ref={gridRef}
            role="grid"
            aria-labelledby={headingId}
            onKeyDown={onGridKeyDown}
            className="mx-2 mb-2 border-collapse"
          >
            <thead>
              <tr>
                {WEEKDAYS.map((d) => (
                  <th key={d.short} scope="col" abbr={d.long} className="h-7 w-8 p-0 text-center text-micro font-medium text-fg-3">
                    {d.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthWeeks(focused).map((week) => (
                <tr key={week[0]}>
                  {week.map((date) => {
                    const isSelected = date === selected;
                    const isToday = date === today;
                    const off = unavailable(date);
                    const tone = isSelected
                      ? "bg-accent font-medium text-white"
                      : off
                        ? "cursor-default text-fg-4/60"
                        : isToday
                          ? "font-semibold text-accent-fg hover:bg-raised"
                          : sameMonth(date, focused)
                            ? "text-fg hover:bg-raised"
                            : "text-fg-4 hover:bg-raised hover:text-fg-2";
                    return (
                      <td key={date} aria-selected={isSelected} className="p-0">
                        <button
                          type="button"
                          data-date={date}
                          tabIndex={date === focused ? 0 : -1}
                          aria-label={dayLabel(date)}
                          aria-current={isToday ? "date" : undefined}
                          aria-disabled={off || undefined}
                          onClick={() => choose(date)}
                          className={cx(
                            "relative grid size-8 place-items-center rounded-control text-ui tabular-nums transition-colors duration-75",
                            tone,
                          )}
                        >
                          {Number(date.slice(8))}
                          {isToday ? (
                            <span
                              aria-hidden
                              className={cx(
                                "absolute bottom-[3px] left-1/2 size-[3px] -translate-x-1/2 rounded-full",
                                isSelected ? "bg-white" : "bg-accent-fg",
                              )}
                            />
                          ) : null}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-line p-1.5">
            <Button variant="ghost" onClick={() => choose(today)} disabled={unavailable(today)}>
              Today
            </Button>
            {clearable && selected ? (
              <Button variant="ghost" onClick={() => choose(null)}>
                Clear
              </Button>
            ) : null}
          </div>
        </PopoverSurface>
      ) : null}
    </>
  );
}
