import {
  BadgeCheck,
  ChevronDown,
  CircleSlash,
  MessageSquareWarning,
  UserRoundSearch,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { StatusChip } from "@/shared/components/data-display/status-chip";

import { TaskCard } from "./task-card";
import type { ValidationResultDto } from "../types/task.types";

const CONFIDENCE_LABEL: Record<ValidationResultDto["confidenceBand"], string> = {
  high: "عالية",
  moderate: "متوسطة",
  low: "منخفضة",
};

/**
 * WF-06 ExplanationCard anatomy for the application decision: verdict →
 * labeled confidence → reasoning (always visible) → matched/missing →
 * evidence → who decides next + recovery actions. WF-12 layout for the
 * ineligible path (Principle 5 — reason first, then forward actions).
 */
export function ValidationResult({ result }: { result: ValidationResultDto }) {
  if (result.decision === "eligible") {
    return (
      <div className="flex flex-col gap-4">
        <ExplanationCard
          result={result}
          verdict={
            <StatusChip tone="positive" icon={BadgeCheck}>
              مؤهل — أُرسل إلى صاحب المشروع
            </StatusChip>
          }
        />
        <p className="rounded-input border border-border bg-background p-3.5 text-sm leading-6 text-muted-foreground">
          <b className="text-foreground">ماذا بعد؟</b> صاحب المشروع يراجع طلبك
          الآن — يرد أصحاب المشاريع خلال يومين عادة، وسنخبرك فور القرار.
        </p>
      </div>
    );
  }

  if (result.decision === "review_needed") {
    return (
      <ExplanationCard
        result={result}
        verdict={
          <StatusChip tone="waiting" icon={UserRoundSearch}>
            يحتاج إلى مراجعة بشرية
          </StatusChip>
        }
        footer={
          <p className="text-sm leading-6 text-muted-foreground">
            الثقة في التقييم الآلي منخفضة، لذا سيتولى فريق المنصة مراجعة طلبك —{" "}
            <b className="text-foreground">لا شيء مطلوب منك</b>، ومحاولتك
            اليومية محجوزة حتى صدور القرار.
          </p>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ExplanationCard
        result={result}
        verdict={
          <StatusChip tone="attention" icon={CircleSlash}>
            غير مؤهل حاليًا
          </StatusChip>
        }
      />

      {result.alternatives.length > 0 && (
        <section>
          <h3 className="text-base font-bold text-foreground">
            مهام تطابقك بالكامل اليوم
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {result.alternatives.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-input border border-border bg-background p-3.5">
        <Button size="sm" variant="outline">
          <MessageSquareWarning className="size-4" />
          اعتراض على القرار
        </Button>
        <p className="text-xs leading-5 text-muted-foreground">
          أعضاء Gold يحصلون هنا على خطة مخصصة لسد الفجوة — السبب نفسه مجاني
          دائمًا.
        </p>
      </div>
    </div>
  );
}

function ExplanationCard({
  result,
  verdict,
  footer,
}: {
  result: ValidationResultDto;
  verdict: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {verdict}
        <span className="font-mono text-[11px] tracking-[0.65px] text-muted-foreground">
          الثقة: {CONFIDENCE_LABEL[result.confidenceBand]}
        </span>
      </div>

      <p className="mt-3 text-sm leading-7 text-foreground">
        {result.justification}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        {result.matched.map((skill) => (
          <span
            key={skill}
            dir="ltr"
            className="rounded-full border border-primary/50 bg-primary/10 px-2 py-0.5 font-mono text-[11px] tracking-[0.65px] text-primary"
          >
            ✓ {skill}
          </span>
        ))}
        {result.missing.map((skill) => (
          <span
            key={skill}
            dir="ltr"
            className="rounded-full border border-destructive/40 bg-destructive/5 px-2 py-0.5 font-mono text-[11px] tracking-[0.65px] text-destructive"
          >
            ✗ {skill}
          </span>
        ))}
      </div>

      {result.evidenceRefs.length > 0 && (
        <details className="group mt-3 border-t border-border pt-3">
          <summary className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground [&::-webkit-details-marker]:hidden">
            الأدلة ({result.evidenceRefs.length})
            <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-2 flex flex-col gap-1">
            {result.evidenceRefs.map((ref) => (
              <li key={ref} dir="ltr" className="font-mono text-[11px] leading-5 tracking-[0.65px] text-muted-foreground">
                {ref}
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="mt-3 border-t border-border pt-2.5 text-[11px] leading-5 text-muted-foreground">
        توصية آلية مُفسَّرة — القرار النهائي دائمًا لإنسان.
      </p>

      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}
