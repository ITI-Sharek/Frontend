import {
  BadgeCheck,
  ChevronDown,
  CircleAlert,
  CircleSlash,
  Clock,
  FolderGit2,
  UserRound,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

import { ContributorProfileEmptyState } from "./contributor-profile-empty-state";
import { getExperienceRangeLabel } from "../constants/profile-options.constants";
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

type ProfileTabId = "about" | "skills" | "contributions";

const TABS: {
  id: ProfileTabId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: "about", label: "البيانات الشخصية", icon: UserRound },
  { id: "skills", label: "المهارات", icon: Wrench },
  { id: "contributions", label: "المساهمات", icon: FolderGit2 },
];

/**
 * Profile content as tabs (à la Mostaql): personal data / skills with review
 * status / contribution history. Inactive panels stay in the DOM (`hidden`)
 * so the full content renders server-side and stays crawlable.
 */
export function ContributorProfileSections({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  const [activeTab, setActiveTab] = useState<ProfileTabId>("about");
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
    <div className="flex h-full flex-col overflow-hidden rounded-card border border-border bg-card">
      <div
        role="tablist"
        aria-label="أقسام الملف الشخصي"
        className="flex border-b border-border bg-background"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`profile-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`profile-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm transition-colors",
                isActive
                  ? "-mb-px border-primary bg-card font-bold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ——— البيانات الشخصية ——— */}
      <div
        role="tabpanel"
        id="profile-panel-about"
        aria-labelledby="profile-tab-about"
        hidden={activeTab !== "about"}
        className="flex-1 p-6"
      >
        <h2 className="text-lg font-bold text-foreground">نبذة عني</h2>
        {sections.hasBio ? (
          <p className="mt-3 max-w-prose leading-8 text-muted-foreground">
            {profile.bio}
          </p>
        ) : (
          <ContributorProfileEmptyState
            title="أضف نبذة تعريفية"
            description="اكتب ملخصاً قصيراً يوضح خبراتك وما تحب المساهمة فيه."
          />
        )}

        <dl className="mt-6 grid gap-x-8 gap-y-3 border-t border-border pt-5 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">الدور</dt>
            <dd className="font-medium text-foreground">{profile.roleLabel}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">الإتاحة</dt>
            <dd className="font-medium text-foreground">
              {profile.availability ?? "غير محددة"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">حساب GitHub</dt>
            <dd className="font-medium text-foreground">
              {profile.githubStatus.connected &&
              profile.githubStatus.username ? (
                <a
                  dir="ltr"
                  href={`https://github.com/${profile.githubStatus.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[13px] tracking-[0.65px] text-primary hover:opacity-80"
                >
                  @{profile.githubStatus.username}
                </a>
              ) : (
                "غير متصل"
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">اسم المستخدم</dt>
            <dd dir="ltr" className="font-mono text-[13px] tracking-[0.65px] text-foreground">
              @{profile.username}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">مستوى الخبرة</dt>
            <dd className="font-medium text-foreground">
              {getExperienceRangeLabel(profile.experienceRange) ?? "غير محدد"}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 sm:col-span-2">
            <dt className="shrink-0 text-muted-foreground">مجالات الاهتمام</dt>
            <dd className="text-end font-medium text-foreground">
              {profile.fields.length > 0 ? (
                profile.fields.map((field) => field.labelAr).join("، ")
              ) : (
                "غير محددة"
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* ——— المهارات ——— */}
      <div
        role="tabpanel"
        id="profile-panel-skills"
        aria-labelledby="profile-tab-skills"
        hidden={activeTab !== "skills"}
        className="flex-1 p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">مهاراتي</h2>
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

        {profile.declaredSkills.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-3 font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
              مهارات أضفتها بنفسك — غير موثقة بواسطة GitHub
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.declaredSkills.map((skill) => (
                <span
                  key={skill}
                  dir="ltr"
                  className="rounded-full border border-border bg-background px-3 py-1.5 font-mono text-[13px] tracking-[0.65px] text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ——— المساهمات ——— */}
      <div
        role="tabpanel"
        id="profile-panel-contributions"
        aria-labelledby="profile-tab-contributions"
        hidden={activeTab !== "contributions"}
        className="flex-1 p-6"
      >
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
                  className="absolute -start-[7px] top-1 size-3 rounded-full border-2 border-card bg-evidence-teal"
                />
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                {item.role && (
                  <p className="mt-1 text-sm text-evidence-teal">{item.role}</p>
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
      </div>
    </div>
  );
}

/**
 * Verified skill row: proficiency + labeled confidence + evidence expander.
 * Verified and unverified skills must never look identical.
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
      <span className="inline-flex items-center gap-1 text-xs text-evidence-teal">
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
      <div className="flex flex-wrap items-center gap-3 rounded-input border border-evidence-teal/40 bg-evidence-teal/5 px-4 py-3">
        {header}
      </div>
    );
  }

  return (
    <details className="group rounded-input border border-evidence-teal/40 bg-evidence-teal/5">
      <summary className="flex cursor-pointer flex-wrap items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        {header}
        <span className="ms-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
          الأدلة
          <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <p className="border-t border-evidence-teal/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
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
