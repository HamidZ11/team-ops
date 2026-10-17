/**
 * One polite live region for the whole app. Screen readers read each message
 * once; repeating the same text within a second is ignored so a single action
 * never produces duplicate announcements.
 */
let region: HTMLElement | null = null;
let last = { text: "", at: 0 };

function ensureRegion() {
  if (region && document.body.contains(region)) return region;
  region = document.createElement("div");
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "polite");
  region.setAttribute("aria-atomic", "true");
  region.className = "sr-only";
  document.body.appendChild(region);
  return region;
}

export function announce(text: string) {
  if (typeof document === "undefined" || !text) return;
  const now = Date.now();
  if (text === last.text && now - last.at < 1000) return;
  last = { text, at: now };
  const el = ensureRegion();
  // Clear first so an identical later message is still read.
  el.textContent = "";
  requestAnimationFrame(() => {
    el.textContent = text;
  });
}
