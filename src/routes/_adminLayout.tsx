import {
  Outlet,
  createFileRoute,
  notFound,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { ROUTES } from "@/config/routes.config";
import { getCurrentUser } from "@/modules/auth";
import { NotificationPopover } from "@/modules/notifications";
import { useNotifications } from "@/providers/notifications-provider";
import { storageService } from "@/services/storage.service";
import { Button } from "@/shared/components/ui/button";

export async function beforeLoadAdminRoute() {
  if (typeof window === "undefined") return;

  if (!storageService.getAccessToken()) {
    throw redirect({ to: ROUTES.login });
  }

  const user = await getCurrentUser();
  if (user.role !== "admin") {
    throw notFound();
  }
}

export const Route = createFileRoute("/_adminLayout")({
  beforeLoad: beforeLoadAdminRoute,
  component: AdminLayout,
});

function AdminLayout() {
  const { unreadCount } = useNotifications();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const nav = [
    {
      label: "نظرة عامة",
      href: ROUTES.admin,
      icon: LayoutDashboard,
      active: pathname === ROUTES.admin,
    },
    {
      label: "مراجعة المهارات",
      href: ROUTES.adminSkillReviews,
      icon: ClipboardList,
      active: pathname.startsWith(ROUTES.adminSkillReviews),
    },
    {
      label: "الإشعارات",
      href: ROUTES.notifications,
      icon: Bell,
      active: pathname === ROUTES.notifications,
      badge: unreadCount,
    },
    {
      label: "المستخدمون",
      href: "#",
      icon: Users,
      active: false,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e border-border bg-card md:flex">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-7 text-primary" />
            <div>
              <p className="text-lg font-bold text-foreground">Admin</p>
              <p className="font-mono text-[11px] tracking-[0.65px] text-muted-foreground">
                Sharek review desk
              </p>
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="تنقل الإدارة">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={
                  item.active
                    ? "flex items-center gap-3 rounded-input border-s-2 border-primary bg-primary/10 px-3 py-2.5 text-sm font-semibold text-foreground"
                    : "flex items-center gap-3 rounded-input border-s-2 border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-border/20 hover:text-foreground"
                }
              >
                <Icon className="size-4.5" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[11px] text-amber-600">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
          <div className="hidden min-w-0 max-w-md flex-1 items-center gap-2 rounded-input border border-border bg-card px-3 py-2 text-sm text-muted-foreground md:flex">
            <Search className="size-4" />
            <span>بحث سريع بالاسم أو البريد أو المعرف</span>
          </div>
          <div className="flex items-center gap-3 md:ms-auto">
            <NotificationPopover />
            <span className="hidden rounded-full border border-border bg-card px-3 py-2 font-mono text-[12px] tracking-[0.65px] text-muted-foreground sm:inline-flex">
              Admin
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="تسجيل الخروج"
              onClick={() => {
                storageService.clearTokens();
                window.location.assign(ROUTES.login);
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
