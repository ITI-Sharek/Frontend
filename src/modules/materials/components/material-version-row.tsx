import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

import { StatusChip } from "@/shared/components/data-display/status-chip";
import { Button } from "@/shared/components/ui/button";

import type { MaterialDto, MaterialVersionDto } from "../types/material.types";
import {
  canDownloadVersion,
  formatBytes,
  formatMimeType,
  getDownloadBlockedReason,
  getMaterialStateMeta,
  getMaterialVersionState,
} from "../utils/material-state";

export interface MaterialVersionRowProps {
  material: MaterialDto;
  version: MaterialVersionDto;
  isCurrent: boolean;
  onDownload: (version: number) => Promise<void>;
}

export function MaterialVersionRow({
  material,
  version,
  isCurrent,
  onDownload,
}: MaterialVersionRowProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = getMaterialVersionState(material, version);
  const meta = getMaterialStateMeta(state);
  const downloadable = canDownloadVersion(material, version);
  const blockedReason = getDownloadBlockedReason(state);

  async function handleDownload() {
    setIsDownloading(true);
    setError(null);
    try {
      await onDownload(version.version);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "تعذّر تنزيل الملف.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <li className="flex flex-col gap-2 border-t border-border/50 py-3 first:border-t-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">
            النسخة {version.version}
            {isCurrent && (
              <span className="ms-2 text-xs text-muted-foreground">
                (الأحدث)
              </span>
            )}
          </span>
          <StatusChip
            tone={meta.tone}
            icon={meta.icon}
            className={state === "SCANNING" ? "[&_svg]:animate-spin" : undefined}
          >
            {meta.label}
          </StatusChip>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {version.originalFilename} — {formatMimeType(version.mimeType)} —{" "}
          {formatBytes(version.byteSize)}
        </p>
        {/* The state is always said in words as well as shown as a chip, so it
            never depends on colour or on recognising an icon. */}
        <p className="text-xs text-muted-foreground">{meta.description}</p>
        {error !== null && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="shrink-0">
        {downloadable ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Download className="size-4" aria-hidden />
            )}
            {isDownloading ? "جارٍ التنزيل…" : "تنزيل"}
          </Button>
        ) : (
          /*
           * Disabled with a stated reason rather than absent. A control that is
           * merely greyed out tells a keyboard or screen-reader user nothing
           * about what would change it, and removing it entirely leaves them
           * wondering whether they missed something.
           */
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            aria-disabled="true"
            title={blockedReason ?? undefined}
          >
            <Download className="size-4" aria-hidden />
            التنزيل غير متاح
          </Button>
        )}
      </div>
    </li>
  );
}
