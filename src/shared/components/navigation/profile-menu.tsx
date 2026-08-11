import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { dropdownVariants } from "@/shared/lib/motion";
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

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-10 touch-manipulation items-center gap-2 rounded-full px-1 text-sm text-foreground transition-colors duration-150 hover:bg-border/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
          aria-hidden="true"
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ originY: 0 }}
            className="absolute end-0 z-50 mt-2 w-48 rounded-input border border-border bg-card p-1 shadow-lg"
          >
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block min-h-10 rounded-md px-3 py-2 text-sm text-foreground transition-colors duration-150 hover:bg-border/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
              className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 py-2 text-start text-sm text-destructive transition-colors duration-150 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
            >
              <LogOut className="size-4" aria-hidden="true" />
              تسجيل الخروج
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
