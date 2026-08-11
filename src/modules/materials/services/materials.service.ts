import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  materialDeletionSchema,
  materialDownloadTokenSchema,
  materialGrantListSchema,
  materialListSchema,
  materialSchema,
  materialUploadConstraintsSchema,
} from "../schemas/material.schema";
import {
  materialAnalysisConstraintsSchema,
  materialAnalysisRunSchema,
  materialAnalysisSetListSchema,
  materialAnalysisSetSchema,
} from "../schemas/material-analysis.schema";
import type {
  MaterialDeletionDto,
  MaterialDto,
  MaterialGrantDto,
  MaterialUploadConstraintsDto,
  MaterialVisibility,
  UploadMaterialPayload,
} from "../types/material.types";
import type {
  MaterialAnalysisConstraints,
  MaterialAnalysisRun,
  MaterialAnalysisSet,
} from "../types/material-analysis.types";

export async function getMaterialUploadConstraints(): Promise<MaterialUploadConstraintsDto> {
  const { data } = await axiosInstance.get("/material-upload-constraints");
  return materialUploadConstraintsSchema.parse(data);
}

export async function getMaterialAnalysisConstraints(
  projectId: string,
): Promise<MaterialAnalysisConstraints> {
  const { data } = await axiosInstance.get(
    `/projects/${encodeURIComponent(projectId)}/material-analysis/constraints`,
  );
  return materialAnalysisConstraintsSchema.parse(data);
}

export async function getMaterialAnalysisSets(
  projectId: string,
): Promise<MaterialAnalysisSet[]> {
  const { data } = await axiosInstance.get(
    `/projects/${encodeURIComponent(projectId)}/material-analysis/sets`,
  );
  return materialAnalysisSetListSchema.parse(data);
}

export async function createMaterialAnalysisSet(
  projectId: string,
  materialVersions: Array<{ materialId: string; version: number }>,
): Promise<MaterialAnalysisSet> {
  const { data } = await axiosInstance.post(
    `/projects/${encodeURIComponent(projectId)}/material-analysis/sets`,
    { materialVersions },
  );
  return materialAnalysisSetSchema.parse(data);
}

export async function startMaterialAnalysisRun(
  analysisSetId: string,
): Promise<MaterialAnalysisRun> {
  const { data } = await axiosInstance.post(
    `/material-analysis/sets/${encodeURIComponent(analysisSetId)}/runs`,
  );
  return materialAnalysisRunSchema.parse(data);
}

export async function getMaterialAnalysisRun(
  runId: string,
): Promise<MaterialAnalysisRun> {
  const { data } = await axiosInstance.get(
    `/material-analysis/runs/${encodeURIComponent(runId)}`,
  );
  return materialAnalysisRunSchema.parse(data);
}

export async function rejectMaterialDraftSuggestion(
  suggestionId: string,
): Promise<MaterialAnalysisRun["suggestions"][number]> {
  const { data } = await axiosInstance.post(
    `/material-analysis/suggestions/${encodeURIComponent(suggestionId)}/reject`,
  );
  return materialAnalysisRunSchema.shape.suggestions.element.parse(data);
}

export async function adoptProjectMaterialSuggestion(
  suggestionId: string,
  input: { expectedRevision: number; idempotencyKey: string },
) {
  const { data } = await axiosInstance.post(
    `/material-analysis/suggestions/${encodeURIComponent(suggestionId)}/adopt-project`,
    input,
  );
  return data;
}

export async function adoptContributionRequestMaterialSuggestion(
  suggestionId: string,
  input: {
    applicationsCloseTime: string;
    targetCompletionDate?: string | null;
    rewardCents?: number | null;
    rewardCurrency?: string | null;
    idempotencyKey: string;
  },
) {
  const { data } = await axiosInstance.post(
    `/material-analysis/suggestions/${encodeURIComponent(suggestionId)}/adopt-contribution-request`,
    input,
  );
  return data;
}

export async function getProjectMaterials(
  projectId: string,
): Promise<MaterialDto[]> {
  const { data } = await axiosInstance.get(
    `/projects/${encodeURIComponent(projectId)}/materials`,
  );
  return materialListSchema.parse(data);
}

export async function getContributionRequestMaterials(
  requestId: string,
): Promise<MaterialDto[]> {
  const { data } = await axiosInstance.get(
    `/contribution-requests/${encodeURIComponent(requestId)}/materials`,
  );
  return materialListSchema.parse(data);
}

/**
 * Multipart, so the Content-Type header must be left unset: the browser has to
 * add its own boundary parameter, and the axios instance's JSON default would
 * override it and make the body unparseable.
 */
