import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import {
  AdminSkillReviewWorkspace,
  useAdminPendingSkillReviewsQuery,
} from "@/modules/skill-profiles";
import {
  PageContainer,
  PageFeedback,
  PageHeader,
} from "@/shared/components/layout/page-layout";
import { Button } from "@/shared/components/ui/button";

export const Route = createFileRoute("/_adminLayout/admin/skill-reviews/$userId")({
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: AdminSkillReviewWorkspacePage,
});

function AdminSkillReviewWorkspacePage() {
  const { t } = useTranslation();
  const { userId } = Route.useParams();
  const pendingReviews = useAdminPendingSkillReviewsQuery({ page: 1, limit: 100 });

  if (pendingReviews.isPending) {
    return (
      <PageContainer>
        <PageHeader
          title={t("adminReview.workspaceTitle")}
          description={t("adminReview.loadingDescription")}
        />
        <div
          role="status"
          aria-live="polite"
          className="mt-6 rounded-card border border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground"
        >
          {t("adminReview.loading")}
        </div>
      </PageContainer>
    );
  }

  if (pendingReviews.isError) {
    return (
      <PageContainer>
        <PageHeader title={t("adminReview.workspaceTitle")} />
        <PageFeedback
          className="mt-6"
          title={t("adminReview.loadErrorTitle")}
          description={t("adminReview.loadErrorDescription")}
          action={<Button
            type="button"
            variant="outline"
            onClick={() => {
              void pendingReviews.refetch();
            }}
          >
            {t("common.retry")}
          </Button>}
        />
      </PageContainer>
    );
  }

  return (
    <AdminSkillReviewWorkspace
      contributorId={userId}
      reviews={pendingReviews.data}
    />
  );
}
