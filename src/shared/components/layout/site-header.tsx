import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
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
  /**
   * Overrides the centred marketing container. The workspace passes a
   * full-bleed container so the brand lockup sits directly above the sidebar
   * rail instead of floating inboard of it.
   */
  containerClassName?: string;
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
  containerClassName,
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
  /*
   * The lockup pairs the mark with a two-line wordmark. The Arabic name sits
   * on the baseline of the Latin one rather than beneath it as a caption —
   * both scripts are the product's name, not a translation of it.
   */
  const brandContent = (
    <>
      {resolvedBrand.logoSrc && (
        <span className="relative flex size-10 items-center justify-center rounded-2xl bg-primary-soft transition-transform duration-300 ease-out group-hover/brand:scale-105">
          <img
            src={resolvedBrand.logoSrc}
            alt=""
            width={40}
            height={40}
            className="size-8 object-contain object-center"
          />
        </span>
      )}
      <span className="flex flex-col gap-px leading-none">
        <span className="text-[19px] font-extrabold tracking-tight text-primary">
          {resolvedBrand.title}
        </span>
        <span className="text-[11px] font-bold tracking-[0.04em] text-evidence-teal">
          {resolvedBrand.subtitle}
        </span>
      </span>
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-header-bg backdrop-blur-md supports-[backdrop-filter]:bg-header-bg">
      {showSkipLink && (
        <a
          href="#main-content"
          className="sr-only fixed start-4 top-4 z-50 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground focus:not-sr-only"
        >
          {skipToContentLabel ?? t("navigation.skipToContent")}
        </a>
      )}
      <div
        className={cn(
          "mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6",
          containerClassName,
        )}
      >
        {resolvedBrand.to ? (
          <Link
            to={resolvedBrand.to}
            dir="ltr"
            className="group/brand flex shrink-0 items-center gap-2.5"
          >
            {brandContent}
          </Link>
        ) : (
          <a
            href={ROUTES.landing}
            dir="ltr"
            className="group/brand flex shrink-0 items-center gap-2.5"
          >
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
            className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/35 hover:bg-surface-fog hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
  /*
   * The active page is marked with a short rule under the label rather than a
   * pill, so the header keeps a single horizontal line of type.
   */
  const className = cn(
    "relative flex min-h-10 items-center whitespace-nowrap text-[15px] font-semibold transition-colors",
    "after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:origin-center after:rounded-full after:bg-primary after:transition-transform after:duration-200 after:ease-out",
    "focus-visible:rounded-social focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    item.active
      ? "text-foreground after:scale-x-100"
      : "text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100",
  );

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
      className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/35 hover:bg-surface-fog hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  );
}
