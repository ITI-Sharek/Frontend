import { X } from "lucide-react";
import { useState } from "react";
import type { KeyboardEvent } from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/shared/components/ui/label";

interface TagInputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  dir?: "rtl" | "ltr";
}

/**
 * Free-text tag entry: typing "," or Enter commits the current text as a
 * chip; Backspace on an empty input removes the last chip.
 */
export function TagInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  dir = "rtl",
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const tag = draft.trim();
    setDraft("");
    if (tag === "" || value.includes(tag)) return;
    onChange([...value, tag]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "," || event.key === "Enter") {
      event.preventDefault();
      commitDraft();
      return;
    }
    if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((existing) => existing !== tag));
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <Label htmlFor={id} className="w-full text-right">
          {label}
        </Label>
      )}
      <div
        className="flex min-h-[50px] w-full flex-wrap items-center gap-2 rounded-input border border-border bg-input-bg px-3 py-2 focus-within:border-primary"
        dir={dir}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
          >
            <span dir="ltr">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`إزالة ${tag}`}
              className="text-primary/70 transition-colors hover:text-primary"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={value.length === 0 ? placeholder : undefined}
          className={cn(
            "min-w-24 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-input-placeholder",
            dir === "rtl" ? "text-right" : "text-left",
          )}
        />
      </div>
    </div>
  );
}
