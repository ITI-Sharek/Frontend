import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useMaterialGrantsQuery,
  useMaterialUploadConstraintsQuery,
} from "../api/queries/use-material-queries";
import type { MaterialScope } from "../api/mutations/use-material-mutations";
import {
  useAddMaterialVersionMutation,
  useDeleteMaterialMutation,
  useGrantMaterialAccessMutation,
  useRevokeMaterialAccessMutation,
  useUploadMaterialMutation,
} from "../api/mutations/use-material-mutations";
import { downloadMaterialVersion } from "../services/materials.service";
import type { MaterialDto } from "../types/material.types";
import { MaterialCard } from "./material-card";
import { MaterialUploadForm } from "./material-upload-form";

export interface MaterialsPanelProps {
  scope: MaterialScope;
  isOwner: boolean;
  materials: MaterialDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * The owner-and-collaborator surface for Materials.
 *
 * Deliberately contains no AI affordance of any kind: no "analyse", no
 * "select for analysis", no suggestion. Uploading here is storage consent and
 * nothing else, and the separation is only credible if this surface never
 * offers the next step. Choosing documents for analysis is a different
 * surface (#11) reached from somewhere else.
 */
export function MaterialsPanel({
  scope,
  isOwner,
  materials,
  isLoading,
  isError,
}: MaterialsPanelProps) {
  const { t } = useTranslation();
  const [openGrantsFor, setOpenGrantsFor] = useState<string | null>(null);

  const constraintsQuery = useMaterialUploadConstraintsQuery();
  const grantsQuery = useMaterialGrantsQuery(
    openGrantsFor ?? "",
    openGrantsFor !== null,
  );

  const uploadMutation = useUploadMaterialMutation(scope);
  const addVersionMutation = useAddMaterialVersionMutation(scope);
  const deleteMutation = useDeleteMaterialMutation(scope);
  const grantMutation = useGrantMaterialAccessMutation(scope);
  const revokeMutation = useRevokeMaterialAccessMutation(scope);

  /**
   * The blob is turned into a temporary object URL and clicked. Revoking it
   * afterwards matters: every un-revoked URL pins its blob in memory for the
   * life of the document, and a Materials list is exactly where someone
   * downloads a dozen files without navigating away.
   */
  async function handleDownload(materialId: string, version: number) {
    const { blob, filename } = await downloadMaterialVersion(materialId, version);
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  return (
    <section className="space-y-4" aria-labelledby="materials-heading">
      <header>
        <h2 id="materials-heading" className="text-lg font-semibold">
          {t("material.sectionTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("material.sectionDescription")}
        </p>
      </header>

      {isOwner && (
        <MaterialUploadForm
          constraints={constraintsQuery.data}
          isConstraintsLoading={constraintsQuery.isLoading}
          allowAssignmentVisibility={scope.kind === "contribution-request"}
          isSubmitting={uploadMutation.isPending}
          onUpload={async (input) => {
            await uploadMutation.mutateAsync(input);
          }}
        />
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("material.loading")}</p>
      ) : isError ? (
        <p role="alert" className="text-sm text-destructive">
          {t("material.loadFailed")}
        </p>
      ) : !materials || materials.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isOwner ? t("material.emptyOwner") : t("material.emptyReader")}
        </p>
      ) : (
        <div className="space-y-3">
          {materials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              isOwner={isOwner}
              grants={
                openGrantsFor === material.id ? grantsQuery.data : undefined
              }
              isGrantsLoading={
                openGrantsFor === material.id && grantsQuery.isLoading
              }
              isGrantSubmitting={grantMutation.isPending}
              isGrantsOpen={openGrantsFor === material.id}
              onOpenGrants={(materialId) =>
                setOpenGrantsFor((current) =>
                  current === materialId ? null : materialId,
                )
              }
              onDownload={handleDownload}
              onAddVersion={async (input) => {
                await addVersionMutation.mutateAsync(input);
              }}
              onDelete={async (input) => {
                await deleteMutation.mutateAsync(input);
              }}
              onGrant={async (input) => {
                await grantMutation.mutateAsync(input);
              }}
              onRevoke={async (input) => {
                await revokeMutation.mutateAsync(input);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
