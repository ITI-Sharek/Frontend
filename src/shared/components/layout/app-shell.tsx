import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface AppShellNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  badge?: number;
  /** Rendered after a divider (e.g. الإعدادات). */
  secondary?: boolean;
  /** Excluded from the mobile bottom tab bar (max 5 tabs). */
  hideOnMobile?: boolean;
}

export interface AppShellPlanChip {
  planName: string;
  quotaLabel: string;
}

/**
 * Authenticated app shell (navigation-model §2): sidebar + plan-chip footer
 * on desktop (RTL: sidebar on the right), bottom tab bar on mobile. Active
 * item carries the accent edge toward the content.
 */
export function AppShell({
  nav,
  planChip,
  topBar,
  children,
}: {
  nav: AppShellNavItem[];
  planChip: AppShellPlanChip;
  topBar?: ReactNode;
  children: ReactNode;
}) {
  const primaryItems = nav.filter((item) => !item.secondary);
  const secondaryItems = nav.filter((item) => item.secondary);
  const mobileItems = primaryItems
    .filter((item) => !item.hideOnMobile)
    .slice(0, 5);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-e border-border bg-card md:flex">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <img src="/logo-1.png" alt="" className="size-8" />
          <span className="text-lg font-bold text-foreground">شارك</span>
          <span
            dir="ltr"
            className="font-mono text-[11px] tracking-[0.65px] text-muted-foreground"
          >
            Sharek
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="التنقل الرئيسي">
          {primaryItems.map((item) => (
            <SidebarLink key={item.label} item={item} />
          ))}
          {secondaryItems.length > 0 && (
            <div className="mt-auto border-t border-border pt-3">
              {secondaryItems.map((item) => (
                <SidebarLink key={item.label} item={item} />
              ))}
            </div>
          )}
        </nav>

        <div className="border-t border-border px-5 py-4">
          <p
            dir="ltr"
            className="text-end font-mono text-[13px] tracking-[0.65px] text-foreground"
          >
            {planChip.planName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {planChip.quotaLabel}
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 pb-20 md:pb-0">
        {topBar && (
          <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
            {topBar}
          </header>
        )}
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-card md:hidden"
        aria-label="التنقل السفلي"
      >
        {mobileItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 border-t-2 py-2 text-[11px]",
                item.active
                  ? "border-primary font-semibold text-foreground"
                  : "border-transparent text-muted-foreground",
              )}
            >
              <span className="relative">
                <Icon className="size-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -left-2.5 rounded-full bg-amber-500 px-1.5 py-0.5 font-mono text-[9px] leading-none text-white">
                    {item.badge}
                  </span>
                )}
              </span>
              {item.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}

function SidebarLink({ item }: { item: AppShellNavItem }) {
  const Icon = item.icon;
  return (
    <a
      href={item.href}
      aria-current={item.active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-input border-s-2 px-3 py-2.5 text-sm transition-colors",
        item.active
          ? "border-primary bg-primary/10 font-semibold text-foreground"
          : "border-transparent text-muted-foreground hover:bg-border/20 hover:text-foreground",
      )}
    >
      <Icon className="size-4.5 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[11px] text-amber-600 dark:text-amber-400">
          {item.badge}
        </span>
      )}
    </a>
  );
}
