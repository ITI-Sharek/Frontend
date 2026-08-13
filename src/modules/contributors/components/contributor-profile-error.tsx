import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

interface ContributorProfileErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export function getContributorProfileErrorMessage(
  t: TFunction,
  message?: string,
) {
  return message ?? t("contributor.error.profileLoadFailed");
}

export function ContributorProfileErrorView({
  message,
  onRetry,
}: ContributorProfileErrorViewProps) {
  const { t } = useTranslation();
  const resolvedMessage = getContributorProfileErrorMessage(t, message);

  return (
    <Card className="flex flex-col items-start gap-4 border-destructive/30">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-destructive/10 p-2 text-destructive">
          <AlertTriangle className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {t("contributor.error.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{resolvedMessage}</p>
        </div>
      </div>
      {onRetry && (
        <Button type="button" size="sm" onClick={onRetry}>
          <RefreshCcw className="size-4" />
          <span>{t("contributor.error.retry")}</span>
        </Button>
      )}
    </Card>
  );
}
