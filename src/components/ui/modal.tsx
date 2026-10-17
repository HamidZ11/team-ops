"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./button";
import { cx } from "./cx";
import { useMotion } from "./motion";
import { dismissActivePopover } from "./popover";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Opened from the keyboard: appear without an entrance. */
  instant?: boolean;
}

/** Native <dialog>: focus containment, Escape and inert background come from the platform. */
export function Modal({ open, onClose, title, children, footer, instant = false }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const motion = useMotion();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      // A dialog replaces whatever transient layer was open; it never stacks over one.
      dismissActivePopover();
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-label={title}
      className={cx(
        "m-auto w-[min(560px,calc(100vw-24px))] rounded-[12px] border border-line-strong bg-overlay p-0 text-fg shadow-float backdrop:bg-black/60 max-sm:mt-auto max-sm:mb-0 max-sm:w-full max-sm:max-w-full max-sm:rounded-b-none",
        motion && !instant && "motion-dialog",
      )}
    >
      {open ? (
        <div className="flex max-h-[min(720px,90dvh)] flex-col">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-line pr-2 pl-4">
            <h2 className="text-ui font-medium">{title}</h2>
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
              <X size={16} />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer ? (
            <div className="safe-bottom flex shrink-0 items-center justify-end gap-2 border-t border-line px-4 py-3">
              {footer}
            </div>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
