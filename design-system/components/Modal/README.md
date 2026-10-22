# Modal

The dialog surface: up to 560px wide, `radius-tray` corners, `color-overlay` with `shadow-float`, a 48px header with the title and a close button, a scrolling body and a right-aligned footer.

Hand-written from `src/components/ui/modal.tsx` (shown in place here; the app renders a native `<dialog>` with `showModal()`).

**Use** sparingly — New request is the main one. The footer holds a ghost Cancel and one primary action. On phones it becomes a bottom sheet with square bottom corners. The backdrop is black at 60%.

**Behaviour in the app** The platform supplies focus containment, Escape and the inert background. Opening it closes any open menu. It enters with a 6px rise and fade over 180ms when opened by pointer, instantly by keyboard; it closes instantly.

**Consumer provides** `title`, children (pad them 16px), `footer`, `onClose`.
