import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";

/** Submits into explore's existing `q` filter — no separate search backend. */
export function HeaderSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if (
        event.key === "/" &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    void navigate({
      to: ROUTES.explore,
      search: query === "" ? {} : { q: query },
    });
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="relative hidden min-w-0 flex-1 max-w-xl md:block"
    >
      <InputGroup className="min-h-10 bg-input-bg">
        <InputGroupInput
          ref={inputRef}
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t("header.search.placeholder")}
          aria-label={t("header.search.ariaLabel")}
          className="text-sm [&::-webkit-search-cancel-button]:appearance-none"
        />
        <InputGroupAddon align="inline-start">
          <Search className="size-4" aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end" className="hidden lg:flex">
          <kbd
            dir="ltr"
            className="rounded border border-border bg-surface-fog px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
          >
            /
          </kbd>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
