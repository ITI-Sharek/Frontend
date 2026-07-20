import { ChevronLeft, TrendingUp } from "lucide-react";

import type {
  ApplicationsSummaryDto,
  GrowthSummaryDto,
} from "../types/dashboard.types";

/**
 * WF-02 bottom row: "YOUR GROWTH" (deltas, Principle 8) beside
 * "MY APPLICATIONS" (counts + view-all). When there is no growth data yet,
 * the panel shows the path, never zeros.
 */
export function DashboardSummary({
  growth,
  applications,
  showGrowthPath = false,
}: {
  growth: GrowthSummaryDto;
  applications: ApplicationsSummaryDto;
  showGrowthPath?: boolean;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-card border border-border bg-card p-5">
        <h2 className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
          نموك
        </h2>
        {showGrowthPath ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            سمعتك تُبنى من التسليمات المعتمدة وتقييمات أصحاب المشاريع. الخطوة
            الأولى: قدّم على مهمة مطابقة لمهاراتك الموثقة — أول مساهمة معتمدة
            تبدأ سجلّك.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-1.5">
            <p className="flex items-center gap-2 text-xl font-bold text-foreground">
              <span dir="ltr" className="inline-flex items-center gap-1.5">
                {growth.ratingPrevious?.toFixed(1)} ← {growth.ratingCurrent?.toFixed(1)}
              </span>
              <TrendingUp className="size-4 text-primary" />
            </p>
            <p className="text-sm text-muted-foreground">
              {growth.completedCount} مساهمات مكتملة · معدل نجاح{" "}
              {growth.successRate}٪
            </p>
            <p className="text-sm text-evidence-teal">
              +{growth.skillsVerifiedThisMonth} مهارة موثقة هذا الشهر
            </p>
          </div>
        )}
      </div>

      <div className="rounded-card border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
            طلبات الانضمام
          </h2>
          <a
            href="#"
            className="inline-flex items-center gap-1 text-sm text-primary transition-colors hover:opacity-80"
          >
            عرض الكل
            <ChevronLeft className="size-4" />
          </a>
        </div>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">مؤهلة</dt>
            <dd className="font-bold text-foreground">
              {applications.eligibleCount}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">بانتظار صاحب المشروع</dt>
            <dd className="font-bold text-foreground">
              {applications.waitingOwnerCount}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
