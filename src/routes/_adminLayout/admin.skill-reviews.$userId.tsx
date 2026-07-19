import { createFileRoute } from "@tanstack/react-router";

import {
  AdminSkillReviewWorkspace,
  useAdminPendingSkillReviewsQuery,
} from "@/modules/skill-profiles";
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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">جارٍ تحميل مساحة المراجعة...</p>
      </div>
    );
  }

  if (pendingReviews.isError) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center px-4">
        <div className="rounded-card border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-bold text-foreground">
            تعذر تحميل بيانات المراجعة
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            أعد المحاولة بعد التأكد من صلاحية admin.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={() => {
              void pendingReviews.refetch();
            }}
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AdminSkillReviewWorkspace
      contributorId={userId}
      reviews={pendingReviews.data}
    />
  );
}
