import { createFileRoute } from "@tanstack/react-router";

import { AdminPublishedProjectOwnersPanel } from "@/modules/projects";
import { PageContainer, PageHeader } from "@/shared/components/layout/page-layout";

export const Route = createFileRoute("/_adminLayout/admin/project-owners")({
  head: () => ({ meta: [{ title: "ملاك المشاريع المنشورة | Sharek" }] }),
  component: AdminPublishedProjectOwnersPage,
});

function AdminPublishedProjectOwnersPage() {
  return (
    <PageContainer>
      <PageHeader
        title="ملاك المشاريع المنشورة"
        description="راجع من نشر مشاريع فعلية وعدد المشاريع وآخر مشروع منشور."
      />
      <div className="mt-6">
        <AdminPublishedProjectOwnersPanel />
      </div>
    </PageContainer>
  );
}
