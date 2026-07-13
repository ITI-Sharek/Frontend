import { Loader2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { StatusChip } from "@/shared/components/data-display/status-chip";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

import { submitApplication } from "../services/tasks.service";
import { ValidationResult } from "./validation-result";
import type { TaskDetailsDto, ValidationResultDto } from "../types/task.types";

type ApplyPhase = "composing" | "validating" | "done" | "error";

/**
 * WF-05 apply modal: DEC-006 quota copy before submit → live AI-validation
 * state (قيد التحقق, violet) → one of the three WF-06/12 outcome screens.
 */
export function ApplyModal({
  task,
  onClose,
}: {
  task: TaskDetailsDto;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<ApplyPhase>("composing");
  const [coverMessage, setCoverMessage] = useState("");
  const [result, setResult] = useState<ValidationResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setPhase("validating");
    setError(null);
    try {
      const validation = await submitApplication(task.id, coverMessage);
      setResult(validation);
      setPhase("done");
    } catch (submitError) {
      setError(
        getApiErrorMessage(
          submitError,
          "تعذّر التحقق — حاول مجددًا. أُعيدت محاولتك اليومية تلقائيًا.",
        ),
      );
      setPhase("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="إغلاق"
        className="absolute inset-0 bg-foreground/40"
        onClick={phase === "validating" ? undefined : onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="التقديم على المهمة"
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-border bg-background p-5 sm:rounded-card"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              التقديم على «{task.title}»
            </h2>
            <p dir="ltr" className="mt-0.5 text-end font-mono text-[12px] tracking-[0.65px] text-muted-foreground">
              {task.projectName}
            </p>
          </div>
          {phase !== "validating" && (
            <button
              type="button"
              aria-label="إغلاق"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {phase === "composing" && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cover-message" className="text-sm font-medium text-foreground">
                رسالة تعريفية (اختياري)
              </label>
              <textarea
                id="cover-message"
                dir="rtl"
                rows={4}
                maxLength={400}
                placeholder="عرّف صاحب المشروع بنفسك ولماذا هذه المهمة تناسبك…"
                className="w-full rounded-input border border-border bg-input-bg px-[17px] py-[13px] text-right text-base text-foreground outline-none transition-colors placeholder:text-input-placeholder"
                value={coverMessage}
                onChange={(event) => setCoverMessage(event.target.value)}
              />
            </div>

            <p className="rounded-input border border-amber-500/40 bg-amber-500/5 p-3 text-xs leading-5 text-muted-foreground">
              إرسال هذا الطلب يستهلك <b className="text-foreground">محاولة واحدة</b>{" "}
              من محاولاتك اليومية ({task.quota.used} من {task.quota.dailyLimit}{" "}
              مستخدمة) — حتى لو لم يجتَز فحص الأهلية. الأعطال التقنية تُعاد
              تلقائيًا.
            </p>

            <div className="flex gap-2.5">
              <Button className="flex-1" onClick={() => void handleSubmit()}>
                إرسال الطلب
              </Button>
              <Button variant="outline" onClick={onClose}>
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {phase === "validating" && (
          <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
            <StatusChip tone="ai" icon={Loader2}>
              قيد التحقق
            </StatusChip>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              نقارن متطلبات المهمة بمهاراتك الموثقة وأدلتها — ثوانٍ قليلة…
            </p>
          </div>
        )}

        {phase === "done" && result !== null && (
          <div className="mt-4">
            <ValidationResult result={result} />
            <Button variant="outline" className="mt-4 w-full" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        )}

        {phase === "error" && (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm leading-6 text-destructive">{error}</p>
            <Button size="sm" onClick={() => void handleSubmit()}>
              إعادة المحاولة
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
