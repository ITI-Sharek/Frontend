import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { useAdminPendingSkillReviewsQuery } from "@/modules/skill-profiles";
import { Card } from "@/shared/components/ui/card";

export const Route = createFileRoute("/_adminLayout/admin")({
  head: () => ({
    meta: [{ title: "لوحة الإدارة | Sharek" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const pendingReviews = useAdminPendingSkillReviewsQuery({ page: 1, limit: 20 });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:px-6">
      <header>
        <p className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
          Admin overview
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          صحة طوابير المراجعة
        </h1>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <a href={ROUTES.adminSkillReviews}>
          <Card className="h-full transition-colors hover:border-primary/60">
            <p className="text-sm text-muted-foreground">مراجعات المهارات</p>
            <p className="mt-3 font-mono text-4xl font-semibold text-foreground">
              {pendingReviews.data?.total ?? "…"}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              مهارات AI لا تدخل الأهلية حتى يعتمدها مسؤول.
            </p>
          </Card>
        </a>
        <Card>
          <p className="text-sm text-muted-foreground">الاعتراضات</p>
          <p className="mt-3 font-mono text-4xl font-semibold text-foreground">0</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            واجهة الاعتراضات خارج هذه المرحلة.
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">البلاغات</p>
          <p className="mt-3 font-mono text-4xl font-semibold text-foreground">0</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            واجهة البلاغات خارج هذه المرحلة.
          </p>
        </Card>
      </div>
    </div>
  );
}
