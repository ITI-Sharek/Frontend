import {
  BadgeCheck,
  CircleAlert,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { useSubscriptionStatusQuery } from "@/modules/subscriptions";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { useOwnerContributorMatchingMutation } from "../api/mutations/use-owner-contributor-matching-mutation";
import type { OwnerContributorMatchDto } from "../types/matching.types";

export function OwnerContributorMatchingPanel({
  requestId,
}: {
  requestId: string;
}) {
  const { t } = useTranslation();
  const subscription = useSubscriptionStatusQuery();
  const matching = useOwnerContributorMatchingMutation();

  if (subscription.isPending) {
    return (
      <Card className="mt-6 flex items-center gap-2 shadow-none" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {t("matching.owner.loadingPlan")}
      </Card>
    );
  }

  if (subscription.isError) {
    return (
      <Card className="mt-6 grid gap-3 shadow-none" role="alert">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CircleAlert className="size-4" aria-hidden />
          {t("matching.owner.planError")}
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => void subscription.refetch()}
        >
          {t("common.retry")}
        </Button>
      </Card>
    );
  }

  if (
    subscription.data.roleContext !== "owner" ||
    subscription.data.plan !== "gold"
  ) {
    return (
      <Card className="mt-6 grid gap-3 border-dashed shadow-none">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <LockKeyhole className="size-5 text-primary" aria-hidden />
          {t("matching.owner.lockedTitle")}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("matching.owner.lockedDescription")}
        </p>
        <Button asChild variant="outline" className="w-fit">
          <Link to={ROUTES.plan}>{t("matching.owner.viewPlan")}</Link>
        </Button>
      </Card>
    );
  }

  const result = matching.data;
  return (
    <section className="mt-6 grid gap-4" aria-labelledby="owner-matches-title">
      <Card className="grid gap-4 shadow-none">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Sparkles className="size-4" aria-hidden />
            {t("matching.owner.eyebrow")}
          </p>
          <h2
            id="owner-matches-title"
            className="mt-1 text-xl font-bold text-foreground"
          >
            {t("matching.owner.title")}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {t("matching.owner.description")}
          </p>
        </div>
        <Button
          type="button"
          className="w-fit"
          disabled={matching.isPending}
          onClick={() => matching.mutate(requestId)}
        >
          {matching.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : result ? (
            <RefreshCw className="size-4" aria-hidden />
          ) : (
            <Sparkles className="size-4" aria-hidden />
          )}
          {matching.isPending
            ? t("matching.owner.generating")
            : result
              ? t("matching.owner.refresh")
              : t("matching.owner.generate")}
        </Button>
        {matching.isError ? (
          <p
            className="flex items-center gap-2 text-sm text-destructive"
            role="alert"
          >
            <CircleAlert className="size-4" aria-hidden />
            {t("matching.owner.generateError")}
          </p>
        ) : null}
      </Card>

      {result?.status === "system_limit" ? (
        <Card className="border-dashed shadow-none">
          <p className="text-sm text-muted-foreground">
            {t("matching.owner.systemLimit")}
          </p>
        </Card>
      ) : result && result.matches.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <p className="text-sm text-muted-foreground">
            {t("matching.owner.empty")}
          </p>
        </Card>
      ) : result ? (
        <div className="grid gap-3">
          {result.matches.map((match) => (
            <OwnerMatchCard key={match.contributorId} match={match} />
          ))}
        </div>
      ) : null}

      <p className="text-xs leading-5 text-muted-foreground">
        {t("matching.owner.advisoryNote")}
      </p>
    </section>
  );
}

function OwnerMatchCard({ match }: { match: OwnerContributorMatchDto }) {
  const { t } = useTranslation();
  return (
    <article className="grid gap-3 rounded-card border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-primary">
            {t("matching.owner.rank", { rank: match.rank })}
          </p>
          <h3 className="mt-1 text-lg font-bold text-foreground">
            {match.contributorName}
          </h3>
          {match.contributorUsername ? (
            <p className="text-sm text-muted-foreground" dir="ltr">
              @{match.contributorUsername}
            </p>
          ) : null}
        </div>
        <span className="text-xs font-semibold text-primary">
          {t(`matching.confidence.${match.confidence}`)}
        </span>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        {match.justification}
      </p>
      <ul className="flex flex-wrap gap-2">
        {match.matchedSkills.map((skill) => (
          <li
            key={`${skill.name}-${skill.proficiency}`}
            dir="ltr"
            className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground"
          >
            <BadgeCheck className="size-3.5 text-evidence-teal" aria-hidden />
            {skill.name} · {skill.proficiency}
          </li>
        ))}
      </ul>
      {match.contributorUsername ? (
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link to={ROUTES.contributorProfile(match.contributorUsername)}>
            <UserRound className="size-4" aria-hidden />
            {t("matching.owner.viewProfile")}
          </Link>
        </Button>
      ) : null}
    </article>
  );
}
