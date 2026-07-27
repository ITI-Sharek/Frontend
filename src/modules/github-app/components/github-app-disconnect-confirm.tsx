import { ExternalLink } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import type { GitHubAppInstallationLinkDto } from "../types/github-app.types";

/**
 * Local disconnect is deliberately narrower than uninstalling the GitHub App
 * and completely unrelated to GitHub social login. The copy below is part of
 * the contract and is asserted by tests.
 */
export const GITHUB_APP_DISCONNECT_COPY =
  "الفصل يزيل ارتباط Share-k المحلي بالمستودعات فقط. لا يقوم بإلغاء تثبيت تطبيق GitHub ولا بفصل تسجيل الدخول عبر GitHub.";

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
  return (
    <div
      role="alertdialog"
      aria-label="تأكيد فصل ربط GitHub"
      className="rounded-card border border-destructive/40 bg-destructive/5 p-5"
    >
      <h3 className="text-sm font-bold text-foreground">
        فصل الربط مع{" "}
        <span dir="ltr" className="font-mono">
          {installation.accountLogin}
        </span>
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {GITHUB_APP_DISCONNECT_COPY}
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
          تأكيد الفصل المحلي
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          إلغاء
        </Button>
        {installation.manageUrl && (
          <a
            href={installation.manageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-input px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            إدارة أو إزالة التطبيق من GitHub
          </a>
        )}
      </div>
    </div>
  );
}
