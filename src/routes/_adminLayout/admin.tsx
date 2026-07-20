import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ClipboardCheck, ShieldCheck } from "lucide-react";

import { ROUTES } from "@/config/routes.config";
import {
  formatWaitingAge,
  groupPendingSkillReviews,
  useAdminPendingSkillReviewsQuery,
} from "@/modules/skill-profiles";
import {
  PageContainer,
  PageFeedback,
  PageHeader,
} from "@/shared/components/layout/page-layout";

export const Route = createFileRoute("/_adminLayout/admin")({
  head: () => ({
    meta: [{ title: "لوحة الإدارة | Sharek" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const pendingReviews = useAdminPendingSkillReviewsQuery({ page: 1, limit: 20 });

  if (pendingReviews.isError) {
    return (
      <PageContainer>
        <PageHeader
          title="مركز عمليات المراجعة"
          description="راقب الأعمال التي تؤثر في تفعيل المساهمين وأولويات الثقة."
        />
        <PageFeedback
          className="mt-6"
          icon={ShieldCheck}
          title="تعذر تحميل حالة الطوابير"
          description="تحقق من الاتصال ثم أعد المحاولة. لم تتغير أي قرارات مراجعة."
          action={
            <button
              type="button"
              onClick={() => void pendingReviews.refetch()}
              className="min-h-10 rounded-input border border-border px-4 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-border/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              إعادة المحاولة
            </button>
          }
        />
      </PageContainer>
    );
  }

  const groups = groupPendingSkillReviews(pendingReviews.data?.items ?? []);
  const oldestPending = groups[0]?.oldestCreatedAt;

  return (
    <PageContainer>
      <PageHeader
        title="مركز عمليات المراجعة"
        description="ابدأ بالأقدم للحفاظ على زمن تفعيل عادل، ثم اعمل داخل الطابور دون فقدان السياق."
      />

      <section className="mt-6 overflow-hidden rounded-card border border-border bg-card">
        <div className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:items-start md:p-6">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <ClipboardCheck className="size-4 text-primary" aria-hidden="true" />
              طابور مراجعة المهارات
            </span>
            <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground">
              المهارات المولدة آلياً لا تدخل في الأهلية قبل قرار مسؤول موثق.
              ترتيب الطابور من الأقدم إلى الأحدث.
            </p>
          </div>
          <div className="text-start md:min-w-32 md:text-end">
            <p className="font-mono text-4xl font-semibold tabular-nums text-foreground">
              {pendingReviews.isPending ? "…" : pendingReviews.data.total}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">مهارة معلقة</p>
          </div>
        </div>

        <dl className="grid border-y border-border sm:grid-cols-3">
          <QueueMetric
            label="المساهمون في الصفحة"
            value={pendingReviews.isPending ? "…" : groups.length.toString()}
          />
          <QueueMetric
            label="أقدم انتظار"
            value={oldestPending ? formatWaitingAge(oldestPending) : "الطابور خالٍ"}
          />
          <QueueMetric label="هدف المراجعة" value="خلال 48 ساعة" />
        </dl>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs leading-5 text-muted-foreground">
            كل قرار يحفظ المراجع والوقت والملاحظة في سجل المراجعة.
          </p>
          <Link
            to={ROUTES.adminSkillReviews}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-input bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            فتح الطابور
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}

function QueueMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-e sm:first:border-e-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}
