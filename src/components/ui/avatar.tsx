import { initials } from "@/domain/format";
import { cx } from "./cx";

/** Muted tone pairs (background, text). Picked deterministically from the name. */
const TONES: Array<[string, string]> = [
  ["#1e2d4a", "#a3c0ff"],
  ["#2d2550", "#c4b7ff"],
  ["#153836", "#8fd8cf"],
  ["#3b2e17", "#efcb8c"],
  ["#43212b", "#f2abbd"],
  ["#1d3825", "#9fdcb0"],
  ["#2a2f38", "#bcc6d4"],
  ["#42291b", "#f3b892"],
];

function toneFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
}

interface AvatarProps {
  name: string | null | undefined;
  size?: 16 | 18 | 20 | 24 | 28 | 32;
  className?: string;
  /** Avatars next to a visible name are decorative. */
  decorative?: boolean;
}

export function Avatar({ name, size = 20, className, decorative = true }: AvatarProps) {
  const dimension = { width: size, height: size };
  if (!name) {
    return (
      <span
        aria-hidden={decorative || undefined}
        aria-label={decorative ? undefined : "Unassigned"}
        role={decorative ? undefined : "img"}
        className={cx(
          "inline-block shrink-0 rounded-full border border-dashed border-fg-4",
          className,
        )}
        style={dimension}
      />
    );
  }
  const [bg, fg] = toneFor(name);
  const text = size <= 18 ? initials(name).slice(0, 1) : initials(name);
  const fontSize = size <= 18 ? 9 : size <= 20 ? 8.5 : size <= 24 ? 10 : size <= 28 ? 11 : 12;
  return (
    <span
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : name}
      role={decorative ? undefined : "img"}
      className={cx(
        "inline-grid shrink-0 place-items-center rounded-full font-semibold tracking-[0.01em] select-none",
        className,
      )}
      style={{ ...dimension, background: bg, color: fg, fontSize, lineHeight: 1 }}
    >
      {text}
    </span>
  );
}

export function AvatarStack({ names, size = 20 }: { names: string[]; size?: 18 | 20 | 24 }) {
  return (
    <span className="flex items-center">
      {names.map((name, i) => (
        <Avatar
          key={name}
          name={name}
          size={size}
          className={cx("ring-2 ring-panel", i > 0 && "-ml-1.5")}
        />
      ))}
    </span>
  );
}
