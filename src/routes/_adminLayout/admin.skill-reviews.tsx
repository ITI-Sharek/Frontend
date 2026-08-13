import {
  Outlet,
  createFileRoute,
  useRouterState,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import {
  AdminSkillReviewQueue,
  useAdminPendingSkillReviewsQuery,
} from "@/modules/skill-profiles";
import {
  PageContainer,
  PageFeedback,
  PageHeader,
} from "@/shared/components/layout/page-layout";
import { Button } from "@/shared/components/ui/button";

export const Route = createFileRoute("/_adminLayout/admin/skill-reviews")({
  head: () => ({
    meta: [{ title: "Sharek" }],
  }),
  component: AdminSkillReviewsRoute,
});

function AdminSkillReviewsRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  if (pathname.startsWith(`${ROUTES.adminSkillReviews}/`)) {
    return <Outlet />;
  }

  return <AdminSkillReviewsPage />;
}

function AdminSkillReviewsPage() {
  const { t } = useTranslation();
  const pendingReviews = useAdminPendingSkillReviewsQuery({ page: 1, limit: 50 });

  if (pendingReviews.isPending) {
    return (
      <PageContainer>
        <PageHeader
          title={t("admin.skillReviews.title")}
          description={t("admin.skillReviews.loadingDescription")}
        />
        <div
          role="status"
          aria-live="polite"
          className="mt-6 rounded-card border border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground"
        >
          {t("admin.skillReviews.loading")}
        </div>
      </PageContainer>
    );
  }

  if (pendingReviews.isError) {
    return (
      <PageContainer>
        <PageHeader title={t("admin.skillReviews.title")} />
        <PageFeedback
          className="mt-6"
          title={t("admin.skillReviews.loadError")}
          description={t("admin.skillReviews.loadErrorDescription")}
          action={<Button
            type="button"
            variant="outline"
            onClick={() => {
              void pendingReviews.refetch();
            }}
          >
            {t("admin.skillReviews.retry")}
          </Button>}
        />
      </PageContainer>
    );
  }

  return <AdminSkillReviewQueue reviews={pendingReviews.data} />;
}
