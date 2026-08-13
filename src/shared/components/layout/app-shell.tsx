import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import type { Easing } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  useSidebarState,
} from "@/shared/hooks/use-sidebar-state";

// ─── Public Types ──────────────────────────────────────────────────────────────

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

// ─── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_BRAND: AppShellBrand = {
  title: "Sharek",
  subtitle: "Sharek",
  logoSrc: "/logo-1.png",
};

// ─── Motion variants ───────────────────────────────────────────────────────────

const easeOut: Easing = "easeOut";
const easeIn: Easing = "easeIn";

const labelVariants = {
  visible: { opacity: 1, x: 0, transition: { duration: 0.18, ease: easeOut } },
  hidden: { opacity: 0, x: 8, transition: { duration: 0.12, ease: easeIn } },
};

const tooltipVariants = {
  hidden: { opacity: 0, scale: 0.94, x: -4 },
  visible: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.12, ease: easeOut } },
};

// ─── AppShell ──────────────────────────────────────────────────────────────────

export function AppShell({
  nav,
  brand = DEFAULT_BRAND,
  planChip,
  topBar,
  navigationLabel,
  children,
}: AppShellProps) {
  const { i18n, t } = useTranslation();
  const resolvedNavigationLabel =
    navigationLabel ?? t("navigation.mainNavigation");
  const sidebar = useSidebarState();
  const {
    collapsed,
    width,
    setWidth,
    toggleCollapsed,
    startResize,
    handleResizeMove,
    stopResize,
  } = sidebar;

  const primaryItems = nav.filter((item) => !item.secondary);
  const secondaryItems = nav.filter((item) => item.secondary);
  const mobileItems = nav
    .filter((item) => !item.hideOnMobile && !item.disabled)
    .slice(0, 5);

  // Sidebar visual width: collapsed = 64px, expanded = user-preferred width
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : width;

  return (
    <div
      className="min-h-dvh bg-background text-foreground"
      dir={i18n.language.startsWith("en") ? "ltr" : "rtl"}
    >
      {/* Skip-link */}
      <a
        href="#main-content"
        className="fixed start-4 top-3 z-50 -translate-y-20 rounded-input bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform duration-200 focus-visible:translate-y-0"
      >
        {t("navigation.skipToContent")}
      </a>

      <div className="flex min-h-dvh">
        {/* ── Sidebar ── */}
        <motion.aside
          animate={{ width: sidebarWidth }}
          transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.9 }}
          className="sticky top-0 z-20 hidden h-dvh shrink-0 flex-col border-e border-border bg-card md:flex"
          style={{ minWidth: sidebarWidth, maxWidth: sidebarWidth }}
          aria-label={resolvedNavigationLabel}
        >
          {/* Brand header */}
          <SidebarBrand brand={brand} collapsed={collapsed} />

          {/* Toggle button */}
          <CollapseToggle collapsed={collapsed} onToggle={toggleCollapsed} />

          {/* Nav items */}
          <nav
            className="flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-2 py-3 scrollbar-thin"
            aria-label={resolvedNavigationLabel}
          >
            {primaryItems.map((item) => (
              <SidebarItem key={item.label} item={item} collapsed={collapsed} />
            ))}

            {secondaryItems.length > 0 && (
              <div className="mt-auto border-t border-border/60 pt-2">
                {secondaryItems.map((item) => (
                  <SidebarItem key={item.label} item={item} collapsed={collapsed} />
                ))}
              </div>
            )}
          </nav>

          {/* Plan chip — shown only when expanded */}
          {planChip && !collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border-t border-border/60 px-4 py-3"
            >
              <p
                dir="ltr"
                className="text-end font-mono text-xs font-semibold text-foreground"
              >
                {planChip.planName}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {planChip.quotaLabel}
              </p>
            </motion.div>
          )}

          {/* Resize handle — only when expanded, on the logical end edge */}
          {!collapsed && (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label={t("shell.resizeSidebar")}
              aria-valuemin={SIDEBAR_MIN_WIDTH}
              aria-valuemax={SIDEBAR_MAX_WIDTH}
              aria-valuenow={Math.round(width)}
              aria-valuetext={t("shell.sidebarWidth", { width: Math.round(width) })}
              tabIndex={0}
              onPointerDown={startResize}
              onPointerMove={handleResizeMove}
              onPointerUp={stopResize}
              onPointerCancel={stopResize}
              onKeyDown={(event) => {
                const isRtl = document.documentElement.dir === "rtl";
                const increaseKey = isRtl ? "ArrowLeft" : "ArrowRight";
                const decreaseKey = isRtl ? "ArrowRight" : "ArrowLeft";

                if (event.key === "Home") {
                  event.preventDefault();
                  setWidth(SIDEBAR_MIN_WIDTH);
                  return;
                }
                if (event.key === "End") {
                  event.preventDefault();
                  setWidth(SIDEBAR_MAX_WIDTH);
                  return;
                }
                if (event.key !== increaseKey && event.key !== decreaseKey) {
                  return;
                }

                event.preventDefault();
                setWidth(width + (event.key === increaseKey ? 16 : -16));
              }}
              className="absolute start-0 top-0 h-full w-1.5 cursor-col-resize touch-none select-none transition-colors duration-150 hover:bg-primary/25 active:bg-primary/40"
              style={{ touchAction: "none" }}
            />
          )}
        </motion.aside>

        {/* ── Main content ── */}
        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"
        >
          {topBar && (
            <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm md:px-6">
              {topBar}
            </header>
          )}
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      {mobileItems.length > 0 && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
          aria-label={resolvedNavigationLabel}
        >
          {mobileItems.map((item) => (
            <MobileItem key={item.label} item={item} />
          ))}
        </nav>
      )}
    </div>
  );
}

