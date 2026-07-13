import { Github, UserRoundCheck } from "lucide-react";

import { Avatar } from "@/shared/components/ui/avatar";
import { Card } from "@/shared/components/ui/card";

import { ContributorProfileCompletion } from "./contributor-profile-completion";
import { ContributorProfileSections } from "./contributor-profile-sections";
import { ContributorReputationStrip } from "./contributor-reputation-strip";
import type { ContributorProfileDto } from "../types/contributor-profile.types";

/**
 * Public contributor profile (screen-inventory §1.8) as a viewport-filling
 * grid: identity header + stats panel side by side on desktop, then the
 * content sections as columns — minimal vertical scroll. Mobile stacks.
 */
export function ContributorProfileView({
  profile,
  onConnectGitHub,
}: {
  profile: ContributorProfileDto;
  /**
   * Injected by the route (cross-module composition happens at the route
   * layer): starts the GitHub OAuth connect flow. Optional so public/viewer
   * contexts can omit it.
   */
  onConnectGitHub?: () => Promise<void>;
}) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 md:px-6 lg:grid-cols-4">
      <Card className="lg:col-span-3">
        <div className="flex h-full flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              src={profile.avatarUrl}
              alt={profile.displayName}
              size="xl"
              fallback={profile.displayName.slice(0, 1)}
              online={profile.githubStatus.connected ? true : undefined}
            />
            <div>
              <p
                dir="ltr"
                className="flex items-center justify-end gap-2 font-mono text-[13px] tracking-[0.65px] text-primary"
              >
                <UserRoundCheck className="size-4" />
                @{profile.username}
              </p>
              <h1 className="mt-1 text-3xl font-bold text-foreground">
                {profile.displayName}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
                {profile.roleLabel}
                {profile.githubStatus.connected &&
                  profile.githubStatus.username && (
                    <a
                      dir="ltr"
                      href={`https://github.com/${profile.githubStatus.username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Github className="size-3.5" />
                      github.com/{profile.githubStatus.username}
                    </a>
                  )}
              </p>
            </div>
          </div>
          <span className="self-start rounded-full border border-border bg-background px-4 py-2 font-mono text-[13px] tracking-[0.65px] text-muted-foreground md:self-center">
            {profile.viewerRelationship === "owner"
              ? "ملفك الشخصي"
              : "عرض عام للمساهم"}
          </span>
        </div>
      </Card>

      <div className="lg:col-span-1 lg:row-span-2">
        <ContributorReputationStrip profile={profile} />
      </div>

      <div className="flex flex-col gap-4 lg:col-span-3">
        <ContributorProfileCompletion
          profile={profile}
          onConnectGitHub={onConnectGitHub ?? (() => Promise.resolve())}
        />
        <ContributorProfileSections profile={profile} />
      </div>
    </div>
  );
}
