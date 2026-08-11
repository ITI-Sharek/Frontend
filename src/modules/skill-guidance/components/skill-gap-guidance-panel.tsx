import { BookOpenCheck, CircleAlert, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { useSkillGapGuidanceMutation } from "../api/mutations/use-skill-guidance-mutation";
import type { SkillGapGuidanceResultDto } from "../types/skill-guidance.types";

export function SkillGapGuidancePanel({
  contributionRequestId,
}: {
  contributionRequestId: string;
}) {
  const mutation = useSkillGapGuidanceMutation();
  const [result, setResult] = useState<SkillGapGuidanceResultDto | null>(null);

  const requestGuidance = async () => {
    try {
      const nextResult = await mutation.mutateAsync(contributionRequestId);
      setResult(nextResult);
    } catch {
      // The mutation owns the error state; the panel keeps its previous result
      // visible while the user decides whether to retry.
    }
  };

  return (
    <Card className="mt-5 grid gap-4 shadow-none">
      <div>
        <p className="flex items-center gap-2 text-xs font-semibold text-evidence-teal-foreground dark:text-evidence-teal">
          <ShieldCheck className="size-4" aria-hidden />
          تغطية المتطلبات
        </p>
        <h2 className="mt-1 text-lg font-bold text-foreground">إرشاد مرتبط بالمصادر</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          استخدم المتطلبات المنشورة ومهاراتك المعتمدة للحصول على خطوات تعلم عملية.
          هذا الإرشاد تعليمي وليس قرارًا بشأن أهليتك أو طلب التقديم.
        </p>
      </div>

      <Button type="button" className="w-fit" onClick={() => void requestGuidance()} disabled={mutation.isPending}>
        {mutation.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <BookOpenCheck className="size-4" aria-hidden />}
        {mutation.isPending ? "جارٍ إعداد الإرشاد…" : "إرشاد مرتبط بالمصادر"}
      </Button>

      {mutation.isError && (
        <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
          <CircleAlert className="size-4" aria-hidden />
          تعذّر إعداد الإرشاد. يمكنك المحاولة مرة أخرى.
        </p>
      )}

      {result?.kind === "no_assessable_evidence" && (
        <p role="status" className="rounded-input border border-border bg-surface-fog p-3 text-sm leading-6 text-muted-foreground">
          لا توجد أدلة قابلة للتقييم في النطاق المصرح به بعد.
        </p>
      )}
      {result?.kind === "system_limit" && (
        <p role="status" className="rounded-input border border-amber-500/30 bg-amber-500/5 p-3 text-sm leading-6 text-muted-foreground">
          الإرشاد متوقف مؤقتًا بسبب حد تقني. لم يتغير طلب التقديم.
        </p>
      )}
      {result?.kind === "completed" && (
        <div className="grid gap-4 border-t border-border pt-4">
          <div>
            <h3 className="font-semibold text-foreground">فجوات تحتاج إلى تعلم</h3>
            {result.missingSkills?.length ? (
              <ul className="mt-2 grid gap-2 text-sm leading-6 text-muted-foreground">
                {result.missingSkills.map((skill) => (
                  <li key={`${skill.requirementId}-${skill.skillName}`}>
                    <strong className="text-foreground">{skill.skillName}:</strong> {skill.explanation}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">لم تظهر فجوات ضمن الأدلة الحالية.</p>
            )}
          </div>
          {!!result.learningResources?.length && (
            <div>
              <h3 className="font-semibold text-foreground">موارد مرتبطة بالمصادر</h3>
              <ul className="mt-2 grid gap-2 text-sm">
                {result.learningResources.map((resource) => (
                  <li key={resource.url}>
                    <a href={resource.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {resource.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
