import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

interface ContributorProfileErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export function getContributorProfileErrorMessage(message?: string) {
  return message ?? "تعذر تحميل ملف المساهم. حاول مرة أخرى.";
}

export function ContributorProfileErrorView({
  message,
  onRetry,
}: ContributorProfileErrorViewProps) {
  const resolvedMessage = getContributorProfileErrorMessage(message);

  return (
    <Card className="flex flex-col items-start gap-4 border-destructive/30">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-destructive/10 p-2 text-destructive">
          <AlertTriangle className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            الملف غير متاح حالياً
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{resolvedMessage}</p>
        </div>
      </div>
      {onRetry && (
        <Button type="button" size="sm" onClick={onRetry}>
          <RefreshCcw className="size-4" />
          <span>إعادة المحاولة</span>
        </Button>
      )}
    </Card>
  );
}
