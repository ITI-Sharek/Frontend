import { createFileRoute } from "@tanstack/react-router";

import { AdminContributorFieldsPanel } from "@/modules/contributors";
import { PageContainer, PageHeader } from "@/shared/components/layout/page-layout";

export const Route = createFileRoute("/_adminLayout/admin/profile-fields")({
  head: () => ({ meta: [{ title: "مجالات المساهمين | Sharek" }] }),
  component: AdminContributorFieldsPage,
});

function AdminContributorFieldsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="إدارة مجالات المساهمين"
        description="أضف المجالات التي يختار منها المساهمون وحدد ترتيب ظهورها وحالتها."
      />
      <AdminContributorFieldsPanel />
    </PageContainer>
  );
}
