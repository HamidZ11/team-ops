"use client";

import { Check, Search } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { cx } from "./cx";
import { useMotion } from "./motion";
import { PopoverSurface, useAnchoredPopover } from "./popover";

export interface PickerOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  hint?: string;
  /** Extra text matched by search but not shown. */
  keywords?: string;
  /** Renders a separator above this option. */
  separated?: boolean;
}

interface PickerProps<T extends string> {
  /** Accessible name of the trigger and the list, e.g. "Change owner". */
  label: string;
  options: PickerOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  children: ReactNode;
  triggerClassName?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  align?: "start" | "end";
  width?: number;
  disabled?: boolean;
  /** Heading shown at the top of the list. */
  title?: string;
  invalid?: boolean;
}

/**
 * A button that opens an anchored, searchable listbox. Keyboard: arrows move,
 * Enter selects, Escape closes and returns focus to the trigger, Tab closes and
 * moves on from the trigger. Only one picker (or other popover) is open at a time.
 */
export function Picker<T extends string>({
  label,
  options,
  value,
  onChange,
  children,
  triggerClassName,
  searchable = false,
  searchPlaceholder = "Search…",
  align = "start",
  width = 232,
  disabled,
  title,
  invalid,
}: PickerProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  // Keyboard-opened lists appear instantly; only pointer opens get the entrance.
  const [openedByPointer, setOpenedByPointer] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const motion = useMotion();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      `${o.label} ${o.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [options, query]);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    setQuery("");
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const position = useAnchoredPopover({
    open,
    dismiss: () => close(false),
    triggerRef,
    popoverRef,
    width,
    align,
  });

  function openList(byPointer: boolean) {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpenedByPointer(byPointer);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      if (searchable) searchRef.current?.focus({ preventScroll: true });
      else listRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [open, searchable]);

  // Keep the active option in view by scrolling the list only, never anything behind it.
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!list || !el) return;
    const box = list.getBoundingClientRect();
    const item = el.getBoundingClientRect();
    if (item.top < box.top + 4) list.scrollTop -= box.top + 4 - item.top;
    else if (item.bottom > box.bottom - 4) list.scrollTop += item.bottom - (box.bottom - 4);
  }, [active]);

  function choose(option: PickerOption<T> | undefined) {
    if (!option) return;
    onChange(option.value);
    close();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => Math.min(filtered.length - 1, i + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(filtered.length - 1);
        break;
      case "Enter":
        event.preventDefault();
        choose(filtered[active]);
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        close();
        break;
      case "Tab":
        // Hand focus back to the trigger first, so Tab continues from there in page order.
        triggerRef.current?.focus({ preventScroll: true });
        close(false);
        break;
    }
  }

  const activeId = filtered[active] ? `${listId}-${active}` : undefined;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={(e) => (open ? close() : openList(e.detail > 0))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            openList(false);
          }
        }}
        className={cx(
          "disabled:cursor-default",
          invalid && "ring-1 ring-danger/70",
          triggerClassName,
        )}
      >
        {children}
      </button>
      {position ? (
        <PopoverSurface
          placement={position}
          popoverRef={popoverRef}
          width={width}
          className={cx("flex flex-col", motion && openedByPointer && "motion-pop")}
          onKeyDown={onKeyDown}
        >
          {title ? (
            <div className="px-3 pt-2.5 pb-1 text-micro font-medium text-fg-3">{title}</div>
          ) : null}
          {searchable ? (
            <div className="flex items-center gap-2 border-b border-line px-3">
              <Search size={14} className="text-fg-3" aria-hidden />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder={searchPlaceholder}
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={activeId}
                aria-label={label}
                className="h-9 w-full bg-transparent text-ui text-fg outline-none placeholder:text-fg-3 focus-visible:outline-none"
              />
            </div>
          ) : null}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            tabIndex={searchable ? -1 : 0}
            aria-activedescendant={searchable ? undefined : activeId}
            className="overflow-y-auto p-1 focus-visible:outline-none"
          >
            {filtered.length === 0 ? (
              <li className="px-2 py-2 text-ui text-fg-3">No matches</li>
            ) : (
              filtered.map((option, index) => {
                const selected = option.value === value;
                return (
                  <li
                    key={option.value}
                    id={`${listId}-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={selected}
                    onPointerMove={() => setActive(index)}
                    onClick={() => choose(option)}
                    className={cx(
                      "flex h-8 items-center gap-2 rounded-[6px] px-2 text-ui text-fg",
                      index === active && "bg-selected",
                      option.separated && "mt-1 border-t border-line pt-1",
                    )}
                  >
                    {option.icon ? (
                      <span className="flex w-4 shrink-0 justify-center text-fg-2">
                        {option.icon}
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {option.hint ? (
                      <span className="shrink-0 text-meta text-fg-3">{option.hint}</span>
                    ) : null}
                    <Check
                      size={14}
                      aria-hidden
                      className={cx("shrink-0 text-fg-2", !selected && "invisible")}
                    />
                  </li>
                );
              })
            )}
          </ul>
        </PopoverSurface>
      ) : null}
    </>
  );
}
