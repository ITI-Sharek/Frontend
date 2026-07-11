import { UserRoundCheck } from "lucide-react";

import { Card } from "@/shared/components/ui/card";

import {
  ContributorProfileSections,
  getVisibleCompletionPrompts,
} from "./contributor-profile-sections";
import type { ContributorProfileDto } from "../types/contributor-profile.types";

export function ContributorProfileView({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  const prompts = getVisibleCompletionPrompts(profile);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <Card className="overflow-hidden p-0">
        <div className="relative bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.32),transparent_35%),linear-gradient(135deg,var(--brand-indigo),var(--background))] p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-card text-2xl font-bold text-foreground">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="size-full object-cover"
                  />
                ) : (
                  profile.displayName.slice(0, 1)
                )}
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <UserRoundCheck className="size-4" />
                  @{profile.username}
                </p>
                <h1 className="mt-1 text-3xl font-bold text-white">
                  {profile.displayName}
                </h1>
                <p className="mt-2 text-sm text-white/75">{profile.roleLabel}</p>
              </div>
            </div>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white">
              {profile.viewerRelationship === "owner"
                ? "ملفك الشخصي"
                : "عرض عام للمساهم"}
            </span>
          </div>
        </div>
      </Card>

      {prompts.length > 0 && (
        <Card className="border-primary/40 bg-primary/10">
          <h2 className="text-lg font-bold text-foreground">أكمل ملفك</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-muted-foreground">
            {prompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
        </Card>
      )}

      <ContributorProfileSections profile={profile} />
    </div>
  );
}
