import { Link } from "@tanstack/react-router";
import { AlertTriangle, BadgeCheck, Clock, Inbox } from "lucide-react";

import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
import { Card } from "@/shared/components/ui/card";

import {
  formatConfidence,
  formatWaitingAge,
  getAgingBand,
  groupPendingSkillReviews,
} from "./admin-skill-review-presenter";
import type { PendingSkillReviewsDto } from "../types/admin-skill-review.types";

export function AdminSkillReviewQueue({
  reviews,
}: {
  reviews: PendingSkillReviewsDto;
}) {
  const groups = groupPendingSkillReviews(reviews.items);
  const oldest = groups[0]?.oldestCreatedAt;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:px-6">
      <header className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
            Admin · Skill reviews
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">
            مراجعة المهارات المعلقة
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            المهارات هنا لا تدخل في قرارات الأهلية إلا بعد اعتمادها.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          <Metric label="معلقة" value={reviews.total.toString()} />
          <Metric label="مساهمون" value={groups.length.toString()} />
          <Metric
            label="الأقدم"
            value={oldest ? formatWaitingAge(oldest) : "لا يوجد"}
          />
        </div>
      </header>

      {groups.length === 0 ? (
        <Card className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <h2 className="text-lg font-bold text-foreground">لا توجد مراجعات معلقة</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            كل المهارات التي وصلت من الذكاء الاصطناعي تمت مراجعتها أو لا توجد
            مهارات جديدة حالياً.
          </p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-card border border-border bg-card">
          <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_auto] gap-4 border-b border-border px-5 py-3 text-xs font-semibold text-muted-foreground">
            <span>المساهم</span>
            <span>المهارات</span>
            <span>الثقة</span>
            <span>الانتظار</span>
            <span>الإجراء</span>
          </div>
          {groups.map((group) => (
            <Link
              key={group.contributorId}
              to={ROUTES.adminSkillReview(group.contributorId)}
              className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_auto] gap-4 border-b border-border px-5 py-4 text-sm transition-colors last:border-b-0 hover:bg-border/20"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-foreground">
                  {group.contributorName}
                </span>
                <span dir="ltr" className="mt-1 block truncate font-mono text-[12px] text-muted-foreground">
                  {group.contributorUsername
                    ? `@${group.contributorUsername}`
                    : group.contributorId}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-primary" />
                {group.skills.length}
              </span>
              <span>{formatConfidence(group.averageConfidence)}</span>
              <span className={cn("inline-flex items-center gap-1", getAgingClass(group.oldestCreatedAt))}>
                {getAgingBand(group.oldestCreatedAt) !== "normal" && (
                  <AlertTriangle className="size-4" />
                )}
                <Clock className="size-4" />
                {formatWaitingAge(group.oldestCreatedAt)}
              </span>
              <span className="font-semibold text-primary">فتح</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function getAgingClass(createdAt: string): string {
  const band = getAgingBand(createdAt);
  if (band === "critical") return "text-red-600 dark:text-red-400";
  if (band === "overdue") return "text-orange-600 dark:text-orange-400";
  if (band === "due") return "text-amber-600 dark:text-amber-400";
  return "text-muted-foreground";
}
