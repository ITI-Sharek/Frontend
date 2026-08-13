import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

import { translate } from "@/lib/translate";
import { Button } from "@/shared/components/ui/button";

import type { GitHubAppInstallationLinkDto } from "../types/github-app.types";

/** A compatibility export for consumers of the former copy constant. */
export const GITHUB_APP_DISCONNECT_COPY = translate(
  "githubApp.disconnectDialog.description",
);

interface GitHubAppDisconnectConfirmProps {
  installation: GitHubAppInstallationLinkDto;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export function GitHubAppDisconnectConfirm({
  installation,
  onConfirm,
  onCancel,
  isSubmitting = false,
  errorMessage = null,
}: GitHubAppDisconnectConfirmProps) {
  const { t } = useTranslation();
  return (
    <div
      role="alertdialog"
      aria-label={t("githubApp.disconnectDialog.aria")}
      className="rounded-card border border-destructive/40 bg-destructive/5 p-5"
    >
      <h3 className="text-sm font-bold text-foreground">
        {t("githubApp.disconnectDialog.title")} {" "}
        <span dir="ltr" className="font-mono">
          {installation.accountLogin}
        </span>
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {t("githubApp.disconnectDialog.description")}
      </p>

      {errorMessage && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {errorMessage}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {t("githubApp.disconnectDialog.confirm")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t("common.cancel")}
        </Button>
        {installation.manageUrl && (
          <a
            href={installation.manageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-input px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            {t("githubApp.installations.manage")}
          </a>
        )}
      </div>
    </div>
  );
}
