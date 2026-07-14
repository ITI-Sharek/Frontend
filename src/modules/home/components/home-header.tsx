import { Moon, Sun } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { ProfileMenu } from "@/shared/components/navigation/profile-menu";
import type { ProfileMenuItem } from "@/shared/components/navigation/profile-menu";

const NAV_LINKS = [
  { href: "#how-it-works", label: "كيف تعمل" },
  { href: "#features", label: "المزايا" },
  { href: "#roles", label: "الأدوار" },
  { href: "#plans", label: "الخطط" },
];

export interface HomeHeaderAuthUser {
  displayName: string;
  avatarUrl: string | null;
  menuItems: ProfileMenuItem[];
}

export function HomeHeader({
  user,
  onLogout,
}: {
  /** Injected by the route. Omitted/undefined renders the signed-out CTAs. */
  user?: HomeHeaderAuthUser | null;
  onLogout?: () => void;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to={ROUTES.home} className="flex items-center gap-2.5">
          <img
            src="/logo-1.png"
            alt=""
            width={44}
            height={26}
            className="h-7 w-auto"
          />
          <span
            className="font-wordmark text-2xl font-bold tracking-[-0.32px] text-primary"
            dir="ltr"
          >
            Sharek
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="أقسام الصفحة">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="تبديل المظهر"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>
          {user && onLogout ? (
            <ProfileMenu
              displayName={user.displayName}
              avatarUrl={user.avatarUrl}
              items={user.menuItems}
              onLogout={onLogout}
            />
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link to={ROUTES.login}>تسجيل دخول</Link>
              </Button>
              <Button asChild size="sm">
                <Link to={ROUTES.register}>إنشاء حساب</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
