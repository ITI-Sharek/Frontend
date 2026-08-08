import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  CircleAlert,
  CircleSlash,
  Github,
  Sparkles,
} from "lucide-react";

import { StatusChip } from "@/shared/components/data-display/status-chip";
import type { StatusChipTone } from "@/shared/components/data-display/status-chip";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import type {
  ContributorGithubInstallationDto,
  ContributorProfileDto,
} from "../types/contributor-profile.types";

export const GITHUB_SKILL_ANALYSIS_PATH = "/profile/github";

const INSTALLATION_STATUS_LABEL: Record<
  ContributorGithubInstallationDto["status"],
  { label: string; tone: StatusChipTone; icon: typeof CheckCircle2 }
> = {
  active: { label: "مُفعّل", tone: "positive", icon: CheckCircle2 },
  disconnected: { label: "مفصول محلياً", tone: "neutral", icon: CircleSlash },
  reauthorization_required: {
    label: "يحتاج إعادة تفويض",
    tone: "attention",
    icon: CircleAlert,
  },
  revoked: { label: "ملغى من GitHub", tone: "negative", icon: CircleSlash },
};

/**
 * Owner-only view model. GitHub App installations are private: the backend
 * returns an empty array to other viewers and this helper additionally refuses
 * to expose them outside the owner relationship.
 */
export function getGithubSkillsSectionModel(profile: ContributorProfileDto) {
  const isOwner = profile.viewerRelationship === "owner";
  const installations = isOwner ? profile.githubInstallations : [];
  return {
    visible: isOwner,
    installations,
    hasActiveInstallation: installations.some(
      (installation) => installation.status === "active",
    ),
    /** Social login is independent and never gates repository analysis. */
    socialLoginConnected: profile.githubStatus.connected,
  };
}

/**
 * Optional "analyze skills with GitHub" entry point on the contributor's own
 * profile. It is never required: registration, verification, profile editing,
 * and project discovery all work without it.
 */
export function ContributorGithubSkillsSection({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  const model = getGithubSkillsSectionModel(profile);
  if (!model.visible) return null;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">
              تحليل المهارات عبر GitHub
              <span className="ms-2 rounded-full border border-border px-2 py-0.5 align-middle text-[11px] font-normal text-muted-foreground">
                اختياري
              </span>
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
              اربط تطبيق GitHub واختر مستودعاتك بنفسك لاستخراج مهارات مرشحة من
              مساهماتك. الربط وحده لا يبدأ أي تحليل، والمهارات المستخرجة تبقى
              بانتظار اعتماد الإدارة قبل ظهورها في ملفك العام.
            </p>
          </div>
        </div>

        <Button
          asChild
          size="sm"
          variant={model.installations.length > 0 ? "outline" : "primary"}
        >
          <Link to={GITHUB_SKILL_ANALYSIS_PATH}>
            <Github className="size-4" />
            {model.installations.length > 0
              ? "إدارة تحليل المهارات"
              : "ابدأ تحليل المهارات"}
          </Link>
        </Button>
      </div>

      {model.installations.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3">
          {model.installations.map((installation) => {
            const meta = INSTALLATION_STATUS_LABEL[installation.status];
            return (
              <li key={installation.installationLinkId}>
                <div className="flex flex-wrap items-center gap-2">
                  <span dir="ltr" className="font-mono text-xs text-foreground">
                    {installation.accountLogin}
                  </span>
                  <StatusChip tone={meta.tone} icon={meta.icon}>
                    {meta.label}
                  </StatusChip>
                </div>
                {installation.repositories.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {installation.repositories.map((repository) => (
                      <li
                        key={repository.repositoryId}
                        className="rounded-full border border-border bg-background px-3 py-1.5"
                      >
                        <span
                          dir="ltr"
                          className="font-mono text-xs text-foreground"
                        >
                          {repository.fullName}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {model.installations.length === 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          لا يوجد أي ربط لتطبيق GitHub حالياً. يمكنك متابعة استخدام Share-k
          بالكامل بدونه.
        </p>
      )}
    </Card>
  );
}
