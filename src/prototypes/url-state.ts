/**
 * PROTOTYPE ONLY — selection and view live in the URL so a state can be
 * linked and screenshotted. Read after mount to keep the routes static.
 */
export function readParams() {
  return new URLSearchParams(window.location.search);
}

export function writeParams(updates: Record<string, string | null>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  if (url.href !== window.location.href) window.history.replaceState(null, "", url);
}

/** True when the keyboard event came from a text field or an open dialog. */
export function isTypingTarget(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  if (!target) return false;
  if (target.closest("dialog[open]")) return true;
  return (
    /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
    target.isContentEditable ||
    target.getAttribute("role") === "combobox"
  );
}
