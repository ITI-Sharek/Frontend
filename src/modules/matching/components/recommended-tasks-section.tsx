import { CircleAlert, Compass, Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { useRecommendedTasksQuery } from "../api/queries/use-matching-queries";
import type { RecommendedTaskDto } from "../types/matching.types";

function scoreLabel(score: number) {
  return `${Math.round(score * 100)}%`;
}

function RecommendationCard({ recommendation }: { recommendation: RecommendedTaskDto }) {
  const { t } = useTranslation();
  return (
    <article className="grid gap-3 rounded-card border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{recommendation.projectName}</p>
          <h3 className="mt-1 text-lg font-bold text-foreground">{recommendation.title}</h3>
        </div>
        <span className="font-mono text-xs text-primary" dir="ltr">
          {scoreLabel(recommendation.matchScore)} · {recommendation.confidence}
        </span>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{recommendation.justification}</p>
      <div className="flex flex-wrap gap-2">
        {recommendation.matchedSkills.map((skill) => (
          <span key={`${skill.name}-${skill.proficiency}`} dir="ltr" className="rounded-full border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground">
            {skill.name} · {skill.proficiency}
          </span>
        ))}
      </div>
      <a
        href={ROUTES.task(recommendation.requestId)}
        className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        {t("matching.recommendations.viewRequest")}
        <Compass className="size-4" aria-hidden />
      </a>
    </article>
  );
}

export function RecommendedTasksSection() {
  const { t } = useTranslation();
  const query = useRecommendedTasksQuery();

  if (query.isPending) {
    return (
      <Card className="flex items-center gap-2 shadow-none" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {t("matching.recommendations.loading")}
      </Card>
    );
  }

  if (query.isError && getApiErrorCode(query.error) === "CONTRIBUTOR_RECOMMENDATIONS_PLAN_REQUIRED") {
    return (
      <Card className="grid gap-3 border-dashed shadow-none">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Sparkles className="size-5 text-primary" aria-hidden />
          {t("matching.recommendations.gatedTitle")}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("matching.recommendations.gatedDescription")}
        </p>
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
        <Button type="button" variant="outline" className="w-fit" onClick={() => void query.refetch()}>
          {t("common.retry")}
        </Button>
      </Card>
    );
  }

  return (
    <section className="grid gap-4" aria-labelledby="recommended-tasks-title">
      <div>
        <p className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Sparkles className="size-4" aria-hidden />
          {t("matching.recommendations.eyebrow")}
        </p>
        <h2 id="recommended-tasks-title" className="mt-1 text-xl font-bold text-foreground">
          {t("matching.recommendations.title")}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {t("matching.recommendations.description")}
        </p>
      </div>
      {query.data.recommendations.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <p className="text-sm leading-6 text-muted-foreground">
            {t("matching.recommendations.empty")}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {query.data.recommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.requestId} recommendation={recommendation} />
          ))}
        </div>
      )}
      <p className="text-xs leading-5 text-muted-foreground">
        {t("matching.recommendations.quotaNote")}
      </p>
    </section>
  );
}
