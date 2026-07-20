import {
  Outlet,
  createFileRoute,
  useRouterState,
} from "@tanstack/react-router";

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
    meta: [{ title: "مراجعة المهارات | Sharek" }],
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
  const pendingReviews = useAdminPendingSkillReviewsQuery({ page: 1, limit: 50 });

  if (pendingReviews.isPending) {
    return (
      <PageContainer>
        <PageHeader
          title="مراجعة المهارات المعلقة"
          description="جارٍ تجهيز الطابور من الأقدم إلى الأحدث…"
        />
        <div
          role="status"
          aria-live="polite"
          className="mt-6 rounded-card border border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground"
        >
          جارٍ تحميل طابور المراجعة…
        </div>
      </PageContainer>
    );
  }

  if (pendingReviews.isError) {
    return (
      <PageContainer>
        <PageHeader title="مراجعة المهارات المعلقة" />
        <PageFeedback
          className="mt-6"
          title="تعذر تحميل طابور المراجعة"
          description="تحقق من الاتصال ثم أعد المحاولة. إذا انتهت الجلسة فستعود إلى تسجيل الدخول تلقائياً."
          action={<Button
            type="button"
            variant="outline"
            onClick={() => {
              void pendingReviews.refetch();
            }}
          >
            إعادة المحاولة
          </Button>}
        />
      </PageContainer>
    );
  }

  return <AdminSkillReviewQueue reviews={pendingReviews.data} />;
}
