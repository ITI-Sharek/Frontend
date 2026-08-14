import { BadgeCheck, CircleAlert, Compass, Loader2, LockKeyhole, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { useRecommendedTasksQuery } from "../api/queries/use-matching-queries";
import type { RecommendedTaskDto } from "../types/matching.types";

function RecommendationCard({
  recommendation,
}: {
  recommendation: RecommendedTaskDto;
}) {
  const { t } = useTranslation();
  return (
    <article className="grid gap-3 rounded-card border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {recommendation.projectName}
          </p>
          <h3 className="mt-1 text-lg font-bold text-foreground">
            {recommendation.title}
          </h3>
        </div>
        {/*
          Ordinal position and a categorical band. Never a score and never a
          percentage: DEC-010 forbids presenting fit as a number, and the card
          used to render `${Math.round(score * 100)}%` before it was removed.
        */}
        <span className="shrink-0 text-xs font-semibold text-primary">
          {t("matching.recommendations.rank", { rank: recommendation.rank })}
          {" · "}
          {t(`matching.confidence.${recommendation.confidence}`)}
        </span>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        {recommendation.justification}
      </p>
      <ul className="flex flex-wrap gap-2">
        {recommendation.matchedSkills.map((skill) => (
          <li
            key={`${skill.name}-${skill.proficiency}`}
            dir="ltr"
            className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground"
          >
            <BadgeCheck
              className="size-3.5 shrink-0 text-evidence-teal"
              aria-hidden
            />
            {/*
              Technical tokens are forced LTR even in an Arabic layout: a skill
              name is a proper noun, not prose.
            */}
            {skill.name} · {skill.proficiency}
          </li>
        ))}
      </ul>
      <Link
        to={ROUTES.task(recommendation.requestId)}
        className="inline-flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        {t("matching.recommendations.viewRequest")}
        <Compass className="size-4" aria-hidden />
      </Link>
    </article>
  );
}

/**
 * What a free contributor sees.
 *
 * It names the benefit and the price and links to the plan page. It shows no
 * blurred placeholder cards, no fake row count, and no silhouette of results
 * that do not exist — a locked state that pretends to have content behind it is
 * a dark pattern, and the honest version converts on the benefit rather than on
 * curiosity.
 */
function LockedState() {
  const { t } = useTranslation();
  return (
    <Card className="grid gap-3 border-dashed shadow-none">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <LockKeyhole className="size-5 text-primary" aria-hidden />
        {t("matching.recommendations.lockedTitle")}
      </h2>
      <p className="text-sm leading-6 text-muted-foreground">
        {t("matching.recommendations.lockedDescription")}
      </p>
      <p className="text-sm font-semibold text-foreground">
        {t("matching.recommendations.lockedPrice")}
      </p>
      <Button asChild variant="outline" className="w-fit">
        <Link to={ROUTES.plan}>{t("matching.recommendations.lockedCta")}</Link>
      </Button>
    </Card>
  );
}

export function RecommendedTasksSection() {
  const { t } = useTranslation();
  const query = useRecommendedTasksQuery();

  if (query.isPending) {
    return (
      <Card
        className="flex items-center gap-2 shadow-none"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {t("matching.recommendations.loading")}
      </Card>
    );
  }

  if (query.isError) {
    return (
      <Card className="grid gap-3 shadow-none" role="alert">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CircleAlert className="size-4" aria-hidden />
          {t("matching.recommendations.loadError")}
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => void query.refetch()}
        >
          {t("common.retry")}
        </Button>
      </Card>
    );
  }

  const { recommendations, reason } = query.data;

  // The backend answers a free contributor with 200 and a reason, not a 403 —
  // the route is legitimately theirs. Reading that as an error would put an
  // error state where an upgrade prompt belongs.
  if (reason === "MATCHING_REQUIRES_SUBSCRIPTION") {
    return <LockedState />;
  }

  return (
    <section className="grid gap-4" aria-labelledby="recommended-tasks-title">
      <div>
        <p className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Sparkles className="size-4" aria-hidden />
          {t("matching.recommendations.eyebrow")}
        </p>
        <h2
          id="recommended-tasks-title"
          className="mt-1 text-xl font-bold text-foreground"
        >
          {t("matching.recommendations.title")}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {t("matching.recommendations.description")}
        </p>
      </div>
      {recommendations.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <p className="text-sm leading-6 text-muted-foreground">
            {/*
              An empty shortlist has more than one cause, and "you have no
              approved skills yet" is actionable where "nothing right now" is
              not.
            */}
            {reason === "NO_APPROVED_SKILLS"
              ? t("matching.recommendations.emptyNoSkills")
              : t("matching.recommendations.empty")}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.requestId}
              recommendation={recommendation}
            />
          ))}
        </div>
      )}
      <p className="text-xs leading-5 text-muted-foreground">
        {t("matching.recommendations.advisoryNote")}
      </p>
    </section>
  );
}
