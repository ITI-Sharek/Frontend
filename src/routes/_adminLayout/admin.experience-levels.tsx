import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { AdminExperienceLevelsPanel } from "@/modules/contributors";
import { PageContainer, PageHeader } from "@/shared/components/layout/page-layout";

export const Route = createFileRoute("/_adminLayout/admin/experience-levels")({
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: AdminExperienceLevelsPage,
});

function AdminExperienceLevelsPage() {
  const { t } = useTranslation();
  return (
    <PageContainer>
      <PageHeader
        title={t("adminPages.experienceLevelsTitle")}
        description={t("adminPages.experienceLevelsDescription")}
      />
      <AdminExperienceLevelsPanel />
    </PageContainer>
  );
}
