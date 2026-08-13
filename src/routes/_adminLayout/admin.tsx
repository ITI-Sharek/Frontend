import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { AdminPublishedProjectOwnersPanel } from "@/modules/projects";
import { AdminSkillReviewSummary } from "@/modules/skill-profiles";
import { PageContainer, PageHeader } from "@/shared/components/layout/page-layout";

export const Route = createFileRoute("/_adminLayout/admin")({
  head: () => ({
    meta: [{ title: "Sharek" }],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname.replace(/\/+$/, ""),
  });

  return pathname === ROUTES.admin ? <AdminDashboard /> : <Outlet />;
}

function AdminDashboard() {
  const { t } = useTranslation();
  return (
    <PageContainer>
      <PageHeader
        title={t("admin.dashboard.title")}
        description={t("admin.dashboard.description")}
      />
      <div className="mt-6 grid gap-6">
        <AdminSkillReviewSummary />
        <AdminPublishedProjectOwnersPanel />
      </div>
    </PageContainer>
  );
}