// ─── SidebarBrand ──────────────────────────────────────────────────────────────

function SidebarBrand({ brand, collapsed }: { brand: AppShellBrand; collapsed: boolean }) {
  const Icon = brand.icon;

  return (
    <div
      className={cn(
        "flex min-h-16 shrink-0 items-center gap-2.5 border-b border-border/60 transition-all duration-200",
        collapsed ? "justify-center px-0" : "px-4",
      )}
    >
      {/* Logo mark — always visible */}
      {brand.logoSrc ? (
        <img
          src={brand.logoSrc}
          alt={collapsed ? brand.title : ""}
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-md"
        />
      ) : Icon ? (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-input bg-primary/15 text-foreground">
          <Icon className="size-4.5" aria-hidden />
        </span>
      ) : null}

      {/* Wordmark — hidden when collapsed */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="brand-text"
            variants={labelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="min-w-0 overflow-hidden"
          >
            <span className="block truncate text-sm font-bold text-foreground leading-tight">
              {brand.title}
            </span>
            <span
              dir="ltr"
              className="block truncate text-end font-mono text-[10px] text-muted-foreground"
            >
              {brand.subtitle}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CollapseToggle ────────────────────────────────────────────────────────────

function CollapseToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  const label = collapsed ? t("shell.expandSidebar") : t("shell.collapseSidebar");
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={cn(
        "hidden md:flex w-full items-center justify-end gap-2 border-b border-border/60 px-3 py-2",
        "text-muted-foreground transition-colors duration-150 hover:bg-border/20 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        collapsed && "justify-center px-0",
      )}
    >
      {!collapsed && (
        <span className="text-[11px] font-medium">{t("shell.collapseSidebar")}</span>
      )}
      {collapsed ? (
        <ChevronLeft className="size-4 shrink-0" aria-hidden />
      ) : (
        <ChevronRight className="size-4 shrink-0" aria-hidden />
      )}
    </button>
  );
}

// ─── SidebarItem ───────────────────────────────────────────────────────────────

function SidebarItem({ item, collapsed }: { item: AppShellNavItem; collapsed: boolean }) {
  const Icon = item.icon;
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const baseClass = cn(
    "group relative flex w-full items-center gap-3 rounded-input px-2.5 py-2.5 text-start text-sm transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-card",
    collapsed && "justify-center px-0",
    item.active
      ? [
          "bg-primary/10 font-semibold text-primary",
          "before:absolute before:end-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary",
        ]
      : "text-muted-foreground hover:bg-border/30 hover:text-foreground",
    item.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground",
  );

  const iconEl = (
    <span
      className={cn(
        "shrink-0 transition-colors duration-150",
        item.active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
        item.disabled && "group-hover:text-muted-foreground",
      )}
    >
      <Icon className="size-4.5" aria-hidden />
    </span>
  );

  const badgeEl = <NavBadge count={item.badge} />;

  const statusEl = item.statusLabel && !collapsed && (
    <span className="rounded-full bg-border/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {item.statusLabel}
    </span>
  );

  // Collapsed mode: show tooltip on hover
  const tooltipEl = collapsed && showTooltip && (
    <motion.div
      ref={tooltipRef}
      role="tooltip"
      variants={tooltipVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="pointer-events-none absolute start-full top-1/2 z-50 ms-2 -translate-y-1/2 whitespace-nowrap rounded-input border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-md"
    >
      {item.label}
      {item.badge !== undefined && item.badge > 0 && (
        <span className="ms-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </motion.div>
  );

  const inner = (
    <>
      {iconEl}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="label"
            variants={labelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="min-w-0 flex-1 overflow-hidden"
          >
            <span className="block truncate">{item.label}</span>
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && statusEl}
      {!collapsed && badgeEl}
      {/* Compact badge when collapsed */}
      {collapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="absolute top-1 end-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
          {item.badge > 9 ? "9+" : item.badge}
        </span>
      )}
      <AnimatePresence>{tooltipEl}</AnimatePresence>
    </>
  );

  const handlers = collapsed
    ? {
        onMouseEnter: () => setShowTooltip(true),
        onFocus: () => setShowTooltip(true),
        onMouseLeave: () => setShowTooltip(false),
        onBlur: () => setShowTooltip(false),
      }
    : {};

  if (item.disabled) {
    return (
      <span
        aria-disabled="true"
        title={collapsed ? item.label : undefined}
        className={baseClass}
        {...handlers}
      >
        {inner}
      </span>
    );
  }

  return (
    <Link
      to={item.to}
      aria-current={item.active ? "page" : undefined}
      className={baseClass}
      {...handlers}
    >
      {inner}
    </Link>
  );
}

// ─── MobileItem ────────────────────────────────────────────────────────────────

function MobileItem({ item }: { item: AppShellNavItem }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      aria-current={item.active ? "page" : undefined}
      className={cn(
        "flex min-h-16 flex-1 touch-manipulation flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        item.active
          ? "bg-primary/10 font-semibold text-primary"
          : "text-muted-foreground hover:bg-border/25 hover:text-foreground",
      )}
    >
      <span className="relative">
        <Icon className="size-5" aria-hidden />
        <NavBadge count={item.badge} compact />
      </span>
      <span className="max-w-full truncate">{item.label}</span>
    </Link>
  );
}

// ─── NavBadge ──────────────────────────────────────────────────────────────────

function NavBadge({ count, compact = false }: { count?: number; compact?: boolean }) {
  const { t } = useTranslation();
  if (count === undefined || count <= 0) return null;
  const visible = count > 99 ? "99+" : count;

  return (
    <span
      aria-label={t("shell.badgeAriaLabel", { count })}
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 font-mono text-[10px] leading-none text-white",
        compact && "absolute -start-3 -top-2",
      )}
    >
      {visible}
    </span>
  );
}
