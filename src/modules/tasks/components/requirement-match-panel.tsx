import { Check, X } from "lucide-react";

import type { RequirementMatchDto } from "../types/task.types";

/**
 * WF-05: the honest pre-application check — requirement vs. verified skill,
 * shown BEFORE the contributor spends a limited daily attempt.
 */
export function RequirementMatchPanel({
  requirements,
}: {
  requirements: RequirementMatchDto[];
}) {
  const matchedCount = requirements.filter((r) => r.verified).length;

  return (
    <section className="rounded-card border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-foreground">
          المتطلبات مقابل مهاراتك الموثقة
        </h2>
        <span dir="ltr" className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
          {matchedCount}/{requirements.length}
        </span>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {requirements.map((requirement) => (
          <li
            key={requirement.technology}
            className="flex items-center gap-3 rounded-input border border-border bg-background px-3.5 py-2.5"
          >
            {requirement.verified ? (
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-evidence-teal/15 text-evidence-teal">
                <Check className="size-3.5" />
              </span>
            ) : (
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-border/60 text-muted-foreground">
                <X className="size-3.5" />
              </span>
            )}
            <span dir="ltr" className="font-mono text-[13px] tracking-[0.65px] text-foreground">
              {requirement.technology}
            </span>
            <span className="ms-auto text-xs text-muted-foreground">
              {requirement.verified
                ? `موثقة — ${requirement.proficiencyLabel}`
                : "غير موجودة في ملفك الموثق"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
        مبني على مهاراتك الموثقة فقط — القرار النهائي لفحص الأهلية عند التقديم.
      </p>
    </section>
  );
}
