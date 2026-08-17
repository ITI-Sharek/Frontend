import { Search, X } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group";

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  searchLabel: string;
  clearSearchLabel: string;
  searchButtonLabel: string;
  placeholder?: string;
  inputId?: string;
  className?: string;
  disabled?: boolean;
  /**
   * `hero` places the field on a dark brand band: the input becomes an opaque
   * white capsule and the submit button switches to the evidence hue so it
   * still separates from the surface behind it.
   */
  tone?: "default" | "hero";
}

/**
 * Shared search control for directory and list pages.
 *
 * The form owns submission while the page owns the draft value and the
 * resulting filter state. Keeping those responsibilities separate lets every
 * page use the same accessible field and button treatment.
 */
export function SearchField({
  value,
  onChange,
  onSearch,
  onClear,
  searchLabel,
  clearSearchLabel,
  searchButtonLabel,
  placeholder,
  inputId,
  className,
  disabled = false,
  tone = "default",
}: SearchFieldProps) {
  const generatedInputId = useId();
  const resolvedInputId = inputId ?? generatedInputId;
  const hero = tone === "hero";

  return (
    <form
      role="search"
      className={cn("flex min-w-0 w-full gap-2", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <label className="sr-only" htmlFor={resolvedInputId}>
        {searchLabel}
      </label>
      <InputGroup
        className={cn(
          "min-w-0 flex-1",
          hero &&
            "h-12 rounded-full border-transparent bg-white shadow-[var(--shadow-raised)] focus-within:ring-4 focus-within:ring-white/25 dark:bg-card",
        )}
      >
        <InputGroupInput
          id={resolvedInputId}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "min-w-0 text-sm [&::-webkit-search-cancel-button]:appearance-none",
            hero && "text-[15px] text-[#131a17] placeholder:text-[#7b8a83] dark:text-foreground",
          )}
        />
        <InputGroupAddon align="inline-start">
          <Search className="size-4" aria-hidden="true" />
        </InputGroupAddon>
        {value !== "" && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-sm"
              aria-label={clearSearchLabel}
              onClick={onClear}
              disabled={disabled}
            >
              <X className="size-4" aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      <Button
        type="submit"
        disabled={disabled}
        variant={hero ? "evidence" : "primary"}
        className={cn(hero && "h-12 rounded-full px-7")}
      >
        {searchButtonLabel}
      </Button>
    </form>
  );
}
