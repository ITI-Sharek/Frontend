import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addMaterialVersion,
  changeMaterialVisibility,
  deleteMaterial,
  grantMaterialAccess,
  revokeMaterialAccess,
  uploadContributionRequestMaterial,
  uploadProjectMaterial,
} from "../../services/materials.service";
import type {
  MaterialVisibility,
  UploadMaterialPayload,
} from "../../types/material.types";
import { materialKeys } from "../query-keys";

export type MaterialScope =
  | { kind: "project"; id: string }
  | { kind: "contribution-request"; id: string };

function listKey(scope: MaterialScope) {
  return scope.kind === "project"
    ? materialKeys.projectList(scope.id)
    : materialKeys.contributionRequestList(scope.id);
}

/**
 * Every mutation invalidates rather than writing the response into the cache.
 *
 * A command's response describes the Material at commit time, and the scan
 * state moves afterwards on a worker. Seeding the list from it would replace a
 * polled row with a staler one — most visibly on upload, where the response
 * always says QUARANTINED.
 */
export function useUploadMaterialMutation(scope: MaterialScope) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadMaterialPayload) =>
      scope.kind === "project"
        ? uploadProjectMaterial(scope.id, payload)
        : uploadContributionRequestMaterial(scope.id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listKey(scope) });
    },
  });
}

export function useAddMaterialVersionMutation(scope: MaterialScope) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      materialId: string;
      file: File;
      idempotencyKey: string;
    }) => addMaterialVersion(input.materialId, input.file, input.idempotencyKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listKey(scope) });
    },
  });
}

export function useGrantMaterialAccessMutation(scope: MaterialScope) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      materialId: string;
      granteeId: string;
      idempotencyKey: string;
    }) =>
      grantMaterialAccess(
        input.materialId,
        input.granteeId,
        input.idempotencyKey,
      ),
    onSuccess: (_material, variables) => {
      void queryClient.invalidateQueries({
        queryKey: materialKeys.grants(variables.materialId),
      });
      void queryClient.invalidateQueries({ queryKey: listKey(scope) });
    },
  });
}

export function useRevokeMaterialAccessMutation(scope: MaterialScope) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      materialId: string;
      granteeId: string;
      idempotencyKey: string;
    }) =>
      revokeMaterialAccess(
        input.materialId,
        input.granteeId,
        input.idempotencyKey,
      ),
    onSuccess: (_material, variables) => {
      void queryClient.invalidateQueries({
        queryKey: materialKeys.grants(variables.materialId),
      });
      void queryClient.invalidateQueries({ queryKey: listKey(scope) });
    },
  });
}

export function useChangeMaterialVisibilityMutation(scope: MaterialScope) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      materialId: string;
      visibility: MaterialVisibility;
      idempotencyKey: string;
    }) =>
      changeMaterialVisibility(
        input.materialId,
        input.visibility,
        input.idempotencyKey,
      ),
    onSuccess: (_material, variables) => {
      void queryClient.invalidateQueries({
        queryKey: materialKeys.grants(variables.materialId),
      });
      void queryClient.invalidateQueries({ queryKey: listKey(scope) });
    },
  });
}

export function useDeleteMaterialMutation(scope: MaterialScope) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { materialId: string; idempotencyKey: string }) =>
      deleteMaterial(input.materialId, input.idempotencyKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listKey(scope) });
    },
  });
}
