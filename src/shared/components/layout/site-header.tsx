import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { LanguageSwitcher } from "@/shared/components/navigation/language-switcher";
import { ProfileMenu } from "@/shared/components/navigation/profile-menu";
import type { ProfileMenuItem } from "@/shared/components/navigation/profile-menu";

export interface SiteHeaderNavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface SiteHeaderUser {
  displayName: string;
  avatarUrl: string | null;
  profileSubtitle?: string;
  online?: boolean;
  menuItems: ProfileMenuItem[];
}

export interface SiteHeaderBrand {
  title?: string;
  subtitle?: string;
  logoSrc?: string;
  to?: string;
}

interface SiteHeaderProps {
  navItems?: SiteHeaderNavItem[];
  navLabel?: string;
  brand?: SiteHeaderBrand;
  user?: SiteHeaderUser | null;
  onLogout?: () => void;
  utilityActions?: ReactNode;
  skipToContentLabel?: string;
  showSkipLink?: boolean;
}

export function SiteHeader({
  navItems = [],
  navLabel,
  brand,
  user,
  onLogout,
  utilityActions,
  skipToContentLabel,
  showSkipLink = true,
}: SiteHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedBrand = {
    title: t("brand.title"),
    subtitle: t("brand.subtitle"),
    logoSrc: "/logo-1.png",
    to: ROUTES.landing,
    ...brand,
  };
  const brandContent = (
    <>
      {resolvedBrand.logoSrc && (
        <img
          src={resolvedBrand.logoSrc}
          alt=""
          width={40}
          height={40}
          className="size-10 object-cover object-center"
        />
      )}
      <span className="flex flex-col items-end gap-0.5 leading-none">
        <span className="text-[17px] font-extrabold text-primary">
          {resolvedBrand.title}
        </span>
        <span className="font-wordmark text-[11px] font-bold tracking-[0.02em] text-primary">
          {resolvedBrand.subtitle}
        </span>
      </span>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      {showSkipLink && (
        <a
          href="#main-content"
          className="sr-only fixed start-4 top-4 z-50 rounded-input bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground focus:not-sr-only"
        >
          {skipToContentLabel ?? t("navigation.skipToContent")}
        </a>
      )}
      <div className="mx-auto flex h-[60px] w-full max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6">
        {resolvedBrand.to ? (
          <Link
            to={resolvedBrand.to}
            dir="ltr"
            className="flex shrink-0 items-center gap-2.5"
          >
            {brandContent}
          </Link>
        ) : (
          <a href={ROUTES.landing} dir="ltr" className="flex shrink-0 items-center gap-2.5">
            {brandContent}
          </a>
        )}

        {navItems.length > 0 && (
          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-7 md:flex"
            aria-label={navLabel ?? t("navigation.mainNavigation")}
          >
            {navItems.map((item) => (
              <HeaderNavLink key={`${item.href}-${item.label}`} item={item} />
            ))}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <LanguageSwitcher compact />
          <button
            type="button"
            aria-label={t("theme.toggle")}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-fog hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </button>
          {utilityActions}
          {user && onLogout ? (
            <ProfileMenu
              displayName={user.displayName}
              avatarUrl={user.avatarUrl}
              profileSubtitle={user.profileSubtitle}
              online={user.online}
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
                <Link to={ROUTES.login}>{t("landing.headerLogin")}</Link>
              </Button>
              <Button asChild variant="primary" size="default">
                <Link to={ROUTES.register}>{t("landing.headerCreateAccount")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function HeaderNavLink({ item }: { item: SiteHeaderNavItem }) {
  const className =
    "flex min-h-10 items-center whitespace-nowrap text-[15px] font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-social focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

  if (item.href.startsWith("#") || item.href.startsWith("http")) {
    return (
      <a
        href={item.href}
        aria-current={item.active ? "page" : undefined}
        className={className}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link
      to={item.href}
      aria-current={item.active ? "page" : undefined}
      className={className}
    >
      {item.label}
    </Link>
  );
}

export function HeaderIconLink({
  to,
  label,
  children,
}: {
  to: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-fog hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  );
}
