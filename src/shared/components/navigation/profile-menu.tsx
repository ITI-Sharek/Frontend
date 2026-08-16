import { Link } from "@tanstack/react-router";
import { ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Avatar } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

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
  profileSubtitle,
  online,
  items,
  onLogout,
}: {
  displayName: string;
  avatarUrl?: string | null;
  profileSubtitle?: string;
  online?: boolean;
  items: ProfileMenuItem[];
  onLogout: () => void;
}) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu
      dir={i18n.dir()}
      open={open}
      onOpenChange={setOpen}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex min-h-10 touch-manipulation items-center gap-2 rounded-full px-1 text-sm text-foreground transition-colors duration-150 hover:bg-border/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Avatar
            src={avatarUrl}
            alt={displayName}
            size="sm"
            online={online}
            fallback={displayName.slice(0, 1)}
          />
          <span className="hidden max-w-36 flex-col items-start leading-tight sm:flex">
            <span className="max-w-36 truncate text-[14px] font-bold">
              {displayName}
            </span>
            {profileSubtitle && (
              <span className="max-w-36 truncate text-[11px] font-semibold text-muted-foreground">
                {profileSubtitle}
              </span>
            )}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-150",
              open && "rotate-180",
            )}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-48">
        {items.map((item) => (
          <DropdownMenuItem key={item.to} asChild>
              <Link
                to={item.to}
              >
                {item.label}
              </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onLogout}>
          <LogOut className="size-4" aria-hidden="true" />
          {t("auth.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
