import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import type { AdminDashboardTabId } from "@/modules/admin-dashboard";
import { AdminDashboardView } from "@/modules/admin-dashboard";

interface AdminDashboardSearch {
  tab?: string;
}

export const Route = createFileRoute("/_adminLayout/admin")({
  head: () => ({
    meta: [{ title: "Sharek" }],
  }),
  validateSearch: (search: Record<string, unknown>): AdminDashboardSearch => {
    const raw = typeof search.tab === "string" ? search.tab : undefined;
    return raw ? { tab: raw } : {};
  },
  component: AdminRoute,
});

function AdminRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname.replace(/\/+$/, ""),
  });

  return pathname === ROUTES.admin ? <AdminDashboardPage /> : <Outlet />;
}

function AdminDashboardPage() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <AdminDashboardView
      initialTab={tab}
      onTabChange={(newTab: AdminDashboardTabId) => {
        void navigate({
          search: newTab === "overview" ? {} : { tab: newTab },
          replace: true,
        });
      }}
    />
  );
}

