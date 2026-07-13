import { ArrowRight, CircleAlert, Clock, FolderGit2, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { StatusChip } from "@/shared/components/data-display/status-chip";

import { ApplyModal } from "./apply-modal";
import { RequirementMatchPanel } from "./requirement-match-panel";
import type { TaskDetailsDto } from "../types/task.types";

const DIFFICULTY_LABELS: Record<TaskDetailsDto["difficulty"], string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

/**
 * WF-05 task details: evaluate honestly, then apply — quota on the button
 * (Principle 7), requirement match BEFORE the modal, gate states explained.
 */
export function TaskDetailsView({
  task,
  tasksHref,
  projectHref,
}: {
  task: TaskDetailsDto;
  tasksHref: string;
  projectHref: string;
}) {
  const [applyOpen, setApplyOpen] = useState(false);
  const remaining = task.quota.dailyLimit - task.quota.used;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 md:px-6">
      <a
        href={tasksHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowRight className="size-4" />
        العودة إلى المهام
      </a>

      <header className="rounded-card border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">{task.title}</h1>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {DIFFICULTY_LABELS[task.difficulty]}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          <a
            href={projectHref}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <FolderGit2 className="size-4" />
            <span dir="ltr" className="font-mono text-[12px] tracking-[0.65px]">
              {task.projectName}
            </span>
          </a>
          {task.deadlineLabel && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" />
              {task.deadlineLabel}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4" />
            {task.applicantsLabel} (الحد {task.maxApplicants})
          </span>
          {task.rewardLabel && (
            <span dir="ltr" className="font-mono text-[12px] tracking-[0.65px] text-foreground">
              {task.rewardLabel}
            </span>
          )}
        </div>
        <p className="mt-4 leading-8 text-muted-foreground">{task.description}</p>
      </header>

      <RequirementMatchPanel requirements={task.requirements} />

      <div className="rounded-card border border-border bg-card p-5">
        {task.applicationState === "open" && (
          <div className="flex flex-col gap-2">
            <Button
              disabled={remaining <= 0}
              onClick={() => setApplyOpen(true)}
            >
              تقديم طلب انضمام ({remaining} من {task.quota.dailyLimit} متبقٍ
              اليوم)
            </Button>
            <p className="text-center text-[11px] leading-5 text-muted-foreground">
              الطلب يمر بفحص أهلية آلي مُفسَّر ثم بمراجعة صاحب المشروع.
            </p>
          </div>
        )}

        {task.applicationState === "already_applied" && (
          <div className="flex flex-col items-center gap-2 text-center">
            <StatusChip tone="waiting" icon={Clock}>
              قدّمت على هذه المهمة — أُرسل إلى صاحب المشروع
            </StatusChip>
            <p className="text-xs text-muted-foreground">
              تتابع حالة طلبك من صفحة طلبات الانضمام.
            </p>
          </div>
        )}

        {task.applicationState === "quota_exhausted" && (
          <div className="flex flex-col items-center gap-2 text-center">
            <StatusChip tone="attention" icon={CircleAlert}>
              استُنفدت محاولات اليوم
            </StatusChip>
            <p className="text-xs text-muted-foreground">
              تتجدد محاولاتك عند 00:00 — أو رقِّ خطتك لمحاولات أكثر.
            </p>
          </div>
        )}

        {task.applicationState === "profile_not_approved" && (
          <div className="flex flex-col items-center gap-2 text-center">
            <StatusChip tone="attention" icon={CircleAlert}>
              التقديم يُفتح بعد توثيق ملفك
            </StatusChip>
            <p className="text-xs text-muted-foreground">
              ملفك المهاري قيد المراجعة — تُستكمل معظم المراجعات خلال 48 ساعة.
            </p>
          </div>
        )}

        {task.applicationState === "assigned" && (
          <div className="flex flex-col items-center gap-2 text-center">
            <StatusChip tone="neutral" icon={Users}>
              أُسندت المهمة لمساهم آخر
            </StatusChip>
            <p className="text-xs text-muted-foreground">
              لم يعد التقديم متاحًا — تصفح مهام مشابهة من صفحة المهام.
            </p>
          </div>
        )}
      </div>

      {applyOpen && (
        <ApplyModal task={task} onClose={() => setApplyOpen(false)} />
      )}
    </div>
  );
}
