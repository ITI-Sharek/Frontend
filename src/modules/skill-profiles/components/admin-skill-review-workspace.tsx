import {
  ArrowRight,
  BadgeCheck,
  CircleSlash,
  ClipboardList,
  Save,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
import {
  PageContainer,
  PageFeedback,
  PageHeader,
} from "@/shared/components/layout/page-layout";
import { Button } from "@/shared/components/ui/button";

import {
  formatConfidence,
  formatWaitingAge,
  getProficiencyLabel,
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
  const { t } = useTranslation();
  const groups = useMemo(
    () => groupPendingSkillReviews(t, reviews.items),
    [t, reviews.items],
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
      <PageContainer>
        <PageFeedback
          icon={ClipboardList}
          title={t("skillProfile.reviewWorkspace.notFoundTitle")}
          description={t("skillProfile.reviewWorkspace.notFoundDescription")}
          action={
            <Button asChild variant="outline">
              <Link to={ROUTES.adminSkillReviews}>
                {t("skillProfile.reviewWorkspace.backToList")}
              </Link>
            </Button>
          }
        />
      </PageContainer>
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
    <PageContainer className="max-w-7xl">
      <PageHeader
        title={t("skillProfile.reviewWorkspace.reviewTitle", {
          contributorName: group.contributorName,
        })}
        description={
          group.contributorUsername
            ? `@${group.contributorUsername}`
            : group.contributorId
        }
        actions={
          <Link
            to={ROUTES.adminSkillReviews}
            className="inline-flex min-h-10 items-center gap-2 rounded-input px-3 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-border/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
            {t("skillProfile.reviewWorkspace.backToQueue")}
          </Link>
        }
      />

      <dl className="mt-5 grid overflow-hidden rounded-card border border-border bg-card sm:grid-cols-3">
        <Metric
          label={t("skillProfile.reviewWorkspace.pendingSkillsMetric")}
          value={group.skills.length.toString()}
        />
        <Metric
          label={t("skillProfile.reviewWorkspace.averageConfidenceMetric")}
          value={formatConfidence(group.averageConfidence)}
        />
        <Metric
          label={t("skillProfile.reviewWorkspace.waitingAgeMetric")}
          value={formatWaitingAge(t, group.oldestCreatedAt)}
        />
      </dl>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1.2fr] xl:grid-cols-[0.9fr_1.2fr_0.8fr]">
        <section
          className="overflow-hidden rounded-card border border-border bg-card"
          aria-labelledby="pending-skills-heading"
        >
          <div className="border-b border-border p-4">
            <h2 id="pending-skills-heading" className="font-bold text-foreground">
              {t("skillProfile.reviewWorkspace.pendingSkillsTitle")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("skillProfile.reviewWorkspace.pendingSkillsHelp")}
            </p>
          </div>
          <div className="flex max-h-[32rem] flex-col overflow-y-auto">
            {group.skills.map((skill) => (
              <button
                key={skill.skillProfileId}
                type="button"
                aria-pressed={
                  skill.skillProfileId === selectedSkill.skillProfileId
                }
                onClick={() => setSelectedSkillId(skill.skillProfileId)}
                className={cn(
                  "border-b border-border p-4 text-right transition-colors duration-150 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                  skill.skillProfileId === selectedSkill.skillProfileId
                    ? "bg-primary/10"
                    : "hover:bg-border/20",
                )}
              >
                <span className="block break-words font-semibold text-foreground">
                  {skill.skillName}
                </span>
                <span className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{getProficiencyLabel(t, skill.proficiencyLevel)}</span>
                  <span dir="ltr" className="font-mono">
                    {formatConfidence(skill.confidence)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <EvidencePanel skill={selectedSkill} t={t} />

        <aside className="rounded-card border border-border bg-card p-4 md:col-span-2 xl:col-span-1">
          <h2 className="text-lg font-bold text-foreground">
            {t("skillProfile.reviewWorkspace.reviewDecisionTitle")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("skillProfile.reviewWorkspace.reviewDecisionHelp")}
          </p>

          <label className="mt-5 block text-sm font-semibold text-foreground">
            {t("skillProfile.reviewWorkspace.proficiencyLabel")}
            <select
              name="review-proficiency"
              value={selectedProficiency}
              onChange={(event) =>
                setSkillProficiency(
                  selectedSkill.skillProfileId,
                  event.target.value as SkillProfileReviewProficiency,
                )
              }
              className="mt-2 min-h-11 w-full rounded-input border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {PROFICIENCY_OPTIONS.map((proficiency) => (
                <option key={proficiency} value={proficiency}>
                  {getProficiencyLabel(t, proficiency)}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block text-sm font-semibold text-foreground">
            {t("skillProfile.reviewWorkspace.notesLabel")}
            <textarea
              name="review-notes"
              autoComplete="off"
              value={selectedNotes}
              onChange={(event) =>
                setSkillNotes(selectedSkill.skillProfileId, event.target.value)
              }
              rows={5}
              className="mt-2 w-full resize-y rounded-input border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground placeholder:text-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder={t("skillProfile.reviewWorkspace.notesPlaceholder")}
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
              <BadgeCheck className="size-4" aria-hidden="true" />
              {approveMutation.isPending
                ? t("skillProfile.reviewWorkspace.approving")
                : t("skillProfile.reviewWorkspace.approve")}
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
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              {adjustMutation.isPending
                ? t("skillProfile.reviewWorkspace.saving")
                : t("skillProfile.reviewWorkspace.saveProficiency")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isMutating || selectedNotes.trim().length === 0}
              onClick={() =>
                rejectMutation.mutate({
                  skillProfileId: selectedSkill.skillProfileId,
                  payload: { notes: selectedNotes.trim() },
                })
              }
            >
              <CircleSlash className="size-4" aria-hidden="true" />
              {rejectMutation.isPending
                ? t("skillProfile.reviewWorkspace.rejecting")
                : t("skillProfile.reviewWorkspace.reject")}
            </Button>
          </div>

          {(approveMutation.data ?? rejectMutation.data ?? adjustMutation.data) && (
            <div
              role="status"
              aria-live="polite"
              className="mt-5 rounded-input border border-primary/30 bg-primary/10 p-3 text-sm leading-6 text-foreground"
            >
              <Save className="mb-2 size-4 text-primary" aria-hidden="true" />
              {t("skillProfile.reviewWorkspace.saved")}
              {(approveMutation.data ?? rejectMutation.data)?.notification && (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {t("skillProfile.reviewWorkspace.notificationCreated")}
                  {(approveMutation.data ?? rejectMutation.data)?.notification
                    ?.deliveredRealtime
                    ? t("skillProfile.reviewWorkspace.deliveredNow")
                    : t("skillProfile.reviewWorkspace.deliveredLater")}
                </span>
              )}
            </div>
          )}
        </aside>
      </div>
    </PageContainer>
  );
}

function EvidencePanel({
  skill,
  t,
}: {
  skill: PendingSkillReviewItemDto;
  t: TFunction;
}) {
  return (
    <section className="rounded-card border border-border bg-card p-5">
      <p className="text-xs font-semibold text-muted-foreground">
        {t("skillProfile.reviewWorkspace.evidenceLabel")}
      </p>
      <h2 className="mt-2 break-words text-xl font-bold text-foreground">
        {skill.skillName}
      </h2>
      <dl className="mt-4 grid grid-cols-2 overflow-hidden rounded-input border border-border text-sm">
        <Info
          label={t("skillProfile.reviewWorkspace.aiSuggestion")}
          value={getProficiencyLabel(t, skill.proficiencyLevel)}
        />
        <Info
          label={t("skillProfile.reviewWorkspace.confidence")}
          value={formatConfidence(skill.confidence)}
        />
      </dl>

      <div className="mt-5 border-t border-border pt-4">
        <h3 className="font-semibold text-foreground">
          {t("skillProfile.reviewWorkspace.evidenceSummaryTitle")}
        </h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {skill.evidenceSummary ??
            t("skillProfile.reviewWorkspace.noEvidenceSummary")}
        </p>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <h3 className="font-semibold text-foreground">
          {t("skillProfile.reviewWorkspace.sourcesTitle")}
        </h3>
        <p dir="ltr" className="mt-2 break-words font-mono text-[12px] leading-6 text-muted-foreground">
          {renderEvidenceSources(t, skill.evidenceSources)}
        </p>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-e border-border p-3 last:border-e-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-e sm:first:border-e-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}
