"use client";

import { Plus, X } from "lucide-react";
import { useId, useState, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { normaliseSkill } from "@/lib/domain/format";

export function TagInput({
  label,
  description,
  values,
  onChange,
  suggestions = [],
  placeholder,
  max = 30,
}: {
  label: string;
  description?: string;
  values: string[];
  onChange: (values: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  max?: number;
}) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const existing = new Set(values.map(normaliseSkill));

  const add = (raw: string) => {
    const value = raw.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!value || existing.has(normaliseSkill(value)) || values.length >= max) return;
    onChange([...values, value]);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  const available = suggestions.filter((suggestion) => !existing.has(normaliseSkill(suggestion))).slice(0, 10);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-input bg-input/20 p-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40">
        {values.map((value) => (
          <span key={value} className="inline-flex h-7 items-center gap-1 rounded-md bg-secondary pr-1 pl-2 text-sm">
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((item) => item !== value))}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${value}`}
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <Input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          placeholder={values.length ? "Add more…" : placeholder}
          className="h-7 min-w-32 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      </div>
      {available.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label={`Suggested ${label.toLowerCase()}`}>
          {available.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => add(suggestion)}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-dashed border-border px-2 text-xs text-muted-foreground hover:border-brand/50 hover:text-foreground"
            >
              <Plus aria-hidden className="size-3" /> {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
