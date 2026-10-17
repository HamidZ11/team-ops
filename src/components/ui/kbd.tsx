import type { ReactNode } from "react";
import { cx } from "./cx";

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cx(
        "inline-grid h-[18px] min-w-[18px] place-items-center rounded-[4px] border border-line-strong bg-raised px-1 font-sans text-micro text-fg-3",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
