import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { ROUTES } from "@/config/routes.config";

/** Submits into explore's existing `q` filter — no separate search backend. */
export function HeaderSearch() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

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
      className="relative hidden min-w-0 flex-1 max-w-sm md:block"
    >
      <Search
        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="ابحث عن مشاريع..."
        aria-label="بحث عن مشاريع"
        className="min-h-10 w-full rounded-input border border-border bg-input-bg ps-9 pe-3 text-sm text-foreground outline-none placeholder:text-input-placeholder focus-visible:ring-2 focus-visible:ring-primary"
      />
    </form>
  );
}
