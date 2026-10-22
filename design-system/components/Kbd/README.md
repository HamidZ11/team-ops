# Kbd

A keyboard key: an 18px `color-raised` cap with a `color-line-strong` border and 11px `color-fg-3` text.

Hand-written from `src/components/ui/kbd.tsx`.

Use it for keyboard hints beside a control — the `/` in search, ⌘ ↵ "to send" under the composer. In tooltips, write the shortcut in brackets instead: "Back (Esc)", "Next (J)". The consumer provides the key text as children. Meridian's shortcuts: `j`/`k` move, `Enter` opens, `Esc` goes back, `c` creates, `/` searches, `[` hides the sidebar.
