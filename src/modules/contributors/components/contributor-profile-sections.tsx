import {
  BadgeCheck,
  ChevronDown,
  CircleAlert,
  CircleSlash,
  Clock,
} from "lucide-react";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

import { ContributorProfileEmptyState } from "./contributor-profile-empty-state";
import type {
  ContributorProfileDto,
  ContributorSkillDto,
} from "../types/contributor-profile.types";

export function getVisibleCompletionPrompts(profile: ContributorProfileDto) {
  return profile.viewerRelationship === "owner" ? profile.completionPrompts : [];
}

export function getPublicProfileSections(profile: ContributorProfileDto) {
  return {
    hasSkills: profile.skills.length > 0,
    hasHistory: profile.contributionHistory.length > 0,
    hasBio: profile.bio !== null && profile.bio.trim() !== "",
    hasAvailability:
      profile.availability !== null && profile.availability.trim() !== "",
  };
}

const PROFICIENCY_LABEL: Record<
  ContributorSkillDto["proficiencyLevel"],
  string
> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

/** WF-06: confidence renders as a labeled band, never a bare decimal. */
function confidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return "عالية";
  if (confidence >= 0.5) return "متوسطة";
  return "منخفضة";
}

const UNVERIFIED_STATUS_META: Record<
  Exclude<ContributorSkillDto["status"], "approved">,
  { icon: ComponentType<{ className?: string }>; label: string }
> = {
  pending: { icon: Clock, label: "قيد المراجعة" },
  rejected: { icon: CircleSlash, label: "غير معتمدة" },
  disputed: { icon: CircleAlert, label: "قيد الاعتراض" },
};

/**
 * Verified skill row (screen-inventory §1.8: proficiency + evidence
 * expander). Verified and unverified skills must never look identical.
 */
function VerifiedSkillRow({ skill }: { skill: ContributorSkillDto }) {
  const hasEvidence =
    skill.evidenceSummary !== null && skill.evidenceSummary.trim() !== "";

  const header = (
    <>
      <span dir="ltr" className="font-mono text-sm tracking-[0.65px] text-foreground">
        {skill.name}
      </span>
      <span className="text-xs text-muted-foreground">
        {PROFICIENCY_LABEL[skill.proficiencyLevel]}
      </span>
      <span className="inline-flex items-center gap-1 text-xs text-primary">
        <BadgeCheck className="size-3.5" />
        موثقة
      </span>
      <span className="font-mono text-[11px] tracking-[0.65px] text-muted-foreground">
        الثقة: {confidenceLabel(skill.confidence)}
      </span>
    </>
  );

  if (!hasEvidence) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-input border border-primary/40 bg-primary/5 px-4 py-3">
        {header}
      </div>
    );
  }

  return (
    <details className="group rounded-input border border-primary/40 bg-primary/5">
      <summary className="flex cursor-pointer flex-wrap items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        {header}
        <span className="ms-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
          الأدلة
          <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <p className="border-t border-primary/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
        {skill.evidenceSummary}
      </p>
    </details>
  );
}

function UnverifiedSkillChip({ skill }: { skill: ContributorSkillDto }) {
  if (skill.status === "approved") return null;
  const meta = UNVERIFIED_STATUS_META[skill.status];
  const StatusIcon = meta.icon;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground">
      <span dir="ltr" className="font-mono text-[13px] tracking-[0.65px]">
        {skill.name}
      </span>
      <span className="inline-flex items-center gap-1 text-xs">
        <StatusIcon className="size-3.5" />
        {meta.label}
      </span>
    </span>
  );
}

export function ContributorProfileSections({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  const sections = getPublicProfileSections(profile);
  const verifiedSkills = profile.skills.filter(
    (skill) => skill.status === "approved",
  );
  const unverifiedSkills = profile.skills.filter(
    (skill) => skill.status !== "approved",
  );
  const showUnverified =
    profile.viewerRelationship === "owner" && unverifiedSkills.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-card border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">نبذة</h2>
        {sections.hasBio ? (
          <p className="mt-3 leading-8 text-muted-foreground">{profile.bio}</p>
        ) : (
          <ContributorProfileEmptyState
            title="أضف نبذة تعريفية"
            description="اكتب ملخصاً قصيراً يوضح خبراتك وما تحب المساهمة فيه."
          />
        )}
      </section>

      <section className="rounded-card border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">المهارات الموثقة</h2>
          {verifiedSkills.length > 0 && (
            <span className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
              {verifiedSkills.length} موثقة
            </span>
          )}
        </div>

        {sections.hasSkills ? (
          <div className="mt-4 flex flex-col gap-2.5">
            {verifiedSkills.map((skill, index) => (
              <VerifiedSkillRow key={`${skill.name}-${index}`} skill={skill} />
            ))}

            {verifiedSkills.length === 0 && (
              <p className="text-sm leading-6 text-muted-foreground">
                مهاراتك قيد المراجعة — تظهر هنا موثقةً بعد اعتماد فريق المراجعة.
              </p>
            )}

            {showUnverified && (
              <div className="mt-2 border-t border-border pt-4">
                <p className="mb-3 font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
                  غير موثقة بعد — تظهر لك فقط
                </p>
                <div className="flex flex-wrap gap-2">
                  {unverifiedSkills.map((skill, index) => (
                    <UnverifiedSkillChip
                      key={`${skill.name}-${skill.status}-${index}`}
                      skill={skill}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <ContributorProfileEmptyState
            title="لا توجد مهارات بعد"
            description="إضافة المهارات تساعد أصحاب المشاريع على فهم نقاط قوتك بسرعة."
          />
        )}
      </section>

      <section className="rounded-card border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">المساهمات</h2>
        {sections.hasHistory ? (
          <ol className="mt-4 flex flex-col">
            {profile.contributionHistory.map((item, index) => (
              <li
                key={item.id}
                className={cn(
                  "relative border-s-2 border-border ps-5 pb-5",
                  index === profile.contributionHistory.length - 1 &&
                    "border-s-transparent pb-0",
                )}
              >
                <span
                  aria-hidden
                  className="absolute -start-[7px] top-1 size-3 rounded-full border-2 border-card bg-primary"
                />
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                {item.role && (
                  <p className="mt-1 text-sm text-primary">{item.role}</p>
                )}
                {item.description && (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <ContributorProfileEmptyState
            title="لا توجد مساهمات منشورة"
            description="ستظهر هنا المشاريع والمهام التي ساهمت فيها بعد توثيقها."
          />
        )}
      </section>
    </div>
  );
}
