import { CircleCheck, Loader2, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { StatusChip } from "@/shared/components/data-display/status-chip";

import {
  getOwnerTypeLabel,
  getSafeUnavailableAreas,
  getSourceAuthorizationStatusMeta,
  getSourceSelectionStatusMeta,
  getSourceSyncStatusMeta,
} from "../../utils/project-source-presenter";
import type {
  ProjectSourceAttributionDto,
  ProjectSourceStatusDto,
} from "../../types/project-source.types";

interface ProjectSourceStatusPanelProps {
  attribution: ProjectSourceAttributionDto;
  status: ProjectSourceStatusDto;
  onRefresh: () => void;
  isRefreshing: boolean;
  refreshError?: string | null;
  /** GitHub App installation/selection recovery guidance, composed at the
   * route level so this module never imports `github-app` directly. */
  recoverySlot?: ReactNode;
}

/** WF §owner source status (User Story 7): attribution, freshness, and
 * safe authorization/selection state — never provider credentials. */
export function ProjectSourceStatusPanel({
  attribution,
  status,
  onRefresh,
  isRefreshing,
  refreshError = null,
  recoverySlot = null,
}: ProjectSourceStatusPanelProps) {
  const { t, i18n } = useTranslation();
  const syncMeta = getSourceSyncStatusMeta(t, status.syncStatus);
  const authMeta = getSourceAuthorizationStatusMeta(t, status.authorizationStatus);
  const selectionMeta = getSourceSelectionStatusMeta(t, status.selectionStatus);
  const unavailableAreas = getSafeUnavailableAreas(status);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-foreground">{t("project.source.title")}</h2>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          {isRefreshing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {t("project.source.refresh")}
        </Button>
      </div>

      <p dir="ltr" className="mt-3 text-end font-mono text-sm tracking-[0.65px] text-foreground">
        {attribution.fullName}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {attribution.visibility === "private"
          ? t("project.source.private")
          : t("project.source.public")}{" "}
        · {getOwnerTypeLabel(t, attribution.ownerType)}
        {attribution.defaultBranch && (
          <>
            {" "}
            · {t("project.source.defaultBranch")}{" "}
            <bdi dir="ltr">{attribution.defaultBranch}</bdi>
          </>
        )}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <StatusChip tone={syncMeta.tone} icon={CircleCheck}>
          {syncMeta.label}
        </StatusChip>
        <StatusChip tone={authMeta.tone} icon={CircleCheck}>
          {authMeta.label}
        </StatusChip>
        <StatusChip tone={selectionMeta.tone} icon={CircleCheck}>
          {selectionMeta.label}
        </StatusChip>
      </div>

      {status.isStale && (
        <p className="mt-3 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
          {status.lastSuccessfulRefreshAt
            ? t("project.source.staleDataWithDate", {
                date: new Date(status.lastSuccessfulRefreshAt).toLocaleString("ar"),
              })
            : t("project.source.staleDataWithoutDate")}
        </p>
      )}

      {unavailableAreas.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {t("project.source.unavailableAreas", {
            areas: new Intl.ListFormat(i18n.language).format(unavailableAreas),
          })}
        </p>
      )}

      {refreshError && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {refreshError}
        </p>
      )}

      {recoverySlot}
    </Card>
  );
}
