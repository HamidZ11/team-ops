/**
 * Formatting is deterministic: callers pass `now`, and all calendar output uses
 * the workspace timezone so server and client render identical strings.
 */
export const WORKSPACE_TIME_ZONE = "Europe/London";

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: WORKSPACE_TIME_ZONE,
});
const weekdayFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  timeZone: WORKSPACE_TIME_ZONE,
});
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: WORKSPACE_TIME_ZONE,
});
const fullFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: WORKSPACE_TIME_ZONE,
});
const dayYearFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: WORKSPACE_TIME_ZONE,
});
const isoDateFormat = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: WORKSPACE_TIME_ZONE,
});

/** `yyyy-mm-dd` of an instant in the workspace timezone. */
export function calendarDate(iso: string) {
  return isoDateFormat.format(new Date(iso));
}

function dayDiff(fromDate: string, toDate: string) {
  const a = Date.parse(`${fromDate}T00:00:00Z`);
  const b = Date.parse(`${toDate}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** "2 Oct", or "2 Oct 2025" when the date isn't in the same year as `reference`. */
function dayMonth(date: Date, reference?: string) {
  if (reference && calendarDate(date.toISOString()).slice(0, 4) !== reference.slice(0, 4)) {
    return dayYearFormat.format(date);
  }
  return dayFormat.format(date);
}

/** Compact relative time for lists: "now", "12m", "3h", "Yesterday", "4d", "2 Oct". */
export function relativeTime(iso: string, now: string) {
  const diff = Date.parse(now) - Date.parse(iso);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const days = dayDiff(calendarDate(iso), calendarDate(now));
  if (days === 0) return `${hours}h`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d`;
  return dayMonth(new Date(iso), now);
}

/** Longer relative time for sentences: "12 minutes ago", "yesterday at 14:05". */
export function relativeTimeLong(iso: string, now: string) {
  const diff = Date.parse(now) - Date.parse(iso);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const days = dayDiff(calendarDate(iso), calendarDate(now));
  if (days === 0) return `${Math.floor(minutes / 60)}h ago`;
  if (days === 1) return `yesterday at ${timeFormat.format(new Date(iso))}`;
  if (days < 7) return `${days} days ago`;
  return dayMonth(new Date(iso), now);
}

export function fullDateTime(iso: string) {
  return fullFormat.format(new Date(iso));
}

/** Pass `today` to include the year for dates outside the current year. */
export function shortDate(dateOrIso: string, today?: string) {
  const iso = dateOrIso.length === 10 ? `${dateOrIso}T12:00:00Z` : dateOrIso;
  return dayMonth(new Date(iso), today);
}

export interface DueLabel {
  text: string;
  tone: "overdue" | "soon" | "normal";
}

/** Due-date label relative to `today` (`yyyy-mm-dd`). */
export function dueLabel(dueDate: string, today: string): DueLabel {
  const days = dayDiff(today, dueDate);
  if (days <= -365) return { text: `${Math.floor(-days / 365)}y overdue`, tone: "overdue" };
  if (days <= -100) return { text: `${Math.floor(-days / 30)}mo overdue`, tone: "overdue" };
  if (days < 0) return { text: `${-days}d overdue`, tone: "overdue" };
  if (days === 0) return { text: "Today", tone: "soon" };
  if (days === 1) return { text: "Tomorrow", tone: "soon" };
  if (days < 7)
    return { text: weekdayFormat.format(new Date(`${dueDate}T12:00:00Z`)), tone: "normal" };
  return { text: shortDate(dueDate, today), tone: "normal" };
}

export function dayHeading(date: string, today: string) {
  const days = dayDiff(date, today);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: WORKSPACE_TIME_ZONE,
  }).format(new Date(`${date}T12:00:00Z`));
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0];
}
