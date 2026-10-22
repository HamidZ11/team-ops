# Avatar

A round initials badge in one of eight muted tone pairs, chosen from the person's name so the same person is always the same colour.

Hand-written from `src/components/ui/avatar.tsx`. `AvatarStack` (same file) overlaps several by 6px with a 2px `color-panel` ring.

**Use** beside a visible name (owner, approver, comment author). Sizes 16, 18, 20, 24, 28, 32px; 18px and below show one initial. A missing person (`name` null) is a dashed `color-fg-4` ring — "Unassigned". Tone pairs are identity only and never carry meaning; they are not tokens.

**Consumer provides** `name`, `size`, and `decorative: false` when no name is shown next to it, so the avatar gets an accessible label. Avatars are never photos.
