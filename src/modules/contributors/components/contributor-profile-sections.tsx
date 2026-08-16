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
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

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

const PROFICIENCY_LABEL_KEYS: Record<
  ContributorSkillDto["proficiencyLevel"],
  string
> = {
  beginner: "contributor.profile.proficiencyBeginner",
  intermediate: "contributor.profile.proficiencyIntermediate",
  advanced: "contributor.profile.proficiencyAdvanced",
};

/** WF-06: confidence renders as a labeled band, never a bare decimal. */
function confidenceLabel(t: TFunction, confidence: number): string {
  if (confidence >= 0.8) return t("contributor.profile.confidenceHigh");
  if (confidence >= 0.5) return t("contributor.profile.confidenceMedium");
  return t("contributor.profile.confidenceLow");
}

const UNVERIFIED_STATUS_META: Record<
  Exclude<ContributorSkillDto["status"], "approved">,
  { icon: ComponentType<{ className?: string }>; labelKey: string }
> = {
  pending: { icon: Clock, labelKey: "contributor.profile.skillStatusPending" },
  rejected: { icon: CircleSlash, labelKey: "contributor.profile.skillStatusRejected" },
  disputed: { icon: CircleAlert, labelKey: "contributor.profile.skillStatusDisputed" },
};

type ProfileTabId = "about" | "skills" | "contributions";

const TABS: {
  id: ProfileTabId;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: "about", labelKey: "contributor.profile.tabAbout", icon: UserRound },
  { id: "skills", labelKey: "contributor.profile.tabSkills", icon: Wrench },
  {
    id: "contributions",
    labelKey: "contributor.profile.tabContributions",
    icon: FolderGit2,
  },
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
  const { t } = useTranslation();
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
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        if (value === "about" || value === "skills" || value === "contributions") {
          setActiveTab(value);
        }
      }}
      className="h-full gap-0 overflow-hidden rounded-card border border-border bg-card"
    >
      <TabsList
        variant="line"
        aria-label={t("contributor.profile.tabsAriaLabel")}
        className="flex w-full justify-start rounded-none border-b border-border bg-background"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              id={`profile-tab-${tab.id}`}
              className="-mb-px flex min-h-12 flex-none items-center gap-2 px-5 py-3.5 data-[state=active]:bg-card data-[state=active]:text-foreground"
            >
              <Icon className="size-4" aria-hidden="true" />
              {t(tab.labelKey)}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* ——— البيانات الشخصية ——— */}
      <TabsContent
        value="about"
        forceMount
        id="profile-panel-about"
        aria-labelledby="profile-tab-about"
        className="flex-1 p-6"
      >
        <h2 className="text-lg font-bold text-foreground">{t("contributor.profile.aboutTitle")}</h2>
        {sections.hasBio ? (
          <p className="mt-3 max-w-prose leading-8 text-muted-foreground">
            {profile.bio}
          </p>
        ) : (
          <ContributorProfileEmptyState
            title={t("contributor.profile.aboutEmptyTitle")}
            description={t("contributor.profile.aboutEmptyDescription")}
          />
        )}

        <dl className="mt-6 grid gap-x-8 gap-y-3 border-t border-border pt-5 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{t("contributor.profile.roleLabel")}</dt>
            <dd className="font-medium text-foreground">{profile.roleLabel}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{t("contributor.profile.availabilityLabel")}</dt>
            <dd className="font-medium text-foreground">
              {profile.availability ?? t("contributor.profile.unspecified")}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{t("contributor.profile.githubAccountLabel")}</dt>
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
                t("contributor.githubStatus.disconnected")
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{t("contributor.profile.usernameLabel")}</dt>
            <dd dir="ltr" className="font-mono text-[13px] tracking-[0.65px] text-foreground">
              @{profile.username}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{t("contributor.profile.experienceLevelLabel")}</dt>
            <dd className="font-medium text-foreground">
              {profile.experienceLevel?.labelAr ?? t("contributor.profile.experienceLevelUnspecified")}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 sm:col-span-2">
            <dt className="shrink-0 text-muted-foreground">{t("contributor.profile.fieldsLabel")}</dt>
            <dd className="text-end font-medium text-foreground">
              {profile.fields.length > 0 ? (
                profile.fields.map((field) => field.labelAr).join(t("contributor.profile.fieldsSeparator"))
              ) : (
                t("contributor.profile.unspecified")
              )}
            </dd>
          </div>
        </dl>
      </TabsContent>

      {/* ——— المهارات ——— */}
      <TabsContent
        value="skills"
        forceMount
        id="profile-panel-skills"
        aria-labelledby="profile-tab-skills"
        className="flex-1 p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">{t("contributor.profile.skillsTitle")}</h2>
          {verifiedSkills.length > 0 && (
            <span className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
              {t("contributor.profile.verifiedCount", { count: verifiedSkills.length })}
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
                {t("contributor.profile.skillsInReview")}
              </p>
            )}

            {showUnverified && (
              <div className="mt-2 border-t border-border pt-4">
                <p className="mb-3 font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
                  {t("contributor.profile.unverifiedOnlyYou")}
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
            title={t("contributor.profile.skillsEmptyTitle")}
            description={t("contributor.profile.skillsEmptyDescription")}
          />
        )}

        {profile.declaredSkills.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-3 font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
              {t("contributor.profile.declaredSkillsLabel")}
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
      </TabsContent>

      {/* ——— المساهمات ——— */}
      <TabsContent
        value="contributions"
        forceMount
        id="profile-panel-contributions"
        aria-labelledby="profile-tab-contributions"
        className="flex-1 p-6"
      >
        <h2 className="text-lg font-bold text-foreground">{t("contributor.profile.contributionsTitle")}</h2>
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
            title={t("contributor.profile.contributionsEmptyTitle")}
            description={t("contributor.profile.contributionsEmptyDescription")}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

/**
 * Verified skill row: proficiency + labeled confidence + evidence expander.
 * Verified and unverified skills must never look identical.
 */
function VerifiedSkillRow({ skill }: { skill: ContributorSkillDto }) {
  const { t } = useTranslation();
  const hasEvidence =
    skill.evidenceSummary !== null && skill.evidenceSummary.trim() !== "";

  const header = (
    <>
      <span dir="ltr" className="font-mono text-sm tracking-[0.65px] text-foreground">
        {skill.name}
      </span>
      <span className="text-xs text-muted-foreground">
        {t(PROFICIENCY_LABEL_KEYS[skill.proficiencyLevel])}
      </span>
      <span className="inline-flex items-center gap-1 text-xs text-evidence-teal">
        <BadgeCheck className="size-3.5" />
        {t("contributor.profile.verifiedBadge")}
      </span>
      <span className="font-mono text-[11px] tracking-[0.65px] text-muted-foreground">
        {t("contributor.profile.confidence", {
          confidence: confidenceLabel(t, skill.confidence),
        })}
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
          {t("contributor.profile.evidenceLabel")}
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
  const { t } = useTranslation();
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
        {t(meta.labelKey)}
      </span>
    </span>
  );
}