function toFormData(payload: UploadMaterialPayload): FormData {
  const form = new FormData();
  form.append("file", payload.file);
  form.append("title", payload.title);
  form.append("visibility", payload.visibility);
  form.append("idempotencyKey", payload.idempotencyKey);
  return form;
}

const MULTIPART_HEADERS = { "Content-Type": undefined } as const;

export async function uploadProjectMaterial(
  projectId: string,
  payload: UploadMaterialPayload,
): Promise<MaterialDto> {
  const { data } = await axiosInstance.post(
    `/projects/${encodeURIComponent(projectId)}/materials`,
    toFormData(payload),
    { headers: MULTIPART_HEADERS },
  );
  return materialSchema.parse(data);
}

export async function uploadContributionRequestMaterial(
  requestId: string,
  payload: UploadMaterialPayload,
): Promise<MaterialDto> {
  const { data } = await axiosInstance.post(
    `/contribution-requests/${encodeURIComponent(requestId)}/materials`,
    toFormData(payload),
    { headers: MULTIPART_HEADERS },
  );
  return materialSchema.parse(data);
}

export async function addMaterialVersion(
  materialId: string,
  file: File,
  idempotencyKey: string,
): Promise<MaterialDto> {
  const form = new FormData();
  form.append("file", file);
  form.append("idempotencyKey", idempotencyKey);
  const { data } = await axiosInstance.post(
    `/materials/${encodeURIComponent(materialId)}/versions`,
    form,
    { headers: MULTIPART_HEADERS },
  );
  return materialSchema.parse(data);
}

export async function getMaterialGrants(
  materialId: string,
): Promise<MaterialGrantDto[]> {
  const { data } = await axiosInstance.get(
    `/materials/${encodeURIComponent(materialId)}/grants`,
  );
  return materialGrantListSchema.parse(data);
}

export async function grantMaterialAccess(
  materialId: string,
  granteeId: string,
  idempotencyKey: string,
): Promise<MaterialDto> {
  const { data } = await axiosInstance.post(
    `/materials/${encodeURIComponent(materialId)}/grants`,
    { granteeId, idempotencyKey },
  );
  return materialSchema.parse(data);
}

export async function revokeMaterialAccess(
  materialId: string,
  granteeId: string,
  idempotencyKey: string,
): Promise<MaterialDto> {
  const { data } = await axiosInstance.post(
    `/materials/${encodeURIComponent(materialId)}/grants/${encodeURIComponent(granteeId)}/revocations`,
    { idempotencyKey },
  );
  return materialSchema.parse(data);
}

export async function changeMaterialVisibility(
  materialId: string,
  visibility: MaterialVisibility,
  idempotencyKey: string,
): Promise<MaterialDto> {
  const { data } = await axiosInstance.patch(
    `/materials/${encodeURIComponent(materialId)}/visibility`,
    { visibility, idempotencyKey },
  );
  return materialSchema.parse(data);
}

export async function deleteMaterial(
  materialId: string,
  idempotencyKey: string,
): Promise<MaterialDeletionDto> {
  const { data } = await axiosInstance.post(
    `/materials/${encodeURIComponent(materialId)}/deletions`,
    { idempotencyKey },
  );
  return materialDeletionSchema.parse(data);
}

/**
 * Downloads in two calls, matching the server: mint a short-lived token, then
 * redeem it.
 *
 * A plain `<a href>` cannot be used for the second call. The redemption route
 * sits behind the access guard and needs the bearer token, which a browser
 * navigation would not send — so the bytes are fetched and handed to a
 * generated object URL instead.
 */
export async function downloadMaterialVersion(
  materialId: string,
  version: number,
): Promise<{ blob: Blob; filename: string }> {
  const { data: tokenResponse } = await axiosInstance.post(
    `/materials/${encodeURIComponent(materialId)}/versions/${version}/download-token`,
  );
  const { token } = materialDownloadTokenSchema.parse(tokenResponse);

  const response = await axiosInstance.get("/material-downloads", {
    params: { token },
    responseType: "blob",
  });
  return {
    blob: response.data as Blob,
    filename: parseFilename(response.headers["content-disposition"]),
  };
}

/**
 * The server percent-encodes the filename, so a name with Arabic characters or
 * spaces arrives escaped and would otherwise be saved literally as `%D8%A7...`.
 */
function parseFilename(contentDisposition: unknown): string {
  if (typeof contentDisposition !== "string") return "material";
  const match = /filename="([^"]*)"/.exec(contentDisposition);
  if (!match) return "material";
  try {
    return decodeURIComponent(match[1]) || "material";
  } catch {
    return match[1] || "material";
  }
}
