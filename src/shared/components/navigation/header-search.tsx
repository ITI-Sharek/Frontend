import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";

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
      <Search
        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t("header.search.placeholder")}
        aria-label={t("header.search.ariaLabel")}
        className="min-h-10 w-full rounded-input border border-border bg-input-bg ps-9 pe-14 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-input-placeholder focus:border-primary/50 focus:ring-3 focus:ring-primary/10"
      />
      <kbd
        dir="ltr"
        className="pointer-events-none absolute end-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-surface-fog px-2 py-0.5 font-mono text-[10px] text-muted-foreground lg:block"
      >
        /
      </kbd>
    </form>
  );
}
