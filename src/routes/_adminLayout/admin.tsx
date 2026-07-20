import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { AdminPublishedProjectOwnersPanel } from "@/modules/projects";
import { AdminSkillReviewSummary } from "@/modules/skill-profiles";
import { PageContainer, PageHeader } from "@/shared/components/layout/page-layout";

export const Route = createFileRoute("/_adminLayout/admin")({
  head: () => ({
    meta: [{ title: "لوحة الإدارة | Sharek" }],
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
  return (
    <PageContainer>
      <PageHeader
        title="مركز عمليات المراجعة"
        description="راجع المساهمين الذين ينتظرون توثيق مهاراتهم، وتابع الملاك الذين نشروا مشاريع فعلية."
      />
      <div className="mt-6 grid gap-6">
        <AdminSkillReviewSummary />
        <AdminPublishedProjectOwnersPanel />
      </div>
    </PageContainer>
  );
}
