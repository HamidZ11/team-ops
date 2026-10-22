# Menu

The picker list on the floating surface: `color-overlay`, 9px corners, `color-line-strong` border and `shadow-float`, with 32px options.

Hand-written from `src/components/ui/picker.tsx` and `PopoverSurface` in `src/components/ui/popover.tsx`.

**Use** for every choice from a list: owner, approver, priority, type, filters, sort, the account menu. Optional 11px title and a search row for long lists. The highlighted option is `color-selected`; the chosen one has a check on the right. Options can carry a 16px leading icon or avatar, a right-aligned `color-fg-3` hint, and a separator above.

**Behaviour in the app** One floating layer at a time, in the browser's top layer (no z-index); it opens on the side with room, fades and settles 4px over 150ms when opened by pointer (instantly by keyboard), closes instantly. Escape or choosing returns focus to the trigger. This rendition draws the surface in place; positioning is the consumer's.

**Consumer provides** `options` (`{value, label, icon?, hint?, separated?}`), `value`/`onChange` (or `defaultValue`), `title`, `searchable`, `width`.
