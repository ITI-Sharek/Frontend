import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

export interface WorkspaceNavItem {
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

interface WorkspaceShellProps {
  nav: WorkspaceNavItem[];
  /** The identity bar: brand lockup, utilities, profile menu. */
  topBar: ReactNode;
  /** Optional trailing content on the navigation ribbon (plan chip, CTA). */
  ribbonEnd?: ReactNode;
  navigationLabel?: string;
  children: ReactNode;
}

/**
 * The member workspace frame.
 *
 * Navigation moved out of a left rail and onto a ribbon directly beneath the
 * identity bar. Three reasons, in order of weight:
 *
 * 1. The rail carried four to six destinations and roughly 700px of empty
 *    column beneath them on every screen — it cost a fifth of the viewport to
 *    say very little.
 * 2. Horizontal navigation puts the page's own hero at the top-start corner,
 *    which is where an Arabic reader's eye lands first. A start-edge rail
 *    competes with the content for exactly that position.
 * 3. Content gets the full measure, so the dense two- and three-column
 *    workspace pages stop feeling cramped.
 *
 * The admin console keeps the resizable rail (`app-shell.tsx`) — it has three
 * times the destinations and is a console, not a workspace.
 */
export function WorkspaceShell({
  nav,
  topBar,
  ribbonEnd,
  navigationLabel,
  children,
}: WorkspaceShellProps) {
  const { i18n, t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const label = navigationLabel ?? t("navigation.mainNavigation");

  const primary = nav.filter((item) => !item.secondary);
  const secondary = nav.filter((item) => item.secondary);
  const mobileItems = nav.filter((item) => !item.hideOnMobile && !item.disabled);

  // A tap that navigates should also dismiss the sheet it was tapped in.
  useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, [mobileOpen]);

  return (
    <div
      className="flex min-h-dvh flex-col bg-background text-foreground"
      dir={i18n.language.startsWith("en") ? "ltr" : "rtl"}
    >
      <a
        href="#main-content"
        className="fixed start-4 top-3 z-[95] -translate-y-20 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform duration-200 focus-visible:translate-y-0"
      >
        {t("navigation.skipToContent")}
      </a>

      {topBar}

      {/* ── Navigation ribbon ── */}
      <div className="sticky top-[64px] z-30 border-b border-border bg-card/92 backdrop-blur-md">
        <div className="mx-auto flex h-[52px] w-full max-w-[1240px] items-center gap-2 px-4 md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={label}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-surface-fog hover:text-foreground md:hidden"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>

          <nav
            aria-label={label}
            className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {primary.map((item) => (
              <RibbonItem key={item.label} item={item} />
            ))}
            {secondary.length > 0 && (
              <>
                <span
                  aria-hidden
                  className="mx-1 h-5 w-px shrink-0 bg-border"
                />
                {secondary.map((item) => (
                  <RibbonItem key={item.label} item={item} />
                ))}
              </>
            )}
          </nav>

          <div className="ms-auto flex shrink-0 items-center gap-2">
            {ribbonEnd}
          </div>
        </div>

        {/* Mobile sheet */}
        {mobileOpen && (
          <nav
            aria-label={label}
            className="grid gap-1 border-t border-border bg-card px-3 py-3 md:hidden"
          >
            {mobileItems.map((item) => (
              <RibbonItem key={item.label} item={item} block />
            ))}
          </nav>
        )}
      </div>

      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 pb-16">
        {children}
      </main>
    </div>
  );
}

function RibbonItem({
  item,
  block = false,
}: {
  item: WorkspaceNavItem;
  block?: boolean;
}) {
  const Icon = item.icon;

  /*
   * The active destination is a filled indigo pill. On a horizontal ribbon a
   * pill reads as "you are here" far faster than an underline does, and it
   * survives being scrolled half out of view.
   */
  const className = cn(
    "group relative inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[13.5px] font-semibold",
    "transition-[background-color,color] duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
    block && "w-full justify-start",
    item.active
      ? "bg-primary text-primary-foreground shadow-[var(--shadow-primary)]"
      : "text-muted-foreground hover:bg-surface-fog hover:text-foreground",
    item.disabled && "pointer-events-none opacity-45",
  );

  const inner = (
    <>
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="whitespace-nowrap">{item.label}</span>
      {item.statusLabel ? (
        <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {item.statusLabel}
        </span>
      ) : null}
      {item.badge !== undefined && item.badge > 0 ? (
        <span
          className={cn(
            "tnum inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
            item.active
              ? "bg-white/22 text-primary-foreground"
              : "bg-review-amber text-white",
          )}
        >
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      ) : null}
    </>
  );

  if (item.disabled) {
    return (
      <span aria-disabled="true" className={className}>
        {inner}
      </span>
    );
  }

  return (
    <Link
      to={item.to}
      aria-current={item.active ? "page" : undefined}
      className={className}
    >
      {inner}
    </Link>
  );
}
