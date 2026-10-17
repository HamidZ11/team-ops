"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { shortDate } from "@/domain/format";
import type { Priority, Request } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { DatePicker, useCalendarPicker } from "@/components/ui/date-picker";
import { Modal } from "@/components/ui/modal";
import { Picker } from "@/components/ui/picker";
import { PRIORITY_META, PriorityIcon, TypeIcon } from "./glyphs";
import { PriorityPicker } from "./pickers";
import { useWorkspace } from "./workspace-context";

interface Errors {
  title?: string;
  typeId?: string;
}

export function NewRequestDialog({
  open,
  onClose,
  onCreated,
  instant,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (request: Request) => void;
  instant?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title="New request" instant={instant}>
      {open ? <NewRequestForm onClose={onClose} onCreated={onCreated} /> : null}
    </Modal>
  );
}

function NewRequestForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (request: Request) => void;
}) {
  const api = useWorkspace();
  const calendar = useCalendarPicker();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [typeId, setTypeId] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>("none");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const id = useId();
  const type = typeId ? api.type(typeId) : undefined;

  function submit() {
    const next: Errors = {};
    if (title.trim().length < 4) next.title = "Give it a title of at least 4 characters.";
    if (!typeId) next.typeId = "Choose what kind of request this is.";
    setErrors(next);
    if (next.title || next.typeId || !typeId) return;
    const request = api.create({
      title: title.trim(),
      description: description.trim(),
      typeId,
      priority,
      dueDate: dueDate || null,
    });
    onCreated(request);
  }

  const control =
    "flex h-8 w-full min-w-0 items-center gap-2 rounded-control border border-line bg-canvas px-2.5 text-left text-ui text-fg hover:border-line-strong";

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          submit();
        }
      }}
    >
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-title`} className="text-meta font-medium text-fg-2">
            Title
          </label>
          <input
            id={`${id}-title`}
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Access to the finance shared drive"
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? `${id}-title-error` : undefined}
            className="field h-9"
          />
          {errors.title ? (
            <p id={`${id}-title-error`} className="text-meta text-danger-fg">
              {errors.title}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-description`} className="text-meta font-medium text-fg-2">
            Details <span className="font-normal text-fg-3">(optional)</span>
          </label>
          <textarea
            id={`${id}-description`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What do you need, by when, and why?"
            className="field min-h-[96px]"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-meta font-medium text-fg-2">Type</span>
            <Picker
              label="Request type"
              value={typeId}
              onChange={(v) => {
                setTypeId(v);
                setErrors((e) => ({ ...e, typeId: undefined }));
              }}
              options={api.types.map((t) => ({
                value: t.id,
                label: t.name,
                icon: <TypeIcon icon={t.icon} />,
              }))}
              invalid={Boolean(errors.typeId)}
              triggerClassName={control}
            >
              {type ? <TypeIcon icon={type.icon} className="text-fg-2" /> : null}
              <span className={cx("truncate", !type && "text-fg-3")}>{type?.name ?? "Choose type"}</span>
              <ChevronDown size={12} aria-hidden className="ml-auto text-fg-3" />
            </Picker>
            {errors.typeId ? <p className="text-meta text-danger-fg">{errors.typeId}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-meta font-medium text-fg-2">Priority</span>
            <PriorityPicker value={priority} onChange={setPriority} triggerClassName={control}>
              <PriorityIcon priority={priority} />
              <span className={cx("truncate", priority === "none" && "text-fg-3")}>
                {PRIORITY_META[priority].label}
              </span>
              <ChevronDown size={12} aria-hidden className="ml-auto text-fg-3" />
            </PriorityPicker>
          </div>
          {calendar ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-meta font-medium text-fg-2">Needed by</span>
              <DatePicker
                title="Needed by"
                label={dueDate ? `Needed by ${shortDate(dueDate, api.today)}. Change date` : "Needed by: choose a date"}
                value={dueDate || null}
                today={api.today}
                min={api.today}
                clearable
                align="end"
                onChange={(date) => setDueDate(date ?? "")}
                triggerClassName={control}
              >
                <CalendarDays size={14} aria-hidden className="text-fg-2" />
                <span className={cx("truncate tabular-nums", !dueDate && "text-fg-3")}>
                  {dueDate ? shortDate(dueDate, api.today) : "Choose date"}
                </span>
                <ChevronDown size={12} aria-hidden className="ml-auto text-fg-3" />
              </DatePicker>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-due`} className="text-meta font-medium text-fg-2">
                Needed by
              </label>
              <input
                id={`${id}-due`}
                type="date"
                value={dueDate}
                min={api.today}
                onChange={(e) => setDueDate(e.target.value)}
                className="field h-8 py-0"
              />
            </div>
          )}
        </div>
        <p className="text-meta text-fg-3">
          It goes to the team&apos;s inbox for triage. You&apos;ll see who owns it once it&apos;s accepted.
        </p>
      </div>
      <div className="safe-bottom flex items-center justify-end gap-2 border-t border-line px-4 py-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Submit request
        </Button>
      </div>
    </form>
  );
}
