import { useQuery } from "@tanstack/react-query";

import {
  getContributionRequestMaterials,
  getMaterialGrants,
  getMaterialUploadConstraints,
  getProjectMaterials,
} from "../../services/materials.service";
import type { MaterialDto } from "../../types/material.types";
import { materialKeys } from "../query-keys";

/**
 * Limits are configuration, so they change only when an operator changes them.
 * Refetching per mount would put a request in front of every upload form for a
 * value that is stable for the life of the session.
 */
export function useMaterialUploadConstraintsQuery() {
  return useQuery({
    queryKey: materialKeys.uploadConstraints(),
    queryFn: getMaterialUploadConstraints,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
}

/**
 * Polls only while something is genuinely mid-flight.
 *
 * Scan states resolve on a worker with no push channel, so a version left
 * QUARANTINED or SCANNING would otherwise sit there until the user reloaded —
 * looking stuck when it is merely unwatched. Once everything is settled the
 * polling stops rather than running for the life of the page.
 */
export function materialsRefetchInterval(
  materials: MaterialDto[] | undefined,
): number | false {
  if (!materials?.length) return false;
  const pending = materials.some((material) =>
    material.versions.some(
      (version) =>
        version.purgedAt === null &&
        (version.scanStatus === "QUARANTINED" ||
          version.scanStatus === "SCANNING") &&
        // An abandoned scan is settled: it will never move on its own, so
        // polling for it is a request that can only ever return the same row.
        version.scanErrorCode === null,
    ),
  );
  return pending ? 4000 : false;
}

export function useProjectMaterialsQuery(projectId: string, enabled = true) {
  return useQuery({
    queryKey: materialKeys.projectList(projectId),
    queryFn: () => getProjectMaterials(projectId),
    enabled: enabled && projectId !== "",
    refetchInterval: (query) => materialsRefetchInterval(query.state.data),
    retry: false,
  });
}

export function useContributionRequestMaterialsQuery(
  requestId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: materialKeys.contributionRequestList(requestId),
    queryFn: () => getContributionRequestMaterials(requestId),
    enabled: enabled && requestId !== "",
    refetchInterval: (query) => materialsRefetchInterval(query.state.data),
    retry: false,
  });
}

export function useMaterialGrantsQuery(materialId: string, enabled = true) {
  return useQuery({
    queryKey: materialKeys.grants(materialId),
    queryFn: () => getMaterialGrants(materialId),
    enabled: enabled && materialId !== "",
    retry: false,
  });
}
