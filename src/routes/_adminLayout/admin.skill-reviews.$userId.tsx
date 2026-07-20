import { createFileRoute } from "@tanstack/react-router";

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
  head: ({ params }) => ({
    meta: [{ title: `مراجعة ${params.userId} | Sharek` }],
  }),
  component: AdminSkillReviewWorkspacePage,
});

function AdminSkillReviewWorkspacePage() {
  const { userId } = Route.useParams();
  const pendingReviews = useAdminPendingSkillReviewsQuery({ page: 1, limit: 100 });

  if (pendingReviews.isPending) {
    return (
      <PageContainer>
        <PageHeader
          title="مساحة مراجعة المساهم"
          description="جارٍ تحميل المهارات والأدلة…"
        />
        <div
          role="status"
          aria-live="polite"
          className="mt-6 rounded-card border border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground"
        >
          جارٍ تحميل مساحة المراجعة…
        </div>
      </PageContainer>
    );
  }

  if (pendingReviews.isError) {
    return (
      <PageContainer>
        <PageHeader title="مساحة مراجعة المساهم" />
        <PageFeedback
          className="mt-6"
          title="تعذر تحميل بيانات المراجعة"
          description="تحقق من الاتصال ثم أعد المحاولة. لم يتم حفظ أي قرار جديد."
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

  return (
    <AdminSkillReviewWorkspace
      contributorId={userId}
      reviews={pendingReviews.data}
    />
  );
}
