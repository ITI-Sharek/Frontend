import { Clock3, Github, LogOut, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Avatar } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";

import { ContributorGithubSkillsSection } from "./contributor-github-skills-section";
import { ContributorProfileCompletion } from "./contributor-profile-completion";
import { ContributorProfileSections } from "./contributor-profile-sections";
import { ContributorReputationStrip } from "./contributor-reputation-strip";
import type { ContributorProfileDto } from "../types/contributor-profile.types";

/**
 * Public contributor profile (screen-inventory §1.8).
 *
 * The header is treated as a letterhead rather than as a hero banner: a band
 * of brand indigo carrying the mark's dot texture, with the identity block
 * breaking across its lower edge. It gives the page the weight of a record
 * that was issued, which is what a verified contributor profile is — and it
 * avoids the gradient-hero-with-centred-avatar that every dashboard template
 * ships with.
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
  const githubConnected =
    profile.githubStatus.connected && Boolean(profile.githubStatus.username);

  return (
    <div className="mx-auto grid w-full max-w-[1240px] gap-4 px-4 py-6 md:px-6 md:py-8 lg:grid-cols-4">
      <header className="sk-hero border-0 lg:col-span-3">
        {/*
         * Letterhead band. The identity block breaks across its lower edge, so
         * the page reads as a record that was issued rather than as a profile
         * card floating on a page.
         */}
        <div className="relative h-[104px]">
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-0.5 bg-evidence-teal"
          />
        </div>
        <div className="bg-card">

        <div className="flex flex-col gap-5 px-5 pb-5 md:flex-row md:items-end md:justify-between md:px-7 md:pb-6">
          <div className="flex min-w-0 items-end gap-4">
            <span className="-mt-11 shrink-0 rounded-full bg-card p-1 shadow-[var(--shadow-raised)]">
              <Avatar
                src={profile.avatarUrl}
                alt={profile.displayName}
                size="xl"
                fallback={profile.displayName.slice(0, 1)}
                online={githubConnected ? true : undefined}
              />
            </span>

            <div className="min-w-0 pb-0.5">
              <h1 className="bidi truncate text-[26px] font-extrabold leading-tight tracking-tight text-foreground md:text-[32px]">
                {profile.displayName}
              </h1>
              <p
                dir="ltr"
                className="mt-0.5 truncate font-mono text-[13px] text-primary"
              >
                @{profile.username}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full border border-border bg-surface-fog px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              {profile.viewerRelationship === "owner"
                ? t("contributor.profileView.ownLabel")
                : t("contributor.profileView.publicLabel")}
            </span>
            {profile.viewerRelationship === "owner" && onLogout && (
              <Button type="button" variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="size-4" />
                <span>{t("contributor.profileView.logout")}</span>
              </Button>
            )}
          </div>
        </div>

        {/*
         * The meta strip sits on its own tinted rule beneath the identity so
         * the facts about the person are visually separate from the person.
         */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border bg-surface-fog px-5 py-3 text-[13px] text-muted-foreground md:px-7">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
            {profile.roleLabel}
          </span>

          {profile.availability ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-4 shrink-0 text-subtle-foreground" aria-hidden />
              {profile.availability}
            </span>
          ) : null}

          {githubConnected ? (
            <a
              dir="ltr"
              href={`https://github.com/${profile.githubStatus.username}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="size-4 shrink-0" aria-hidden />
              github.com/{profile.githubStatus.username}
            </a>
          ) : null}
        </div>
        </div>
      </header>

      <div className="lg:col-span-1 lg:row-span-2">
        <ContributorReputationStrip profile={profile} />
      </div>

      <div className="flex flex-col gap-4 lg:col-span-3">
        <ContributorProfileCompletion profile={profile} />
        <ContributorGithubSkillsSection profile={profile} />
        <ContributorProfileSections profile={profile} />
      </div>
    </div>
  );
}
