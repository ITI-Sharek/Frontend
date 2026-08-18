import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  MyProjectsListParams,
  MyProjectsListResponseDto,
} from "../types/my-projects.types";
import type {
  ArchiveProjectPayload,
  CreateProjectDraftPayload,
  EditProjectPayload,
  PreviewGitHubRepositoryPayload,
  PreviewGitHubRepositoryResponseDto,
  ProjectOwnerViewDto,
  ProjectTransitionResultDto,
  PublishProjectPayload,
  RefreshProjectSourcePayload,
  UploadProjectHeroImagePayload,
} from "../types/project-draft.types";

/**
 * Owner GitHub-backed project draft/publication APIs
 * (`server/specs/003-github-project-publication/contracts/http-api.md`).
 * Replaces the retired combined `POST /projects/import/github` route. Every
 * side-effecting call requires an `Idempotency-Key` so a caller-held key can
 * safely replay the same logical attempt.
 */

export async function previewGitHubRepository(
  payload: PreviewGitHubRepositoryPayload,
): Promise<PreviewGitHubRepositoryResponseDto> {
  const { data } =
    await axiosInstance.post<PreviewGitHubRepositoryResponseDto>(
      "/projects/github/preview",
      payload,
    );
  return data;
}

export async function createProjectDraft({
  idempotencyKey,
  ...payload
}: CreateProjectDraftPayload & {
  idempotencyKey: string;
}): Promise<ProjectOwnerViewDto> {
  const { data } = await axiosInstance.post<ProjectOwnerViewDto>(
    "/projects",
    payload,
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  return data;
}

export async function getMyProjects(
  params: MyProjectsListParams = {},
): Promise<MyProjectsListResponseDto> {
  const { data } = await axiosInstance.get<MyProjectsListResponseDto>(
    "/projects/me",
    { params },
  );
  return data;
}

export async function getOwnerProject(
  projectId: string,
): Promise<ProjectOwnerViewDto> {
  const { data } = await axiosInstance.get<ProjectOwnerViewDto>(
    `/projects/me/${encodeURIComponent(projectId)}`,
  );
  return data;
}

export async function editOwnerProject({
  projectId,
  idempotencyKey,
  ...payload
}: EditProjectPayload & {
  projectId: string;
  idempotencyKey: string;
}): Promise<ProjectOwnerViewDto> {
  const { data } = await axiosInstance.patch<ProjectOwnerViewDto>(
    `/projects/me/${encodeURIComponent(projectId)}`,
    payload,
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  return data;
}

export async function refreshProjectSource({
  projectId,
  idempotencyKey,
  ...payload
}: RefreshProjectSourcePayload & {
  projectId: string;
  idempotencyKey: string;
}): Promise<ProjectOwnerViewDto> {
  const { data } = await axiosInstance.post<ProjectOwnerViewDto>(
    `/projects/me/${encodeURIComponent(projectId)}/source/refresh`,
    payload,
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  return data;
}

export async function uploadProjectHeroImage({
  projectId,
  idempotencyKey,
  expectedRevision,
  file,
}: UploadProjectHeroImagePayload & {
  projectId: string;
  idempotencyKey: string;
}): Promise<ProjectOwnerViewDto> {
  const formData = new FormData();
  formData.append("expectedRevision", String(expectedRevision));
  formData.append("file", file);
  const { data } = await axiosInstance.put<ProjectOwnerViewDto>(
    `/projects/me/${encodeURIComponent(projectId)}/hero-image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "Idempotency-Key": idempotencyKey,
      },
    },
  );
  return data;
}

export async function publishProject({
  projectId,
  idempotencyKey,
  ...payload
}: PublishProjectPayload & {
  projectId: string;
  idempotencyKey: string;
}): Promise<ProjectTransitionResultDto> {
  const { data } = await axiosInstance.post<ProjectTransitionResultDto>(
    `/projects/me/${encodeURIComponent(projectId)}/publish`,
    payload,
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  return data;
}

export async function archiveProject({
  projectId,
  idempotencyKey,
  ...payload
}: ArchiveProjectPayload & {
  projectId: string;
  idempotencyKey: string;
}): Promise<ProjectTransitionResultDto> {
  const { data } = await axiosInstance.post<ProjectTransitionResultDto>(
    `/projects/me/${encodeURIComponent(projectId)}/archive`,
    payload,
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  return data;
}
