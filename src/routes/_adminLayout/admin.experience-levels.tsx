import { createFileRoute } from "@tanstack/react-router";

import { AdminExperienceLevelsPanel } from "@/modules/contributors";
import { PageContainer, PageHeader } from "@/shared/components/layout/page-layout";

export const Route = createFileRoute("/_adminLayout/admin/experience-levels")({
  head: () => ({ meta: [{ title: "مستويات الخبرة | Sharek" }] }),
  component: AdminExperienceLevelsPage,
});

function AdminExperienceLevelsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="إدارة مستويات الخبرة"
        description="أضف مستويات الخبرة التي يختار منها المستخدمون وحدد ترتيب ظهورها وحالتها."
      />
      <AdminExperienceLevelsPanel />
    </PageContainer>
  );
}
