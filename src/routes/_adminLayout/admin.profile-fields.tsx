import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { AdminContributorFieldsPanel } from "@/modules/contributors";
import { PageContainer, PageHeader } from "@/shared/components/layout/page-layout";

export const Route = createFileRoute("/_adminLayout/admin/profile-fields")({
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: AdminContributorFieldsPage,
});

function AdminContributorFieldsPage() {
  const { t } = useTranslation();
  return (
    <PageContainer>
      <PageHeader
        title={t("adminPages.profileFieldsTitle")}
        description={t("adminPages.profileFieldsDescription")}
      />
      <AdminContributorFieldsPanel />
    </PageContainer>
  );
}
