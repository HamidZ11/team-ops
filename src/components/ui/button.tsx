"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cx } from "./cx";
import { useMotion } from "./motion";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "icon-sm" | "icon-md";

const variants: Record<Variant, string> = {
  primary: "bg-fg text-canvas hover:bg-white",
  secondary:
    "border border-line bg-raised text-fg hover:border-line-strong hover:bg-selected",
  ghost: "text-fg-2 hover:bg-raised hover:text-fg",
  danger:
    "border border-danger/30 bg-danger/10 text-danger-fg hover:border-danger/50 hover:bg-danger/15",
};

const sizes: Record<Size, string> = {
  sm: "h-7 px-2.5 text-ui",
  md: "h-8 px-3 text-ui",
  "icon-sm": "size-7",
  "icon-md": "size-8",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "sm", className, type = "button", ...props },
  ref,
) {
  const motion = useMotion();
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control font-medium whitespace-nowrap transition-colors duration-100 ease-out select-none disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        motion && "motion-press",
        className,
      )}
      {...props}
    />
  );
});
