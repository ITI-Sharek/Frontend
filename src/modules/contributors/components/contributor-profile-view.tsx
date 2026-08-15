import {
  BadgeCheck,
  Eye,
  EyeOff,
  ExternalLink,
  Github,
  LogOut,
  Pencil,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { Avatar } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";

import { ContributorGithubSkillsSection } from "./contributor-github-skills-section";
import { ContributorProfileCompletion } from "./contributor-profile-completion";
import { ContributorProfileSections } from "./contributor-profile-sections";
import { ContributorReputationStrip } from "./contributor-reputation-strip";
import type {
  ContributorProfileDto,
  ContributorSkillDto,
} from "../types/contributor-profile.types";

/**
 * Public contributor profile (screen-inventory §1.8). The page is arranged
 * as a small registry: identity and reputation stay visible on the left,
 * the contribution record is the primary reading surface, and quick facts
 * plus verified skills remain available in the right rail. Mobile stacks the
 * same regions without hiding any of the information.
 */
export function ContributorProfileView({
  profile,
  onLogout,
}: {
  profile: ContributorProfileDto;
  /** Injected by the route. Optional so public/viewer contexts can omit it. */
  onLogout?: () => void;
}) {
  const { t } = useTranslation();
  const [isVisitorPreview, setIsVisitorPreview] = useState(false);
  const canPreviewVisitorView = profile.viewerRelationship === "owner";
  const profileForView = isVisitorPreview
    ? getVisitorProfilePreview(profile)
    : profile;
  const verifiedSkills = profileForView.skills.filter(
    (skill) => skill.status === "approved",
  );

  return (
    <div className="mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-5 md:py-6 lg:px-6">
      {canPreviewVisitorView && (
        <ProfileViewModeBar
          isVisitorPreview={isVisitorPreview}
          onToggle={() => setIsVisitorPreview((current) => !current)}
        />
      )}
      <ProfileCover />

      <div className="relative -mt-14 grid items-start gap-4 px-1 sm:-mt-16 sm:px-2 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="min-w-0 space-y-4">
          <ProfileIdentityCard
            profile={profileForView}
            onLogout={isVisitorPreview ? undefined : onLogout}
          />
          <ContributorReputationStrip profile={profileForView} />
        </aside>

        <section className="min-w-0 space-y-4" aria-label={t("contributor.profile.tabsAriaLabel")}>
          <div className="flex items-center justify-between gap-3 px-1">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
                {t("contributor.profileView.recordEyebrow")}
              </p>
              <h2 className="mt-1 text-xl font-bold text-foreground">
                {t("contributor.profile.contributionsTitle")}
              </h2>
            </div>
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
              <ShieldCheck className="size-4 text-evidence-teal" />
              {t("contributor.profileView.verifiedProfile")}
            </span>
          </div>

          <ContributorProfileCompletion profile={profileForView} />
          <ContributorGithubSkillsSection profile={profileForView} />
          <ContributorProfileSections profile={profileForView} />
        </section>

        <aside className="min-w-0 space-y-4">
          <ProfileQuickFacts profile={profileForView} />
          <VerifiedSkillsPreview skills={verifiedSkills} totalSkills={profile.skills.length} />
        </aside>
      </div>
    </div>
  );
}

/**
 * Local preview adapter for an owner checking the public presentation. The
 * server remains the authority for real audience filtering; this adapter
 * keeps owner-only controls and claims out of the preview surface.
 */
export function getVisitorProfilePreview(
  profile: ContributorProfileDto,
): ContributorProfileDto {
  return {
    ...profile,
    viewerRelationship: "authenticated-viewer",
    completionPrompts: [],
    declaredSkills: [],
    githubInstallations: [],
    skills: profile.skills.filter((skill) => skill.status === "approved"),
  };
}

function ProfileViewModeBar({
  isVisitorPreview,
  onToggle,
}: {
  isVisitorPreview: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={
        isVisitorPreview
          ? "mb-3 flex flex-col gap-3 rounded-card border border-evidence-teal/35 bg-evidence-teal/10 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
          : "mb-3 flex flex-col gap-3 rounded-card border border-primary/25 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
      }
      aria-live="polite"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={
            isVisitorPreview
              ? "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-evidence-teal/15 text-evidence-teal"
              : "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          }
        >
          {isVisitorPreview ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {isVisitorPreview
              ? t("contributor.profileView.visitorPreview")
              : t("contributor.profileView.authenticatedView")}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            {isVisitorPreview
              ? t("contributor.profileView.visitorPreviewDescription")
              : t("contributor.profileView.authenticatedViewDescription")}
          </p>
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        variant={isVisitorPreview ? "outline" : "primary"}
        onClick={onToggle}
        aria-pressed={isVisitorPreview}
        className="shrink-0 self-start text-xs sm:self-center"
      >
        {isVisitorPreview ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        {isVisitorPreview
          ? t("contributor.profileView.exitVisitorView")
          : t("contributor.profileView.viewAsVisitor")}
      </Button>
    </div>
  );
}

function ProfileCover() {
  return (
    <div
      aria-hidden="true"
      className="relative h-32 overflow-hidden rounded-card border border-border bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-indigo)_22%,var(--card)),var(--card)_62%,color-mix(in_srgb,var(--evidence-teal)_12%,var(--card)))] sm:h-40"
    >
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(118deg,transparent_0%,transparent_42%,color-mix(in_srgb,var(--evidence-teal)_22%,transparent)_42.2%,transparent_42.5%,transparent_58%,color-mix(in_srgb,var(--brand-indigo)_18%,transparent)_58.2%,transparent_58.5%),linear-gradient(160deg,transparent_0%,transparent_68%,color-mix(in_srgb,var(--evidence-teal)_18%,transparent)_68.2%,transparent_68.5%)]" />
      <div className="absolute -end-16 -top-36 size-96 rounded-full border-[22px] border-evidence-teal/10 sm:-end-8 sm:-top-44" />
      <div className="absolute -start-24 -bottom-56 size-[26rem] rounded-full border-[18px] border-primary/10" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card/80 to-transparent" />
    </div>
  );
}

function ProfileIdentityCard({
  profile,
  onLogout,
}: {
  profile: ContributorProfileDto;
  onLogout?: () => void;
}) {
  const { t } = useTranslation();
  const hasVerifiedSkills = profile.skills.some(
    (skill) => skill.status === "approved",
  );

  return (
    <section
      className="relative rounded-card border border-border bg-card p-5 shadow-[0_12px_32px_rgba(14,21,19,0.10)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
      aria-labelledby="profile-identity-heading"
    >
      <div className="flex flex-col items-center text-center">
        <Avatar
          src={profile.avatarUrl}
          alt={profile.displayName}
          size="xl"
          fallback={profile.displayName.slice(0, 1)}
          online={profile.githubStatus.connected ? true : undefined}
          className="size-24 ring-4 ring-card"
        />
        <div className="mt-4 flex items-center gap-1.5">
          <h1 id="profile-identity-heading" className="text-xl font-bold text-foreground">
            {profile.displayName}
          </h1>
          {hasVerifiedSkills && (
            <BadgeCheck
              className="size-5 shrink-0 text-evidence-teal"
              aria-label={t("contributor.profileView.verifiedProfile")}
            />
          )}
        </div>
        <p dir="ltr" className="mt-1 flex items-center gap-1.5 font-mono text-xs tracking-[0.05em] text-primary">
          <UserRoundCheck className="size-3.5" />@{profile.username}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">{profile.roleLabel}</p>
        {profile.bio && <p className="mt-3 text-sm leading-6 text-muted-foreground">{profile.bio}</p>}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2 border-t border-border pt-4">
        <span className="rounded-full bg-surface-fog px-3 py-1.5 text-xs font-medium text-muted-foreground">
          {profile.viewerRelationship === "owner"
            ? t("contributor.profileView.ownLabel")
            : t("contributor.profileView.publicLabel")}
        </span>
        {hasVerifiedSkills && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-evidence-teal/10 px-3 py-1.5 text-xs font-medium text-evidence-teal">
            <ShieldCheck className="size-3.5" />
            {t("contributor.profileView.verifiedProfile")}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {profile.githubStatus.connected && profile.githubStatus.username && (
          <a
            dir="ltr"
            href={`https://github.com/${profile.githubStatus.username}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-input border border-border px-3 py-2 text-xs font-medium text-foreground hover:border-primary/40 hover:text-primary"
          >
            <Github className="size-4" />
            @{profile.githubStatus.username}
            <ExternalLink className="size-3.5 text-muted-foreground" />
          </a>
        )}
        {profile.viewerRelationship === "owner" && (
          <div className="grid grid-cols-2 gap-2">
            <Button asChild size="sm" variant="primary" className="text-xs">
              <Link to={ROUTES.settings} search={{ section: "profile" }}>
                <Pencil className="size-3.5" />
                {t("contributor.profileView.editProfile")}
              </Link>
            </Button>
            {onLogout && (
              <Button type="button" variant="outline" size="sm" className="text-xs" onClick={onLogout}>
                <LogOut className="size-3.5" />
                {t("contributor.profileView.logout")}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ProfileQuickFacts({ profile }: { profile: ContributorProfileDto }) {
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const fields = profile.fields
    .map((field) => (isArabic ? field.labelAr : field.labelEn))
    .join(t("contributor.profile.fieldsSeparator"));
  const experienceLevel = profile.experienceLevel
    ? isArabic
      ? profile.experienceLevel.labelAr
      : profile.experienceLevel.labelEn
    : t("contributor.profile.experienceLevelUnspecified");

  return (
    <section className="rounded-card border border-border bg-card p-5" aria-labelledby="profile-facts-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {t("contributor.profileView.quickFactsEyebrow")}
          </p>
          <h2 id="profile-facts-heading" className="mt-1 text-base font-bold text-foreground">
            {t("contributor.profile.aboutTitle")}
          </h2>
        </div>
        <UserRoundCheck className="size-5 text-primary" aria-hidden />
      </div>

      {profile.bio ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{profile.bio}</p>
      ) : (
        <p className="mt-4 rounded-input border border-dashed border-border p-3 text-sm leading-6 text-muted-foreground">
          {t("contributor.profile.aboutEmptyDescription")}
        </p>
      )}

      <dl className="mt-4 divide-y divide-border border-t border-border">
        <QuickFact label={t("contributor.profile.experienceLevelLabel")}>
          {experienceLevel}
        </QuickFact>
        <QuickFact label={t("contributor.profile.fieldsLabel")}>
          {fields || t("contributor.profile.unspecified")}
        </QuickFact>
        <QuickFact label={t("contributor.profile.availabilityLabel")}>
          {profile.availability ?? t("contributor.profile.unspecified")}
        </QuickFact>
        <QuickFact label={t("contributor.profile.githubAccountLabel")}>
          {profile.githubStatus.connected
            ? t("contributor.githubStatus.connected")
            : t("contributor.githubStatus.disconnected")}
        </QuickFact>
      </dl>
    </section>
  );
}

function QuickFact({ label, children }: { label: string; children: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-end font-medium text-foreground">{children}</dd>
    </div>
  );
}

function VerifiedSkillsPreview({
  skills,
  totalSkills,
}: {
  skills: ContributorSkillDto[];
  totalSkills: number;
}) {
  const { t } = useTranslation();

  return (
    <section className="rounded-card border border-border bg-card p-5" aria-labelledby="profile-skills-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {t("contributor.profileView.verifiedSkillsEyebrow")}
          </p>
          <h2 id="profile-skills-heading" className="mt-1 text-base font-bold text-foreground">
            {t("contributor.profile.skillsTitle")}
          </h2>
        </div>
        <span className="rounded-full bg-evidence-teal/10 px-2.5 py-1 text-xs font-semibold text-evidence-teal">
          {t("contributor.profile.verifiedCount", { count: skills.length })}
        </span>
      </div>

      {skills.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {skills.slice(0, 5).map((skill) => (
            <SkillPreviewRow key={skill.name} skill={skill} />
          ))}
          {skills.length > 5 && (
            <p className="pt-2 text-xs text-muted-foreground">
              +{skills.length - 5} {t("contributor.profileView.moreSkills")}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {totalSkills > 0
            ? t("contributor.profile.skillsInReview")
            : t("contributor.profile.skillsEmptyDescription")}
        </p>
      )}
    </section>
  );
}

function SkillPreviewRow({ skill }: { skill: ContributorSkillDto }) {
  const { t } = useTranslation();
  const proficiencyKey = {
    beginner: "contributor.profile.proficiencyBeginner",
    intermediate: "contributor.profile.proficiencyIntermediate",
    advanced: "contributor.profile.proficiencyAdvanced",
  } as const;

  return (
    <details className="group rounded-input border border-evidence-teal/25 bg-evidence-teal/[0.035]">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
        <BadgeCheck className="size-4 shrink-0 text-evidence-teal" />
        <span dir="ltr" className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
          {skill.name}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {t(proficiencyKey[skill.proficiencyLevel])}
        </span>
      </summary>
      {skill.evidenceSummary && (
        <p className="border-t border-evidence-teal/15 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
          {skill.evidenceSummary}
        </p>
      )}
    </details>
  );
}
