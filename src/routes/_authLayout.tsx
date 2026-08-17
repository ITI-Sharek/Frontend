import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
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
  /* The headerbar's subtitle names the view, the way a GTK app titles itself. */
  const windowSubtitleKey = pathname.includes("register")
    ? "pageTitles.register"
    : pathname.includes("forgot-password")
      ? "pageTitles.forgotPassword"
      : "pageTitles.login";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-2 sm:p-4 lg:p-6 transition-colors">
      {/*
       * The auth screen is framed as a desktop application window — but a
       * Linux one. The macOS traffic lights and browser address bar were the
       * wrong flag for a platform whose whole subject is open-source work, so
       * the frame is now a GTK4 / libadwaita HeaderBar: a centred title stack,
       * flat circular controls in the end box, and a hairline under a
       * slightly-raised bar. Corner radius drops from macOS's generous curve
       * to GNOME's tighter 14px.
       */}
      <div className="relative mx-auto flex h-[calc(100vh-1.5rem)] max-h-[920px] min-h-[640px] w-full max-w-5xl flex-col overflow-hidden rounded-[14px] border border-border bg-card shadow-[var(--shadow-overlay)] transition-all sm:h-[calc(100vh-2.5rem)] xl:max-w-6xl">
        <div className="flex h-[46px] shrink-0 items-center gap-2 border-b border-border bg-surface-fog px-2.5">
          {/* Start box — the app identity, as a GNOME headerbar carries it. */}
          <div className="flex w-28 shrink-0 items-center gap-2">
            <img
              src="/logo-1.png"
              alt=""
              width={20}
              height={20}
              className="size-5 object-contain"
            />
          </div>

          {/* Title stack — libadwaita's signature: name over current view. */}
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center leading-none">
            <span className="truncate text-[13px] font-bold text-foreground">
              {t("brand.title")}
            </span>
            <span className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {t(windowSubtitleKey)}
            </span>
          </div>

          {/* End box — real controls only; nothing here is decorative. */}
          <div className="flex w-28 shrink-0 items-center justify-end gap-1">
            <button
              type="button"
              aria-label={t("theme.toggle")}
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="size-3.5" aria-hidden="true" />
              ) : (
                <Moon className="size-3.5" aria-hidden="true" />
              )}
            </button>
            <LanguageSwitcher compact />
            {/*
             * GNOME's close button sits in the end box. It is a real
             * destination rather than a prop: it leaves the auth flow for the
             * public site, which is what "closing" this window means here.
             */}
            <Link
              to={ROUTES.landing}
              aria-label={t("navigation.backToHome")}
              title={t("navigation.backToHome")}
              className="flex size-7 items-center justify-center rounded-full bg-surface-muted text-muted-foreground transition-colors hover:bg-destructive hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="size-3.5" aria-hidden="true" />
            </Link>
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

                  {/*
                   * The prev/next controls that sat here were wired to
                   * nothing — there is a single quote. Dead buttons in a
                   * sign-in window read as a broken build, so they are gone
                   * until there is a second testimonial to page to.
                   */}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
