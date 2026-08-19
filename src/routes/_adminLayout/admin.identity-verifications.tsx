import { createFileRoute } from "@tanstack/react-router";

import { AdminIdentityVerificationsPanel } from "@/modules/admin-identity";
import { PageContainer } from "@/shared/components/layout/page-layout";

export const Route = createFileRoute(
  "/_adminLayout/admin/identity-verifications",
)({
  head: () => ({ meta: [{ title: "Sharek - Identity Verifications" }] }),
  component: AdminIdentityVerificationsPage,
});

function AdminIdentityVerificationsPage() {
  return (
    <PageContainer>
      <AdminIdentityVerificationsPanel />
    </PageContainer>
  );
}
