import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  archiveProject,
  createProjectDraft,
  editOwnerProject,
  getMyProjects,
  getOwnerProject,
  previewGitHubRepository,
  publishProject,
  refreshProjectSource,
} from "./project-drafts.service";
import type {
  PreviewGitHubRepositoryResponseDto,
  ProjectOwnerViewDto,
  ProjectTransitionResultDto,
} from "../types/project-draft.types";
import type { MyProjectsListResponseDto } from "../types/my-projects.types";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axiosInstance);

const ownerProject: ProjectOwnerViewDto = {
  id: "project-1",
  slug: "sharek-example",
  status: "draft",
  revision: 3,
  project: {
    title: "ShareK Example",
    description: "Reviewed owner copy",
    tags: ["collaboration"],
    technologies: ["TypeScript"],
    category: "web",
    difficulty: "intermediate",
    manualOverrides: ["title"],
  },
  source: {
    attribution: {
      provider: "github",
      repositoryId: "123456",
      fullName: "sharek/example",
      repositoryUrl: "https://github.com/sharek/example",
      visibility: "public",
      ownerType: "organization",
      defaultBranch: "main",
      sourceVersion: "etag",
      sourceUpdatedAt: "2026-07-21T10:00:00.000Z",
      fetchedAt: "2026-07-21T10:00:02.000Z",
    },
    latestSnapshot: null,
    status: {
      syncStatus: "fresh",
      authorizationStatus: "public_read",
      selectionStatus: "not_required",
      lastAttemptAt: "2026-07-21T10:00:00.000Z",
      lastRequiredReadAt: "2026-07-21T10:00:02.000Z",
      freshUntil: "2026-07-21T10:15:02.000Z",
      isStale: false,
      invalidationReason: null,
      lastSuccessfulRefreshAt: "2026-07-21T10:00:02.000Z",
      unavailableAreas: [],
      recoveryAction: null,
    },
  },
  publishedAt: null,
  archivedAt: null,
  createdAt: "2026-07-21T10:01:00.000Z",
  updatedAt: "2026-07-21T10:01:00.000Z",
};

describe("project drafts service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("previews a repository without an idempotency key", async () => {
    const preview: PreviewGitHubRepositoryResponseDto = {
      previewFingerprint: "fingerprint-1",
      source: ownerProject.source.attribution,
      imported: {
        repositoryName: "example",
        description: "Provider description",
        languages: { TypeScript: 12000 },
        topics: ["nestjs"],
        technologies: ["TypeScript"],
        statistics: { stars: 5 },
        readmeContent: "# Example",
      },
      ownerDefaults: {
        title: "example",
        description: "Provider description",
        tags: ["nestjs"],
        technologies: ["TypeScript"],
      },
      evidence: {
        completeness: "complete",
        fieldStatus: {},
        unavailableAreas: [],
        authorizationStatus: "public_read",
        selectionStatus: "not_required",
      },
    };
    mockedAxios.post.mockResolvedValueOnce({ data: preview });

    await expect(
      previewGitHubRepository({
        repositoryReference: "https://github.com/sharek/example",
      }),
    ).resolves.toEqual(preview);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/projects/github/preview",
      { repositoryReference: "https://github.com/sharek/example" },
    );
  });

  it("creates a draft with an Idempotency-Key header and no key in the body", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: ownerProject });

    await createProjectDraft({
      idempotencyKey: "key-1",
      source: {
        provider: "github",
        repositoryReference: "sharek/example",
        previewFingerprint: "fingerprint-1",
      },
      project: {},
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/projects",
      {
        source: {
          provider: "github",
          repositoryReference: "sharek/example",
          previewFingerprint: "fingerprint-1",
        },
        project: {},
      },
      { headers: { "Idempotency-Key": "key-1" } },
    );
  });

  it("lists owner projects with cursor params", async () => {
    const response: MyProjectsListResponseDto = {
      projects: [],
      quota: { used: 0, monthlyLimit: 20 },
      pageInfo: { nextCursor: null, hasNextPage: false },
    };
    mockedAxios.get.mockResolvedValueOnce({ data: response });

    await expect(getMyProjects({ cursor: "abc", limit: 10 })).resolves.toEqual(
      response,
    );
    expect(mockedAxios.get).toHaveBeenCalledWith("/projects/me", {
      params: { cursor: "abc", limit: 10 },
    });
  });

  it("gets one owner project view", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: ownerProject });

    await expect(getOwnerProject("project-1")).resolves.toEqual(ownerProject);
    expect(mockedAxios.get).toHaveBeenCalledWith("/projects/me/project-1");
  });

  it("edits owner-controlled fields with an Idempotency-Key header", async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: ownerProject });

    await editOwnerProject({
      projectId: "project-1",
      idempotencyKey: "key-2",
      expectedRevision: 3,
      title: "New title",
    });

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      "/projects/me/project-1",
      { expectedRevision: 3, title: "New title" },
      { headers: { "Idempotency-Key": "key-2" } },
    );
  });

  it("refreshes source metadata with an Idempotency-Key header", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: ownerProject });

    await refreshProjectSource({
      projectId: "project-1",
      idempotencyKey: "key-3",
      expectedRevision: 3,
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/projects/me/project-1/source/refresh",
      { expectedRevision: 3 },
      { headers: { "Idempotency-Key": "key-3" } },
    );
  });

  it("publishes a draft with an Idempotency-Key header", async () => {
    const result: ProjectTransitionResultDto = {
      projectId: "project-1",
      status: "published",
      revision: 4,
      publishedAt: "2026-07-21T10:10:00.000Z",
      transitionId: "transition-1",
    };
    mockedAxios.post.mockResolvedValueOnce({ data: result });

    await expect(
      publishProject({
        projectId: "project-1",
        idempotencyKey: "key-4",
        expectedRevision: 3,
        confirm: true,
      }),
    ).resolves.toEqual(result);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/projects/me/project-1/publish",
      { expectedRevision: 3, confirm: true },
      { headers: { "Idempotency-Key": "key-4" } },
    );
  });

  it("archives a published project with an Idempotency-Key header", async () => {
    const result: ProjectTransitionResultDto = {
      projectId: "project-1",
      status: "archived",
      revision: 6,
      archivedAt: "2026-07-21T11:00:00.000Z",
      transitionId: "transition-2",
    };
    mockedAxios.post.mockResolvedValueOnce({ data: result });

    await expect(
      archiveProject({
        projectId: "project-1",
        idempotencyKey: "key-5",
        expectedRevision: 5,
        confirm: true,
      }),
    ).resolves.toEqual(result);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/projects/me/project-1/archive",
      { expectedRevision: 5, confirm: true },
      { headers: { "Idempotency-Key": "key-5" } },
    );
  });
});
