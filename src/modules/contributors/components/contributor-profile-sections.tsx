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
import { ShieldBadge } from "@/shared/components/data-display/shield-badge";
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

        {/*
         * A fact table, read down rather than across: each row is a hairline
         * with the label at the start edge and the value at the end, so the
         * values form a single column the eye can run down.
         */}
        <dl className="mt-6 grid gap-x-10 border-t border-border pt-1 text-sm sm:grid-cols-2">
          <FactRow label={t("contributor.profile.roleLabel")}>
            {profile.roleLabel}
          </FactRow>
          <FactRow label={t("contributor.profile.availabilityLabel")}>
            {profile.availability ?? t("contributor.profile.unspecified")}
          </FactRow>
          <FactRow label={t("contributor.profile.githubAccountLabel")}>
            {profile.githubStatus.connected && profile.githubStatus.username ? (
              <a
                dir="ltr"
                href={`https://github.com/${profile.githubStatus.username}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[13px] text-primary hover:underline"
              >
                @{profile.githubStatus.username}
              </a>
            ) : (
              <span className="text-muted-foreground">
                {t("contributor.githubStatus.disconnected")}
              </span>
            )}
          </FactRow>
          <FactRow label={t("contributor.profile.usernameLabel")}>
            <span dir="ltr" className="font-mono text-[13px]">
              @{profile.username}
            </span>
          </FactRow>
          <FactRow label={t("contributor.profile.experienceLevelLabel")}>
            {profile.experienceLevel?.labelAr ??
              t("contributor.profile.experienceLevelUnspecified")}
          </FactRow>
          <FactRow
            label={t("contributor.profile.fieldsLabel")}
            className="sm:col-span-2"
          >
            {profile.fields.length > 0
              ? profile.fields
                  .map((field) => field.labelAr)
                  .join(t("contributor.profile.fieldsSeparator"))
              : t("contributor.profile.unspecified")}
          </FactRow>
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
            <ShieldBadge
              icon={BadgeCheck}
              label={t("contributor.profile.verifiedBadge")}
              value={verifiedSkills.length}
              tone="verified"
            />
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

        {/*
         * Self-declared skills carry no evidence, so they are drawn with a
         * dashed edge and no teal anywhere — the same visual grammar as an
         * empty state. Nothing on this page should let an unverified claim
         * borrow the appearance of a verified one.
         */}
        {profile.declaredSkills.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-3 text-[13px] font-medium text-muted-foreground">
              {t("contributor.profile.declaredSkillsLabel")}
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.declaredSkills.map((skill) => (
                <span
                  key={skill}
                  dir="ltr"
                  className="rounded-full border border-dashed border-border-strong bg-surface-fog px-3 py-1.5 font-mono text-[13px] text-muted-foreground"
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
function FactRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-6 border-b border-border/70 py-2.5",
        className,
      )}
    >
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-end font-medium text-foreground">
        {children}
      </dd>
    </div>
  );
}

function VerifiedSkillRow({ skill }: { skill: ContributorSkillDto }) {
  const { t } = useTranslation();
  const hasEvidence =
    skill.evidenceSummary !== null && skill.evidenceSummary.trim() !== "";

  const header = (
    <>
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-evidence-teal text-white">
        <BadgeCheck className="size-3.5" />
      </span>

      <span
        dir="ltr"
        className="font-mono text-sm font-medium tracking-[0.4px] text-foreground"
      >
        {skill.name}
      </span>

      <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold text-muted-foreground ring-1 ring-inset ring-border">
        {t(PROFICIENCY_LABEL_KEYS[skill.proficiencyLevel])}
      </span>

      <ConfidenceGauge confidence={skill.confidence} />
    </>
  );

  if (!hasEvidence) {
    return (
      <div
        data-spine="verified"
        className="flex flex-wrap items-center gap-2.5 rounded-input rounded-s-sm border border-evidence-teal/25 bg-evidence-soft/60 px-3.5 py-3"
      >
        {header}
      </div>
    );
  }

  return (
    <details
      data-spine="verified"
      className="group rounded-input rounded-s-sm border border-evidence-teal/25 bg-evidence-soft/60"
    >
      <summary className="flex cursor-pointer flex-wrap items-center gap-2.5 px-3.5 py-3 [&::-webkit-details-marker]:hidden">
        {header}
        <span className="ms-auto inline-flex items-center gap-1 text-xs font-semibold text-evidence-soft-foreground">
          {t("contributor.profile.evidenceLabel")}
          <ChevronDown className="size-3.5 transition-transform duration-200 group-open:rotate-180" />
        </span>
      </summary>
      <p className="border-t border-evidence-teal/20 px-3.5 py-3 text-sm leading-7 text-muted-foreground">
        {skill.evidenceSummary}
      </p>
    </details>
  );
}

/**
 * Confidence arrives from the analyser as a decimal, which WF-06 forbids
 * showing raw. Three segments carry the band visually and the words carry it
 * for anyone who cannot see the segments — neither is decoration for the
 * other.
 */
function ConfidenceGauge({ confidence }: { confidence: number }) {
  const { t } = useTranslation();
  const level = confidence >= 0.8 ? 3 : confidence >= 0.5 ? 2 : 1;
  const label = t("contributor.profile.confidence", {
    confidence: confidenceLabel(t, confidence),
  });

  return (
    <span className="ms-auto inline-flex items-center gap-1.5" title={label}>
      <span className="flex items-end gap-[2px]" aria-hidden>
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={cn(
              "block w-[3px] rounded-[1px]",
              step === 1 ? "h-1.5" : step === 2 ? "h-2.5" : "h-3.5",
              step <= level ? "bg-evidence-teal" : "bg-border-strong",
            )}
          />
        ))}
      </span>
      <span className="text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
    </span>
  );
}

function UnverifiedSkillChip({ skill }: { skill: ContributorSkillDto }) {
  const { t } = useTranslation();
  if (skill.status === "approved") return null;
  const meta = UNVERIFIED_STATUS_META[skill.status];
  const StatusIcon = meta.icon;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-border-strong bg-surface-fog px-3 py-1.5 text-sm text-muted-foreground">
      <span dir="ltr" className="font-mono text-[13px]">
        {skill.name}
      </span>
      <span className="inline-flex items-center gap-1 text-xs font-medium">
        <StatusIcon className="size-3.5" />
        {t(meta.labelKey)}
      </span>
    </span>
  );
}
