import {
  Building2,
  CheckCircle2,
  CircleAlert,
  CircleSlash,
  ExternalLink,
  PlugZap,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { StatusChip } from "@/shared/components/data-display/status-chip";
import { Button } from "@/shared/components/ui/button";

import {
  getAccountTypeLabel,
  getInstallationStatusMeta,
} from "../utils/github-app-presenter";
import type {
  GitHubAppInstallationLinkDto,
  GitHubAppInstallationStatus,
} from "../types/github-app.types";

const STATUS_ICON = {
  active: CheckCircle2,
  disconnected: CircleSlash,
  reauthorization_required: CircleAlert,
  revoked: CircleSlash,
} as const satisfies Record<
  GitHubAppInstallationStatus,
  typeof CheckCircle2
>;

interface GitHubAppInstallationListProps {
  installations: GitHubAppInstallationLinkDto[];
  selectedInstallationLinkId: string | null;
  onSelect: (installationLinkId: string) => void;
  onReauthorize: (installationLinkId: string) => void;
  onDisconnect: (installation: GitHubAppInstallationLinkDto) => void;
  busyInstallationLinkId?: string | null;
}

/**
 * Owner-only list of GitHub App installation links. Multiple personal and
 * organization links are supported; there is never an assumed single link.
 */
export function GitHubAppInstallationList({
  installations,
  selectedInstallationLinkId,
  onSelect,
  onReauthorize,
  onDisconnect,
  busyInstallationLinkId = null,
}: GitHubAppInstallationListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {installations.map((installation) => {
        const meta = getInstallationStatusMeta(installation.status);
        const Icon = STATUS_ICON[installation.status];
        const AccountIcon =
          installation.accountType === "organization" ? Building2 : UserRound;
        const isSelected =
          selectedInstallationLinkId === installation.installationLinkId;
        const isBusy =
          busyInstallationLinkId === installation.installationLinkId;

        return (
          <li key={installation.installationLinkId}>
            <div
              className={cn(
                "rounded-card border p-4 transition-colors",
                isSelected && meta.usable
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AccountIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p
                      dir="ltr"
                      className="text-start font-mono text-sm font-semibold text-foreground"
                    >
                      {installation.accountLogin}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getAccountTypeLabel(installation.accountType)}
                      {" · "}
                      {installation.repositorySelection === "all"
                        ? "كل المستودعات"
                        : "مستودعات محددة"}
                    </p>
                  </div>
                </div>
                <StatusChip tone={meta.tone} icon={Icon}>
                  {meta.label}
                </StatusChip>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {meta.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {meta.usable && (
                  <Button
                    type="button"
                    size="sm"
                    variant={isSelected ? "primary" : "outline"}
                    onClick={() => onSelect(installation.installationLinkId)}
                  >
                    {isSelected ? "محدد للتحليل" : "استخدام هذا الربط"}
                  </Button>
                )}
                {meta.needsReauthorization && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() =>
                      onReauthorize(installation.installationLinkId)
                    }
                  >
                    <PlugZap className="size-4" />
                    إعادة التفويض
                  </Button>
                )}
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
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isBusy}
                  onClick={() => onDisconnect(installation)}
                >
                  فصل محلي
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
