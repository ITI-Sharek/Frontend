import { Building2, RefreshCw, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";

import { getAccountTypeLabel } from "../utils/github-app-presenter";
import type { GitHubAppInstallationCandidateDto } from "../types/github-app.types";

interface GitHubAppCandidatePickerProps {
  candidates: GitHubAppInstallationCandidateDto[];
  onSelect: (providerInstallationId: string) => void;
  onRestart: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

/**
 * Shown after the backend callback when the attempt exposes more than one
 * accessible installation. The frontend never sees provider codes or tokens —
 * only the opaque attempt plus allowlisted candidate fields.
 */
export function GitHubAppCandidatePicker({
  candidates,
  onSelect,
  onRestart,
  isSubmitting = false,
  errorMessage = null,
}: GitHubAppCandidatePickerProps) {
  const { t } = useTranslation();
  if (candidates.length === 0) {
    return (
      <div className="rounded-card border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground">
          {t("githubApp.candidates.emptyTitle")}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {t("githubApp.candidates.emptyDescription")}
        </p>
        <Button
          type="button"
          size="sm"
          className="mt-4"
          onClick={onRestart}
          disabled={isSubmitting}
        >
          <RefreshCw className="size-4" />
          {t("githubApp.restart")}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-card p-5">
      <h3 className="text-sm font-bold text-foreground">
        {t("githubApp.candidates.title")}
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {t("githubApp.candidates.description")}
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {candidates.map((candidate) => {
          const Icon =
            candidate.accountType === "organization" ? Building2 : UserRound;
          return (
            <li key={candidate.providerInstallationId}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onSelect(candidate.providerInstallationId)}
                className="flex w-full items-center gap-3 rounded-input border border-border bg-background px-4 py-3 text-start transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon className="size-5 shrink-0 text-muted-foreground" />
                <span className="flex flex-col">
                  <span
                    dir="ltr"
                    className="text-start font-mono text-sm font-semibold text-foreground"
                  >
                    {candidate.accountLogin}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getAccountTypeLabel(t, candidate.accountType)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {errorMessage && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {errorMessage}
        </p>
      )}

      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="mt-3"
        onClick={onRestart}
        disabled={isSubmitting}
      >
        <RefreshCw className="size-4" />
        {t("githubApp.restart")}
      </Button>
    </div>
  );
}
