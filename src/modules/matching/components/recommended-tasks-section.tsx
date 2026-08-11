import { CircleAlert, Compass, Loader2, Sparkles } from "lucide-react";

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
        عرض طلب المساهمة والتقديم
        <Compass className="size-4" aria-hidden />
      </a>
    </article>
  );
}

export function RecommendedTasksSection() {
  const query = useRecommendedTasksQuery();

  if (query.isPending) {
    return (
      <Card className="flex items-center gap-2 shadow-none" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        جارٍ إعداد التوصيات من مهاراتك المعتمدة…
      </Card>
    );
  }

  if (query.isError && getApiErrorCode(query.error) === "CONTRIBUTOR_RECOMMENDATIONS_PLAN_REQUIRED") {
    return (
      <Card className="grid gap-3 border-dashed shadow-none">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Sparkles className="size-5 text-primary" aria-hidden />
          توصيات مخصصة لك
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          التوصيات الشخصية غير متاحة ضمن خطتك الحالية. يمكنك استكشاف كل الطلبات والتقديم وفق القواعد العادية.
        </p>
      </Card>
    );
  }

  if (query.isError) {
    return (
      <Card className="grid gap-3 shadow-none" role="alert">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CircleAlert className="size-4" aria-hidden />
          تعذّر تحميل التوصيات.
        </p>
        <Button type="button" variant="outline" className="w-fit" onClick={() => void query.refetch()}>
          إعادة المحاولة
        </Button>
      </Card>
    );
  }

  return (
    <section className="grid gap-4" aria-labelledby="recommended-tasks-title">
      <div>
        <p className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Sparkles className="size-4" aria-hidden />
          Gold · توصيات مبنية على الأدلة
        </p>
        <h2 id="recommended-tasks-title" className="mt-1 text-xl font-bold text-foreground">
          موصى بها لك
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          تظهر هذه الطلبات بسبب مهاراتك المعتمدة وتاريخ مساهماتك. التوصيات إرشادية فقط.
        </p>
      </div>
      {query.data.recommendations.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <p className="text-sm leading-6 text-muted-foreground">
            لا توجد توصيات جديدة الآن. يمكنك استكشاف الطلبات المنشورة يدويًا.
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
        التقديم متاح وفق القواعد العادية ولا يرتبط بحصة خطة المساهم.
      </p>
    </section>
  );
}
