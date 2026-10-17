"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { Kbd } from "@/components/ui/kbd";
import { useWorkspace } from "./workspace-context";

export function Composer({
  requestId,
  placeholder = "Leave a comment…",
  className,
  onSubmitted,
}: {
  requestId: string;
  placeholder?: string;
  className?: string;
  /** Called after a comment is posted, e.g. to scroll it into view. */
  onSubmitted?: () => void;
}) {
  const api = useWorkspace();
  const [body, setBody] = useState("");
  const id = useId();
  const empty = !body.trim();

  function submit() {
    if (empty) return;
    api.comment(requestId, body.trim());
    setBody("");
    onSubmitted?.();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={cx(
        "rounded-panel border border-line bg-panel transition-colors duration-100 focus-within:border-line-strong",
        className,
      )}
    >
      <label htmlFor={id} className="sr-only">
        Comment
      </label>
      <textarea
        id={id}
        rows={1}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className="block max-h-[200px] min-h-[40px] w-full resize-none bg-transparent px-3 pt-2.5 text-ui leading-5 text-fg [field-sizing:content] outline-none placeholder:text-fg-3 focus-visible:outline-none"
      />
      <div className="flex items-center justify-between gap-2 px-2 pt-1 pb-2">
        <span className="hidden items-center gap-1 pl-1 text-micro text-fg-3 sm:flex">
          <Kbd>⌘</Kbd>
          <Kbd>↵</Kbd>
          <span className="ml-0.5">to send</span>
        </span>
        <Button type="submit" variant={empty ? "secondary" : "primary"} disabled={empty} className="ml-auto">
          Comment
        </Button>
      </div>
    </form>
  );
}
