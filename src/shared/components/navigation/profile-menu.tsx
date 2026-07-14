import { Link } from "@tanstack/react-router";
import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/shared/components/ui/avatar";

export interface ProfileMenuItem {
  label: string;
  to: string;
}

/**
 * Authenticated identity control for public headers (e.g. the marketing
 * home page): avatar + name, opens a dropdown with role-aware links and
 * logout. Feature-agnostic — auth/profile data is injected by the route.
 */
export function ProfileMenu({
  displayName,
  avatarUrl,
  items,
  onLogout,
}: {
  displayName: string;
  avatarUrl?: string | null;
  items: ProfileMenuItem[];
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full text-sm text-foreground transition-colors hover:opacity-80"
      >
        <Avatar
          src={avatarUrl}
          alt={displayName}
          size="sm"
          fallback={displayName.slice(0, 1)}
        />
        <span className="hidden max-w-32 truncate sm:inline">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 z-50 mt-2 w-48 rounded-input border border-border bg-card p-1 shadow-lg"
        >
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-border/20"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-start text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-4" />
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}
