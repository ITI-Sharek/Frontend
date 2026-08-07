import { FilePlus2, Loader2, Trash2, Users } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";

import { getMaterialErrorMessage } from "../constants/material-copy";
import type { MaterialDto, MaterialGrantDto } from "../types/material.types";
import { createMaterialIdempotencyKey } from "../utils/material-idempotency";
import { getVisibilityCopy } from "../utils/material-state";
import { MaterialGrantsPanel } from "./material-grants-panel";
import { MaterialVersionRow } from "./material-version-row";

export interface MaterialCardProps {
  material: MaterialDto;
  isOwner: boolean;
  grants: MaterialGrantDto[] | undefined;
  isGrantsLoading: boolean;
  isGrantSubmitting: boolean;
  onDownload: (materialId: string, version: number) => Promise<void>;
  onAddVersion: (input: {
    materialId: string;
    file: File;
    idempotencyKey: string;
  }) => Promise<void>;
  onDelete: (input: {
    materialId: string;
    idempotencyKey: string;
  }) => Promise<void>;
  onGrant: (input: {
    materialId: string;
    granteeId: string;
    idempotencyKey: string;
  }) => Promise<void>;
  onRevoke: (input: {
    materialId: string;
    granteeId: string;
    idempotencyKey: string;
  }) => Promise<void>;
  onOpenGrants: (materialId: string) => void;
  isGrantsOpen: boolean;
}

export function MaterialCard({
  material,
  isOwner,
  grants,
  isGrantsLoading,
  isGrantSubmitting,
  onDownload,
  onAddVersion,
  onDelete,
  onGrant,
  onRevoke,
  onOpenGrants,
  isGrantsOpen,
}: MaterialCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isAddingVersion, setIsAddingVersion] = useState(false);
  const versionInputRef = useRef<HTMLInputElement>(null);

  const isDeleted = material.deletedAt !== null;
  const visibility = getVisibilityCopy(material.visibility);

  async function handleAddVersion(file: File) {
    setIsAddingVersion(true);
    setError(null);
    try {
      await onAddVersion({
        materialId: material.id,
        file,
        idempotencyKey: createMaterialIdempotencyKey(),
      });
    } catch (versionError) {
      setError(getMaterialErrorMessage(versionError));
    } finally {
      setIsAddingVersion(false);
      if (versionInputRef.current) versionInputRef.current.value = "";
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await onDelete({
        materialId: material.id,
        idempotencyKey: createMaterialIdempotencyKey(),
      });
      setIsConfirmingDelete(false);
    } catch (deleteError) {
      setError(getMaterialErrorMessage(deleteError));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <article className="rounded-xl border border-border/60 p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{material.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {visibility.label} — {visibility.description}
          </p>
        </div>
      </header>

      <ul className="mt-3">
        {material.versions.map((version) => (
          <MaterialVersionRow
            key={version.version}
            material={material}
            version={version}
            isCurrent={version.version === material.currentVersion}
            onDownload={(version_) => onDownload(material.id, version_)}
          />
        ))}
      </ul>

      {error !== null && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {/*
        Owner controls disappear entirely once the Material is deleted. Its
        content is already gone, so offering "upload a new version" would be an
        action the server can only refuse.
      */}
      {isOwner && !isDeleted && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border/50 pt-3">
          <input
            ref={versionInputRef}
            type="file"
            className="sr-only"
            aria-label="اختيار نسخة جديدة"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleAddVersion(file);
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isAddingVersion}
            onClick={() => versionInputRef.current?.click()}
          >
            {isAddingVersion ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <FilePlus2 className="size-4" aria-hidden />
            )}
            رفع نسخة جديدة
          </Button>

          {material.visibility === "RESTRICTED_PROJECT" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-expanded={isGrantsOpen}
              onClick={() => onOpenGrants(material.id)}
            >
              <Users className="size-4" aria-hidden />
              إدارة الصلاحيات
            </Button>
          )}

          {isConfirmingDelete ? (
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                سيُلغى وصول الجميع فورًا ثم يُحذف المحتوى نهائيًا.
              </span>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : null}
                تأكيد الحذف
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isDeleting}
              >
                تراجع
              </Button>
            </span>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsConfirmingDelete(true)}
            >
              <Trash2 className="size-4" aria-hidden />
              حذف المادة
            </Button>
          )}
        </div>
      )}

      {isOwner && !isDeleted && isGrantsOpen && (
        <div className="mt-3">
          <MaterialGrantsPanel
            grants={grants}
            isLoading={isGrantsLoading}
            isSubmitting={isGrantSubmitting}
            onGrant={(input) => onGrant({ ...input, materialId: material.id })}
            onRevoke={(input) => onRevoke({ ...input, materialId: material.id })}
          />
        </div>
      )}
    </article>
  );
}
