import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ClipboardCheck, Inbox } from "lucide-react";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";

import {
  formatWaitingAge,
  groupPendingSkillReviews,
} from "./admin-skill-review-presenter";
import { useAdminPendingSkillReviewsQuery } from "../api/queries/use-admin-pending-skill-reviews-query";

export function AdminSkillReviewSummary() {
  const { t } = useTranslation();
  const pendingReviews = useAdminPendingSkillReviewsQuery({ page: 1, limit: 20 });
  const groups = groupPendingSkillReviews(t, pendingReviews.data?.items ?? []);
  const oldestPending = groups[0]?.oldestCreatedAt;

  return (
    <section
      aria-labelledby="pending-skill-reviews-heading"
      className="overflow-hidden rounded-card border border-border bg-card"
    >
      <div className="grid gap-5 border-b border-border p-5 sm:grid-cols-[1fr_auto] sm:items-start md:p-6">
        <div className="min-w-0">
          <h2
            id="pending-skill-reviews-heading"
            className="flex items-center gap-2 text-lg font-bold text-foreground"
          >
            <ClipboardCheck className="size-5 text-primary" aria-hidden="true" />
            {t("skillProfile.reviewSummary.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("skillProfile.reviewSummary.description")}
          </p>
        </div>
        <div className="text-start sm:min-w-28 sm:text-end">
          <p className="font-mono text-3xl font-semibold tabular-nums text-foreground">
            {pendingReviews.isPending ? "…" : (pendingReviews.data?.total ?? 0)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("skillProfile.reviewSummary.pendingSkillsCount")}
          </p>
        </div>
      </div>

      {pendingReviews.isPending ? (
        <p role="status" aria-live="polite" className="p-6 text-sm text-muted-foreground">
          {t("skillProfile.reviewSummary.loading")}
        </p>
      ) : pendingReviews.isError ? (
        <div role="alert" className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div>
            <p className="font-semibold text-foreground">
              {t("skillProfile.reviewSummary.loadErrorTitle")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("skillProfile.reviewSummary.loadErrorDescription")}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void pendingReviews.refetch()}
          >
            {t("admin.skillReviews.retry")}
          </Button>
        </div>
      ) : groups.length === 0 ? (
        <div className="flex items-start gap-3 p-5 md:p-6">
          <Inbox className="mt-0.5 size-5 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-semibold text-foreground">
              {t("skillProfile.reviewSummary.emptyTitle")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("skillProfile.reviewSummary.emptyDescription")}
            </p>
          </div>
        </div>
      ) : (
        <>
          <dl className="grid border-b border-border sm:grid-cols-2">
            <SummaryMetric
              label={t("skillProfile.reviewSummary.visibleContributors")}
              value={groups.length.toString()}
            />
            <SummaryMetric
              label={t("skillProfile.reviewSummary.oldestRequest")}
              value={
                oldestPending
                  ? formatWaitingAge(t, oldestPending)
                  : t("skillProfile.waitingAge.unknown")
              }
            />
          </dl>
          <div className="divide-y divide-border px-5 md:px-6">
            {groups.slice(0, 5).map((group) => (
              <Link
                key={group.contributorId}
                to={ROUTES.adminSkillReview(group.contributorId)}
                className="grid min-h-16 gap-2 py-4 transition-colors hover:bg-border/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:grid-cols-[1fr_auto_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {group.contributorName}
                  </p>
                  <p
                    dir="ltr"
                    className="mt-1 truncate text-left font-mono text-xs text-muted-foreground"
                  >
                    {group.contributorUsername
                      ? `@${group.contributorUsername}`
                      : group.contributorId}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {t("skillProfile.reviewSummary.skillsCount", {
                    count: group.skills.length,
                  })}
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  {t("skillProfile.reviewSummary.openReview")}
                  <ArrowLeft className="size-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-end border-t border-border p-4 sm:px-6">
        <Link
          to={ROUTES.adminSkillReviews}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-input bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {t("skillProfile.reviewSummary.viewQueue")}
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-e sm:first:border-e-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}
