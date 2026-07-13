import { Flag } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/lib/utils";

import type { GeneratedSkillDto } from "../../types/onboarding.types";

const PROFICIENCY_LABEL: Record<GeneratedSkillDto["proficiency"], string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

function confidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return "عالية";
  if (confidence >= 0.5) return "متوسطة";
  return "منخفضة";
}

/**
 * CJ-1 step 3: the contributor sees the generated skills *before* admin
 * review and can flag obvious errors early (reduces disputes).
 */
export function ProfilePreviewStep({
  skills,
  onSubmit,
}: {
  skills: GeneratedSkillDto[];
  onSubmit: () => void;
}) {
  const [flagged, setFlagged] = useState<Set<string>>(new Set());

  function toggleFlag(name: string) {
    setFlagged((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-foreground">ملفك المهاري المُولَّد</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        هذا ما استخرجه الذكاء الاصطناعي من نشاطك. راجعه وأبلغ عن أي خطأ واضح —
        ثم يعتمده فريق المراجعة البشري قبل أن يظهر لأي أحد.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {skills.map((skill) => {
          const isFlagged = flagged.has(skill.name);
          return (
            <div
              key={skill.name}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-input border px-4 py-3",
                isFlagged
                  ? "border-amber-500/60 bg-amber-500/5"
                  : "border-border bg-background",
              )}
            >
              <span dir="ltr" className="font-mono text-sm tracking-[0.65px] text-foreground">
                {skill.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {PROFICIENCY_LABEL[skill.proficiency]}
              </span>
              <span className="font-mono text-[11px] tracking-[0.65px] text-muted-foreground">
                الثقة: {confidenceLabel(skill.confidence)}
              </span>
              <button
                type="button"
                onClick={() => toggleFlag(skill.name)}
                className={cn(
                  "ms-auto inline-flex items-center gap-1.5 text-xs transition-colors",
                  isFlagged
                    ? "font-medium text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Flag className="size-3.5" />
                {isFlagged ? "مُبلَّغ عنها" : "الإبلاغ عن خطأ"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          {flagged.size > 0
            ? `${flagged.size} مهارة مُبلَّغ عنها — سيراها المراجع مع ملاحظتك.`
            : "لا شيء يُنشر تلقائيًا — المراجعة البشرية أولاً."}
        </p>
        <Button size="sm" onClick={onSubmit}>
          إرسال للمراجعة
        </Button>
      </div>
    </Card>
  );
}
