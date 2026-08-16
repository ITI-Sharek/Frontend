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
}: SearchFieldProps) {
  const generatedInputId = useId();
  const resolvedInputId = inputId ?? generatedInputId;

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
      <InputGroup className="min-w-0 flex-1">
        <InputGroupInput
          id={resolvedInputId}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="min-w-0 text-sm [&::-webkit-search-cancel-button]:appearance-none"
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
      <Button type="submit" disabled={disabled}>
        {searchButtonLabel}
      </Button>
    </form>
  );
}
