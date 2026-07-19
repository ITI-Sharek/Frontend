import {
  ArrowLeft,
  BadgeCheck,
  CircleSlash,
  ClipboardList,
  Save,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import {
  PROFICIENCY_LABEL,
  formatConfidence,
  formatWaitingAge,
  groupPendingSkillReviews,
  renderEvidenceSources,
} from "./admin-skill-review-presenter";
import {
  useAdjustSkillReviewProficiencyMutation,
  useApproveSkillReviewMutation,
  useRejectSkillReviewMutation,
} from "../api/mutations/use-admin-skill-review-mutations";
import type {
  PendingSkillReviewItemDto,
  PendingSkillReviewsDto,
  SkillProfileReviewProficiency,
} from "../types/admin-skill-review.types";

const PROFICIENCY_OPTIONS: SkillProfileReviewProficiency[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export function AdminSkillReviewWorkspace({
  contributorId,
  reviews,
}: {
  contributorId: string;
  reviews: PendingSkillReviewsDto;
}) {
  const groups = useMemo(
    () => groupPendingSkillReviews(reviews.items),
    [reviews.items],
  );
  const group = groups.find((item) => item.contributorId === contributorId);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(
    group?.skills[0]?.skillProfileId ?? null,
  );
  const [notesBySkillId, setNotesBySkillId] = useState<Record<string, string>>({});
  const [proficiencyBySkillId, setProficiencyBySkillId] = useState<
    Record<string, SkillProfileReviewProficiency>
  >({});
  const approveMutation = useApproveSkillReviewMutation();
  const rejectMutation = useRejectSkillReviewMutation();
  const adjustMutation = useAdjustSkillReviewProficiencyMutation();

  if (!group) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center px-4 py-8">
        <Card className="text-center">
          <ClipboardList className="mx-auto size-8 text-muted-foreground" />
          <h1 className="mt-3 text-xl font-bold text-foreground">
            لا توجد مهارات معلقة لهذا المساهم
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            قد تكون المهارات تمت مراجعتها بالفعل أو أن الصف أعيد توليده.
          </p>
          <Button asChild className="mt-5" variant="outline">
            <a href={ROUTES.adminSkillReviews}>العودة إلى قائمة المراجعة</a>
          </Button>
        </Card>
      </div>
    );
  }

  const selectedSkill =
    group.skills.find((skill) => skill.skillProfileId === selectedSkillId) ??
    group.skills[0];
  const selectedProficiency =
    proficiencyBySkillId[selectedSkill.skillProfileId] ??
    selectedSkill.proficiencyLevel;
  const selectedNotes = notesBySkillId[selectedSkill.skillProfileId] ?? "";
  const isMutating =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    adjustMutation.isPending;

  function setSkillNotes(skillId: string, notes: string) {
    setNotesBySkillId((current) => ({ ...current, [skillId]: notes }));
  }

  function setSkillProficiency(
    skillId: string,
    proficiency: SkillProfileReviewProficiency,
  ) {
    setProficiencyBySkillId((current) => ({ ...current, [skillId]: proficiency }));
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <header className="border-b border-border px-4 py-4 md:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <a
              href={ROUTES.adminSkillReviews}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              <ArrowLeft className="size-4" />
              العودة إلى الطابور
            </a>
            <h1 className="mt-3 text-2xl font-bold text-foreground">
              مراجعة: {group.contributorName}
            </h1>
            <p className="mt-1 font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
              {group.contributorUsername
                ? `@${group.contributorUsername}`
                : group.contributorId}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Metric label="معلقة" value={group.skills.length.toString()} />
            <Metric
              label="متوسط الثقة"
              value={formatConfidence(group.averageConfidence)}
            />
            <Metric label="الانتظار" value={formatWaitingAge(group.oldestCreatedAt)} />
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-4 md:grid-cols-[1fr_1.2fr] md:px-6 xl:grid-cols-[0.9fr_1.2fr_0.8fr]">
        <section className="rounded-card border border-border bg-card">
          <div className="border-b border-border p-4">
            <h2 className="font-bold text-foreground">المهارات المعلقة</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              اختر مهارة لقراءة الأدلة واتخاذ القرار.
            </p>
          </div>
          <div className="flex max-h-[32rem] flex-col overflow-y-auto">
            {group.skills.map((skill) => (
              <button
                key={skill.skillProfileId}
                type="button"
                onClick={() => setSelectedSkillId(skill.skillProfileId)}
                className={cn(
                  "border-b border-border p-4 text-right transition-colors last:border-b-0",
                  skill.skillProfileId === selectedSkill.skillProfileId
                    ? "bg-primary/10"
                    : "hover:bg-border/20",
                )}
              >
                <span className="block font-semibold text-foreground">
                  {skill.skillName}
                </span>
                <span className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{PROFICIENCY_LABEL[skill.proficiencyLevel]}</span>
                  <span dir="ltr" className="font-mono">
                    {formatConfidence(skill.confidence)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <EvidencePanel skill={selectedSkill} />

        <aside className="rounded-card border border-border bg-card p-4 md:col-span-2 xl:col-span-1">
          <h2 className="text-lg font-bold text-foreground">قرار المراجعة</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            الملاحظة تظهر للمساهم في حالات الرفض أو تعديل المستوى، فاكتبها كشرح
            واضح لا كتعليق داخلي.
          </p>

          <label className="mt-5 block text-sm font-semibold text-foreground">
            مستوى المهارة
            <select
              value={selectedProficiency}
              onChange={(event) =>
                setSkillProficiency(
                  selectedSkill.skillProfileId,
                  event.target.value as SkillProfileReviewProficiency,
                )
              }
              className="mt-2 w-full rounded-input border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {PROFICIENCY_OPTIONS.map((proficiency) => (
                <option key={proficiency} value={proficiency}>
                  {PROFICIENCY_LABEL[proficiency]}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block text-sm font-semibold text-foreground">
            ملاحظات المراجعة
            <textarea
              value={selectedNotes}
              onChange={(event) =>
                setSkillNotes(selectedSkill.skillProfileId, event.target.value)
              }
              rows={5}
              className="mt-2 w-full resize-none rounded-input border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground"
              placeholder="مثال: الأدلة تدعم مستوى متوسط، بينما اقترح الذكاء الاصطناعي مستوى متقدم."
            />
          </label>

          <div className="mt-5 flex flex-col gap-2">
            <Button
              type="button"
              disabled={isMutating}
              onClick={() =>
                approveMutation.mutate({
                  skillProfileId: selectedSkill.skillProfileId,
                  payload: {
                    proficiency: selectedProficiency,
                    notes: selectedNotes.trim() || undefined,
                  },
                })
              }
            >
              <BadgeCheck className="size-4" />
              اعتماد المهارة
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isMutating}
              onClick={() =>
                adjustMutation.mutate({
                  skillProfileId: selectedSkill.skillProfileId,
                  payload: {
                    proficiency: selectedProficiency,
                    notes: selectedNotes.trim() || undefined,
                  },
                })
              }
            >
              <SlidersHorizontal className="size-4" />
              حفظ تعديل المستوى فقط
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isMutating || selectedNotes.trim().length === 0}
              onClick={() =>
                rejectMutation.mutate({
                  skillProfileId: selectedSkill.skillProfileId,
                  payload: { notes: selectedNotes.trim() },
                })
              }
            >
              <CircleSlash className="size-4" />
              رفض المهارة
            </Button>
          </div>

          {(approveMutation.data ?? rejectMutation.data ?? adjustMutation.data) && (
            <div className="mt-5 rounded-input border border-primary/30 bg-primary/10 p-3 text-sm leading-6 text-foreground">
              <Save className="mb-2 size-4 text-primary" />
              تم حفظ القرار وتسجيله في سجل المراجعة.
              {(approveMutation.data ?? rejectMutation.data)?.notification && (
                <span className="mt-1 block text-xs text-muted-foreground">
                  تم إنشاء إشعار للمساهم. realtime:{" "}
                  {(approveMutation.data ?? rejectMutation.data)?.notification
                    ?.deliveredRealtime
                    ? "وصل الآن"
                    : "سيظهر عند فتح الحساب"}
                </span>
              )}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

function EvidencePanel({ skill }: { skill: PendingSkillReviewItemDto }) {
  return (
    <section className="rounded-card border border-border bg-card p-5">
      <p className="font-mono text-[12px] tracking-[0.65px] text-muted-foreground">
        Evidence
      </p>
      <h2 className="mt-2 text-2xl font-bold text-foreground">
        {skill.skillName}
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <Info label="اقتراح AI" value={PROFICIENCY_LABEL[skill.proficiencyLevel]} />
        <Info label="الثقة" value={formatConfidence(skill.confidence)} />
      </div>

      <div className="mt-5 rounded-input border border-border bg-background p-4">
        <h3 className="font-semibold text-foreground">ملخص الأدلة</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {skill.evidenceSummary ?? "لا يوجد ملخص أدلة مفصل لهذه المهارة."}
        </p>
      </div>

      <div className="mt-4 rounded-input border border-border bg-background p-4">
        <h3 className="font-semibold text-foreground">المصادر</h3>
        <p dir="ltr" className="mt-2 break-words font-mono text-[12px] leading-6 text-muted-foreground">
          {renderEvidenceSources(skill.evidenceSources)}
        </p>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-input border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-input border border-border bg-card px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}
