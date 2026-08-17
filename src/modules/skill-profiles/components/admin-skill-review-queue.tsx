import { Link } from "@tanstack/react-router";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { AlertTriangle, BadgeCheck, Clock, Inbox } from "lucide-react";

import { ROUTES } from "@/config/routes.config";
import { DirectionalArrow } from "@/shared/components/ui/directional-arrow";
import { cn } from "@/lib/utils";
import {
  PageContainer,
  PageFeedback,
  PageHeader,
} from "@/shared/components/layout/page-layout";

import {
  formatConfidence,
  formatWaitingAge,
  getAgingBand,
  groupPendingSkillReviews,
} from "./admin-skill-review-presenter";
import type { ContributorReviewGroup } from "./admin-skill-review-presenter";
import type { PendingSkillReviewsDto } from "../types/admin-skill-review.types";

export function AdminSkillReviewQueue({
  reviews,
}: {
  reviews: PendingSkillReviewsDto;
}) {
  const { t } = useTranslation();
  const groups = groupPendingSkillReviews(t, reviews.items);
  const oldest = groups[0]?.oldestCreatedAt;

  return (
    <PageContainer>
      <PageHeader
        title={t("admin.skillReviews.title")}
        description={t("skillProfile.reviewQueue.description")}
      />

      <dl className="mt-6 grid overflow-hidden rounded-card border border-border bg-card sm:grid-cols-3">
        <Metric
          label={t("skillProfile.reviewQueue.pendingSkillsMetric")}
          value={reviews.total.toString()}
        />
        <Metric
          label={t("skillProfile.reviewQueue.contributorsMetric")}
          value={groups.length.toString()}
        />
        <Metric
          label={t("skillProfile.reviewQueue.oldestWaitMetric")}
          value={
            oldest
              ? formatWaitingAge(t, oldest)
              : t("skillProfile.reviewQueue.emptyQueue")
          }
        />
      </dl>

      {groups.length === 0 ? (
        <PageFeedback
          className="mt-6"
          icon={Inbox}
          title={t("skillProfile.reviewQueue.emptyTitle")}
          description={t("skillProfile.reviewQueue.emptyDescription")}
        />
      ) : (
        <>
          <div className="mt-6 hidden overflow-x-auto rounded-card border border-border bg-card md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-start text-xs text-muted-foreground">
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t("skillProfile.reviewQueue.columnContributor")}
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t("skillProfile.reviewQueue.columnSkills")}
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t("skillProfile.reviewQueue.columnConfidence")}
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t("skillProfile.reviewQueue.columnWaiting")}
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    <span className="sr-only">
                      {t("skillProfile.reviewQueue.columnAction")}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <QueueTableRow key={group.contributorId} group={group} t={t} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col gap-3 md:hidden">
            {groups.map((group) => (
              <QueueMobileItem key={group.contributorId} group={group} t={t} />
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}

function QueueTableRow({
  group,
  t,
}: {
  group: ContributorReviewGroup;
  t: TFunction;
}) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-border/15">
      <td className="min-w-56 px-5 py-4">
        <ContributorIdentity group={group} />
      </td>
      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-2 tabular-nums text-foreground">
          <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
          {group.skills.length}
        </span>
      </td>
      <td className="px-5 py-4 font-mono tabular-nums text-foreground">
        {formatConfidence(group.averageConfidence)}
      </td>
      <td className="px-5 py-4">
        <WaitingAge createdAt={group.oldestCreatedAt} t={t} />
      </td>
      <td className="px-5 py-4 text-end">
        <ReviewLink group={group} t={t} compact />
      </td>
    </tr>
  );
}

function QueueMobileItem({
  group,
  t,
}: {
  group: ContributorReviewGroup;
  t: TFunction;
}) {
  return (
    <article className="rounded-card border border-border bg-card p-4">
      <ContributorIdentity group={group} />
      <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-border py-3 text-xs">
        <div>
          <dt className="text-muted-foreground">
            {t("skillProfile.reviewQueue.mobileSkills")}
          </dt>
          <dd className="mt-1 font-mono font-semibold tabular-nums text-foreground">
            {group.skills.length}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">
            {t("skillProfile.reviewQueue.mobileConfidence")}
          </dt>
          <dd className="mt-1 font-mono font-semibold tabular-nums text-foreground">
            {formatConfidence(group.averageConfidence)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">
            {t("skillProfile.reviewQueue.mobileWaiting")}
          </dt>
          <dd className="mt-1">
            <WaitingAge createdAt={group.oldestCreatedAt} t={t} compact />
          </dd>
        </div>
      </dl>
      <ReviewLink group={group} t={t} />
    </article>
  );
}

function ContributorIdentity({ group }: { group: ContributorReviewGroup }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold text-foreground">
        {group.contributorName}
      </p>
      <p
        dir="ltr"
        className="mt-1 truncate text-end font-mono text-xs text-muted-foreground"
      >
        {group.contributorUsername
          ? `@${group.contributorUsername}`
          : group.contributorId}
      </p>
    </div>
  );
}

function WaitingAge({
  createdAt,
  t,
  compact = false,
}: {
  createdAt: string;
  t: TFunction;
  compact?: boolean;
}) {
  const band = getAgingBand(createdAt);
  const Icon = band === "normal" ? Clock : AlertTriangle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap",
        getAgingClass(createdAt),
        compact && "text-xs",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {formatWaitingAge(t, createdAt)}
    </span>
  );
}

function ReviewLink({
  group,
  t,
  compact = false,
}: {
  group: ContributorReviewGroup;
  t: TFunction;
  compact?: boolean;
}) {
  return (
    <Link
      to={ROUTES.adminSkillReview(group.contributorId)}
      aria-label={t("skillProfile.reviewQueue.openReviewAria", {
        contributorName: group.contributorName,
      })}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-input font-semibold text-foreground transition-colors duration-150 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        compact ? "px-3 text-xs" : "mt-3 w-full px-4 text-sm",
      )}
    >
      {t("skillProfile.reviewQueue.openReview")}
      <DirectionalArrow />
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-e sm:first:border-e-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}

function getAgingClass(createdAt: string): string {
  const band = getAgingBand(createdAt);
  if (band === "critical") return "text-red-700 dark:text-red-300";
  if (band === "overdue") return "text-orange-700 dark:text-orange-300";
  if (band === "due") return "text-amber-700 dark:text-amber-300";
  return "text-muted-foreground";
}
