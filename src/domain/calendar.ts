/**
 * Calendar arithmetic on plain dates (`yyyy-mm-dd`). Everything runs in UTC on
 * the date alone, so no time zone or daylight-saving change can shift a day.
 * Weeks start on Monday (en-GB).
 */

const toDate = (date: string) => new Date(`${date}T00:00:00Z`);
const toIso = (d: Date) => d.toISOString().slice(0, 10);

/** True for a real calendar date in `yyyy-mm-dd` form (rejects 2026-02-30). */
export function isCalendarDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && toIso(toDate(value)) === value;
}

export function addDays(date: string, days: number) {
  const d = toDate(date);
  d.setUTCDate(d.getUTCDate() + days);
  return toIso(d);
}

/** Same day of the month, clamped to the target month's length (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(date: string, months: number) {
  const d = toDate(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return toIso(d);
}

export function startOfMonth(date: string) {
  return `${date.slice(0, 7)}-01`;
}

export function sameMonth(a: string, b: string) {
  return a.slice(0, 7) === b.slice(0, 7);
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(date: string) {
  return (toDate(date).getUTCDay() + 6) % 7;
}

/**
 * Six Monday-first weeks covering the month that contains `date`. Always six,
 * so the calendar keeps one height from month to month.
 */
export function monthWeeks(date: string): string[][] {
  const first = startOfMonth(date);
  let day = addDays(first, -weekdayIndex(first));
  return Array.from({ length: 6 }, () =>
    Array.from({ length: 7 }, () => {
      const current = day;
      day = addDays(day, 1);
      return current;
    }),
  );
}

const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" });
const dayLabelFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** { month: "October", year: "2026" } */
export function monthLabel(date: string) {
  return { month: monthFormat.format(toDate(date)), year: date.slice(0, 4) };
}

/** "Friday, 16 October 2026" — the accessible name of a day. */
export function dayLabel(date: string) {
  return dayLabelFormat.format(toDate(date));
}

export const WEEKDAYS = [
  { short: "Mo", long: "Monday" },
  { short: "Tu", long: "Tuesday" },
  { short: "We", long: "Wednesday" },
  { short: "Th", long: "Thursday" },
  { short: "Fr", long: "Friday" },
  { short: "Sa", long: "Saturday" },
  { short: "Su", long: "Sunday" },
] as const;
