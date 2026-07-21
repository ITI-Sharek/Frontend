import { Moon, Sun } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { ProfileMenu } from "@/shared/components/navigation/profile-menu";
import type { ProfileMenuItem } from "@/shared/components/navigation/profile-menu";

const NAV_LINKS = [
  { href: "#journey", label: "رحلة المساهمة" },
  { href: "#evidence", label: "سجل الأدلة" },
  { href: "#for-who", label: "لمن صُممت" },
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-header-bg">
      <a
        href="#main-content"
        className="sr-only fixed start-4 top-4 z-50 rounded-input bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground focus:not-sr-only"
      >
        تجاوز إلى المحتوى الرئيسي
      </a>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to={ROUTES.landing} className="flex items-center gap-2.5">
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
              className="flex min-h-11 items-center text-sm text-muted-foreground underline-offset-8 transition-colors hover:text-foreground hover:underline focus-visible:rounded-social focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
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
            className="flex size-11 items-center justify-center rounded-input text-muted-foreground transition-colors hover:bg-border/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
                size="default"
                className="hidden sm:inline-flex"
              >
                <Link to={ROUTES.login}>تسجيل دخول</Link>
              </Button>
              <Button asChild variant="primary" size="default">
                <Link to={ROUTES.register}>إنشاء حساب</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
