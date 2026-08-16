import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Lock, Moon, RefreshCw, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/shared/components/navigation/language-switcher";

export const Route = createFileRoute("/_authLayout")({
  component: AuthLayout,
});

export function AuthLayout() {
  const { t, i18n } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const routerState = useRouterState();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isRtl = i18n.language.startsWith("ar");
  const pathname = routerState.location.pathname;
  const displayUrl = pathname.includes("register")
    ? "sharek.app/register"
    : pathname.includes("forgot-password")
      ? "sharek.app/forgot-password"
      : "sharek.app/auth";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-2 sm:p-4 lg:p-6 transition-colors">
      {/* Outer Browser Window Frame */}
      <div className="relative mx-auto flex w-full max-w-5xl xl:max-w-6xl h-[calc(100vh-1.5rem)] sm:h-[calc(100vh-2.5rem)] min-h-[640px] max-h-[920px] flex-col overflow-hidden rounded-2xl md:rounded-3xl border border-border/80 bg-card shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.35)] transition-all">
        {/* Browser Top Bar / Window Controls */}
        <div
          dir="ltr"
          className="flex h-11 shrink-0 items-center justify-between border-b border-border/70 bg-surface-muted/40 px-4 sm:px-5"
        >
          {/* Window action dots and navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff5f56] transition-opacity hover:opacity-80" />
              <span className="size-2.5 rounded-full bg-[#ffbd2e] transition-opacity hover:opacity-80" />
              <span className="size-2.5 rounded-full bg-[#27c93f] transition-opacity hover:opacity-80" />
            </div>

            <div className="hidden sm:flex items-center gap-1 text-muted-foreground/70 ms-2">
              <span className="flex size-5 items-center justify-center rounded-md hover:bg-surface-muted hover:text-foreground">
                <ChevronLeft className="size-3" />
              </span>
              <span className="flex size-5 items-center justify-center rounded-md hover:bg-surface-muted hover:text-foreground">
                <ChevronRight className="size-3" />
              </span>
              <span className="flex size-5 items-center justify-center rounded-md hover:bg-surface-muted hover:text-foreground">
                <RefreshCw className="size-2.5" />
              </span>
            </div>
          </div>

          {/* Center Address Pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-input-bg/90 px-3.5 py-0.5 text-[11px] font-mono text-muted-foreground shadow-xs">
            <Lock className="size-2.5 text-primary" aria-hidden="true" />
            <span className="select-all">{displayUrl}</span>
          </div>

          {/* Right utility buttons: Theme & Language */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={t("theme.toggle")}
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="size-3.5" aria-hidden="true" />
              ) : (
                <Moon className="size-3.5" aria-hidden="true" />
              )}
            </button>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Split Content Area: Wider Form (7 cols) & Sleek Artwork (5 cols) */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
          {/* Form Column - Increased Width (col-span-7) */}
          <main
            id="main-content"
            className="flex h-full flex-col justify-between overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-6 sm:p-8 lg:p-10 lg:col-span-7 xl:col-span-7"
          >
            {/* Top Brand Link */}
            <div className="flex items-center justify-between pb-2 shrink-0">
              <Link to="/" className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <img
                  src="/logo-1.png"
                  alt="Sharek Logo"
                  width={30}
                  height={30}
                  className="size-7.5 object-contain"
                />
                <span className="font-wordmark text-xl font-bold tracking-tight text-primary" dir="ltr">
                  Sharek
                </span>
              </Link>
            </div>

            {/* Form Slot */}
            <div className="my-auto flex w-full max-w-lg mx-auto flex-col gap-3 py-2">
              <Outlet />
            </div>

            {/* Footer Notice */}
            <div className="pt-2 text-center text-[11px] text-muted-foreground/75 shrink-0">
              <p dir="ltr" className="font-mono">
                © 2026 Sharek Platform. All rights reserved.
              </p>
            </div>
          </main>

          {/* Visual Artwork & Testimonial Column - Reduced Width (col-span-5) */}
          <aside className="hidden h-full flex-col p-3 sm:p-4 lg:col-span-5 xl:col-span-5 lg:flex">
            <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl md:rounded-3xl border border-border/40 bg-surface-muted shadow-inner">
              {/* Theme-Adaptive Background Visual */}
              <img
                src="/light_Preview.png"
                alt="Sharek Platform Preview"
                className="absolute inset-0 h-full w-full object-cover object-center dark:hidden"
              />
              <img
                src="/dark_Preview.png"
                alt="Sharek Platform Preview"
                className="absolute inset-0 h-full w-full object-cover object-center hidden dark:block"
              />

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Decorative top spacer */}
              <div className="relative z-10 p-4" />

              {/* Bottom Testimonial Overlay Card */}
              <div className="relative z-10 m-4 rounded-2xl border border-white/15 bg-black/45 p-4 backdrop-blur-md shadow-2xl text-white">
                <blockquote className={`text-xs sm:text-sm font-medium leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>
                  {isRtl
                    ? "“انتقلنا من تشتت الجهود إلى التنفيذ المركز والمثمر؛ منصة شارك وفّرت لنا البيئة المثالية لربط المساهمين الموهوبين بأفضل المشاريع مفتوحة المصدر.”"
                    : "“We went from spinning wheels to focused execution, and honestly, this platform has 4x-ed our productivity across the board.”"}
                </blockquote>

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                  <div className={isRtl ? "text-right" : "text-left"}>
                    <p className="text-xs font-bold text-white">
                      {isRtl ? "سارة المنصوري" : "Jasmin Koller"}
                    </p>
                    <p className="text-[11px] text-white/70">
                      {isRtl ? "مسؤولة العمليات في Launch Collective" : "Operations Lead at Launch Collective"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-white/80" dir="ltr">
                    <button
                      type="button"
                      aria-label="Previous quote"
                      className="flex size-6 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                    >
                      <ChevronLeft className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next quote"
                      className="flex size-6 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                    >
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
