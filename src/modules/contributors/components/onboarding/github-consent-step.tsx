import { Github, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

/**
 * CJ-1 step 1: consent before OAuth — lists exactly what is read and why,
 * before redirecting to GitHub (FR-027–028).
 */
export function GithubConsentStep({
  onConnectGitHub,
}: {
  onConnectGitHub: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setError(null);
    setIsConnecting(true);
    try {
      await onConnectGitHub();
    } catch (connectError) {
      setIsConnecting(false);
      setError(
        getApiErrorMessage(
          connectError,
          t("contributor.onboarding.connectError"),
        ),
      );    }
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-foreground">
        {t("contributor.onboarding.connectTitle")}
      </h2>
      <p className="mt-2 leading-7 text-muted-foreground">
        {t("contributor.onboarding.connectDescription")}
      </p>

      <ul className="mt-4 flex flex-col gap-2.5 text-sm leading-6 text-muted-foreground">
        <li>
          • <b className="text-foreground">{t("contributor.onboarding.readPublicRepositories")}</b>{" "}
          {t("contributor.onboarding.readPublicRepositoriesReason")}
        </li>
        <li>
          • <b className="text-foreground">{t("contributor.onboarding.readReadmeLanguages")}</b>{" "}
          {t("contributor.onboarding.readReadmeLanguagesReason")}
        </li>
        <li>
          • <b className="text-foreground">{t("contributor.onboarding.readCommits")}</b>{" "}
          {t("contributor.onboarding.readCommitsReason")}
        </li>
      </ul>

      <p className="mt-4 flex items-start gap-2 rounded-input border border-primary/40 bg-primary/5 p-3 text-sm leading-6 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          {t("contributor.onboarding.readOnlyPrefix")}{" "}
          <b className="text-foreground">{t("contributor.onboarding.readOnly")}</b>
          {t("contributor.onboarding.readOnlySuffix")}
        </span>
      </p>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <Button
        className="mt-5"
        disabled={isConnecting}
        onClick={() => void handleConnect()}
      >
        {isConnecting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {t("contributor.onboarding.connecting")}
          </>
        ) : (
          <>
            <Github className="size-4" />
            {t("contributor.onboarding.connectButton")}
          </>
        )}
      </Button>
    </Card>
  );
}
