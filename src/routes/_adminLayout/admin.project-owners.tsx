import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { AdminPublishedProjectOwnersPanel } from "@/modules/projects";
import { PageContainer, PageHeader } from "@/shared/components/layout/page-layout";

export const Route = createFileRoute("/_adminLayout/admin/project-owners")({
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: AdminPublishedProjectOwnersPage,
});

function AdminPublishedProjectOwnersPage() {
  const { t } = useTranslation();
  return (
    <PageContainer>
      <PageHeader
        title={t("adminPages.projectOwnersTitle")}
        description={t("adminPages.projectOwnersDescription")}
      />
      <div className="mt-6">
        <AdminPublishedProjectOwnersPanel />
      </div>
    </PageContainer>
  );
}
