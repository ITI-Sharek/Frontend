import { Github, Loader2, Sparkles, Unlink } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";

import type { ContributorProfileDto } from "../../types/contributor-profile.types";

/**
 * Settings → "GitHub". Two independent concerns live here:
 * 1. GitHub *identity* (social login) — `profile.githubStatus`.
 * 2. GitHub App *repository* access for skill analysis — its own page.
 * Neither gates the other, and disconnecting one never touches the other.
 */
export function ContributorGithubSettingsSection({
  profile,
  onConnectGitHub,
  onDisconnectGitHub,
  onOpenRepositories,
}: {
  profile: ContributorProfileDto;
  onConnectGitHub: () => Promise<void>;
  onDisconnectGitHub: () => Promise<void>;
  onOpenRepositories: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 rounded-input border border-border p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Github className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">
              {profile.githubStatus.connected
                ? t("contributor.githubStatus.connected")
                : t("contributor.githubStatus.disconnected")}
            </p>
            {profile.githubStatus.connected && profile.githubStatus.username ? (
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
              <p className="text-xs text-muted-foreground">
                {t("contributor.settings.githubConnectHint")}
              </p>
            )}
          </div>
        </div>
        {profile.githubStatus.connected ? (
          <div className="flex flex-wrap justify-end gap-2">
            <GitHubConnectButton
              label={t("contributor.settings.githubChangeAccount")}
              onConnectGitHub={onConnectGitHub}
            />
            <GitHubDisconnectButton onDisconnectGitHub={onDisconnectGitHub} />
          </div>
        ) : (
          <GitHubConnectButton
            label={t("contributor.settings.githubConnectAccount")}
            onConnectGitHub={onConnectGitHub}
          />
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-input border border-border p-4">
        <div>
          <p className="font-semibold text-foreground">{t("contributor.settings.aiSkillsAnalysisTitle")}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("contributor.settings.aiSkillsAnalysisDescription")}
          </p>
        </div>
        <SkillsGenerator onOpenRepositories={onOpenRepositories} />
      </div>
    </div>
  );
}

function GitHubConnectButton({
  label,
  onConnectGitHub,
}: {
  label: string;
  onConnectGitHub: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setError(null);
    setIsStarting(true);
    try {
      await onConnectGitHub();
    } catch (connectError) {
      setIsStarting(false);
      setError(
        getApiErrorMessage(connectError, t("contributor.settings.githubConnectError")),
      );
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button type="button" size="sm" disabled={isStarting} onClick={handleConnect}>
        {isStarting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>{t("contributor.settings.redirecting")}</span>
          </>
        ) : (
          <>
            <Github className="size-4" />
            <span>{label}</span>
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function GitHubDisconnectButton({
  onDisconnectGitHub,
}: {
  onDisconnectGitHub: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDisconnect() {
    if (!window.confirm(t("contributor.settings.disconnectConfirm"))) {
      return;
    }

    setError(null);
    setIsDisconnecting(true);
    try {
      await onDisconnectGitHub();
    } catch (disconnectError) {
      setIsDisconnecting(false);
      setError(
        getApiErrorMessage(disconnectError, t("contributor.settings.disconnectError")),
      );
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isDisconnecting}
        onClick={handleDisconnect}
      >
        {isDisconnecting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Unlink className="size-4" />
        )}
        <span>
          {isDisconnecting
            ? t("contributor.settings.disconnecting")
            : t("contributor.settings.disconnectAccount")}
        </span>
      </Button>
      {error && <p className="max-w-xs text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SkillsGenerator({
  onOpenRepositories,
}: {
  onOpenRepositories: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" size="sm" onClick={onOpenRepositories}>
        <Sparkles className="size-4" />
        <span>{t("contributor.settings.githubReposButton")}</span>
      </Button>
      <p className="text-xs text-muted-foreground">
        {t("contributor.settings.githubReposHint")}
      </p>
    </div>
  );
}
