import { Link } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

export interface AppShellNavItem {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  active?: boolean;
  badge?: number;
  secondary?: boolean;
  hideOnMobile?: boolean;
  disabled?: boolean;
  statusLabel?: string;
}

export interface AppShellPlanChip {
  planName: string;
  quotaLabel: string;
}

export interface AppShellBrand {
  title: string;
  subtitle: string;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  logoSrc?: string;
}

interface AppShellProps {
  nav: AppShellNavItem[];
  brand?: AppShellBrand;
  planChip?: AppShellPlanChip;
  topBar?: ReactNode;
  navigationLabel?: string;
  children: ReactNode;
}

const DEFAULT_BRAND: AppShellBrand = {
  title: "شارك",
  subtitle: "Sharek",
  logoSrc: "/logo-1.png",
};

export function AppShell({
  nav,
  brand = DEFAULT_BRAND,
  planChip,
  topBar,
  navigationLabel,
  children,
}: AppShellProps) {
  const { t } = useTranslation();
  const navLabel = navigationLabel ?? t("navigation.mainNavigation");
  const primaryItems = nav.filter((item) => !item.secondary);
  const secondaryItems = nav.filter((item) => item.secondary);
  const mobileItems = nav
    .filter((item) => !item.hideOnMobile && !item.disabled)
    .slice(0, 5);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main-content"
        className="fixed start-4 top-3 z-50 -translate-y-20 rounded-input bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform duration-200 focus-visible:translate-y-0"
      >
        {t("shell.skipToContent")}
      </a>

      <div className="flex min-h-dvh">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-e border-border bg-card md:flex">
          <Brand brand={brand} />

          <nav
            className="flex flex-1 flex-col gap-1.5 px-3 py-4"
            aria-label={navLabel}
          >
            {primaryItems.map((item) => (
              <SidebarItem key={item.label} item={item} />
            ))}

            {secondaryItems.length > 0 && (
              <div className="mt-auto border-t border-border pt-3">
                {secondaryItems.map((item) => (
                  <SidebarItem key={item.label} item={item} />
                ))}
              </div>
            )}
          </nav>

          {planChip && (
            <div className="border-t border-border px-5 py-4">
              <p
                dir="ltr"
                className="text-end font-mono text-xs font-medium text-foreground"
              >
                {planChip.planName}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {planChip.quotaLabel}
              </p>
            </div>
          )}
        </aside>

        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"
        >
          {topBar && (
            <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-border bg-background px-4 py-3 md:px-6">
              {topBar}
            </header>
          )}
          {children}
        </main>
      </div>

      {mobileItems.length > 0 && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
          aria-label={navLabel}
        >
          {mobileItems.map((item) => (
            <MobileItem key={item.label} item={item} />
          ))}
        </nav>
      )}
    </div>
  );
}

function Brand({ brand }: { brand: AppShellBrand }) {
  const Icon = brand.icon;

  return (
    <div className="flex min-h-16 items-center gap-3 border-b border-border px-5 py-3">
      {brand.logoSrc && (
        <img
          src={brand.logoSrc}
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0"
        />
      )}
      {Icon && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-input bg-primary/15 text-foreground">
          <Icon className="size-5" aria-hidden={true} />
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-base font-bold text-foreground">
          {brand.title}
        </span>
        <span
          dir="ltr"
          className="block truncate text-end font-mono text-[11px] text-muted-foreground"
        >
          {brand.subtitle}
        </span>
      </span>
    </div>
  );
}

function SidebarItem({ item }: { item: AppShellNavItem }) {
  const Icon = item.icon;
  const className = cn(
    "flex min-h-11 w-full items-center gap-3 rounded-input px-3 py-2.5 text-start text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
    item.active
      ? "bg-primary font-semibold text-primary-foreground"
      : "text-muted-foreground hover:bg-border/35 hover:text-foreground",
    item.disabled && "cursor-not-allowed opacity-55 hover:bg-transparent",
  );

  const content = (
    <>
      <Icon className="size-4.5 shrink-0" aria-hidden={true} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.statusLabel && (
        <span className="rounded-full bg-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
          {item.statusLabel}
        </span>
      )}
      <NavBadge count={item.badge} />
    </>
  );

  if (item.disabled) {
    return (
      <span aria-disabled="true" className={className}>
        {content}
      </span>
    );
  }

  return (
    <Link
      to={item.to}
      aria-current={item.active ? "page" : undefined}
      className={className}
    >
      {content}
    </Link>
  );
}

function MobileItem({ item }: { item: AppShellNavItem }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      aria-current={item.active ? "page" : undefined}
      className={cn(
        "flex min-h-16 flex-1 touch-manipulation flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        item.active
          ? "bg-primary/15 font-semibold text-foreground"
          : "text-muted-foreground hover:bg-border/25 hover:text-foreground",
      )}
    >
      <span className="relative">
        <Icon className="size-5" aria-hidden={true} />
        <NavBadge count={item.badge} compact />
      </span>
      <span className="max-w-full truncate">{item.label}</span>
    </Link>
  );
}

function NavBadge({ count, compact = false }: { count?: number; compact?: boolean }) {
  const { t } = useTranslation();
  if (count === undefined || count <= 0) return null;

  const visibleCount = count > 99 ? "99+" : count;

  return (
    <span
      aria-label={t("shell.badgeAriaLabel_other", { count })}
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 font-mono text-[10px] leading-none text-white",
        compact && "absolute -start-3 -top-2",
      )}
    >
      {visibleCount}
    </span>
  );
}
