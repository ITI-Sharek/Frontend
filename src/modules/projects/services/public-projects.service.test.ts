import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  getPublishedProjectApplicants,
  getPublishedProjectSavedState,
  getPublishedProjectBySlug,
  listPublishedProjects,
  savePublishedProject,
  unsavePublishedProject,
} from "./public-projects.service";
import type {
  PublicProjectDetailDto,
  PublicProjectApplicantsResponseDto,
  PublicProjectsListResponseDto,
} from "../types/public-project.types";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const mockedAxios = vi.mocked(axiosInstance);

describe("public projects service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists published projects with cursor params", async () => {
    const response: PublicProjectsListResponseDto = {
      items: [
        {
          id: "project-1",
          slug: "sharek-example",
          title: "ShareK Example",
          description: "Reviewed owner copy",
          tags: ["collaboration"],
          technologies: ["TypeScript"],
          category: "web",
          difficulty: "intermediate",
          publishedAt: "2026-07-21T10:10:00.000Z",
          owner: null,
          source: {
            provider: "github",
            attributionStatus: "public",
            fullName: "sharek/example",
            repositoryUrl: "https://github.com/sharek/example",
            fetchedAt: "2026-07-21T10:00:02.000Z",
            statistics: {
              stars: 0,
              forks: 0,
              contributors: null,
              latestCommitAt: null,
              sourceUpdatedAt: null,
              defaultBranch: null,
              recentCommits: [],
              rootEntries: [],
              rootEntriesUnavailableReason: null,
              treeEntries: [],
              treeTruncated: false,
              treeUnavailableReason: null,
            },
          },
        },
      ],
      pageInfo: { nextCursor: null, hasNextPage: false },
    };
    mockedAxios.get.mockResolvedValueOnce({ data: response });

    await expect(listPublishedProjects({ limit: 20 })).resolves.toEqual(
      response,
    );
    expect(mockedAxios.get).toHaveBeenCalledWith("/public/projects", {
      params: { limit: 20 },
    });
  });

  it("gets one published project by slug, with a null fetchedAt", async () => {
    const detail: PublicProjectDetailDto = {
      id: "project-1",
      slug: "sharek-example",
      title: "ShareK Example",
      description: "Reviewed owner copy",
      tags: [],
      technologies: [],
      category: null,
      difficulty: null,
      publishedAt: "2026-07-21T10:10:00.000Z",
      owner: null,
      source: {
        provider: "github",
        attributionStatus: "public",
        fullName: "sharek/example",
        repositoryUrl: "https://github.com/sharek/example",
        fetchedAt: null,
        statistics: {
          stars: 0,
          forks: 0,
          contributors: null,
          latestCommitAt: null,
          sourceUpdatedAt: null,
          defaultBranch: null,
          recentCommits: [],
          rootEntries: [],
          rootEntriesUnavailableReason: null,
          treeEntries: [],
          treeTruncated: false,
          treeUnavailableReason: null,
        },
      },
    };
    mockedAxios.get.mockResolvedValueOnce({ data: detail });

    await expect(getPublishedProjectBySlug("sharek-example")).resolves.toEqual(
      detail,
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/public/projects/sharek-example",
    );
  });

  it("gets the public applicant cards for a published project", async () => {
    const response: PublicProjectApplicantsResponseDto = {
      items: [
        {
          applicationId: "application-1",
          contributionRequest: { id: "request-1", title: "Build an API" },
          contributor: {
            username: "Karim-Muhammad",
            displayName: "Karim Muhammad",
            avatarUrl: null,
          },
          submittedAt: "2026-08-17T10:00:00.000Z",
        },
      ],
    };
    mockedAxios.get.mockResolvedValueOnce({ data: response });

    await expect(
      getPublishedProjectApplicants("sharek-example"),
    ).resolves.toEqual(response);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/public/projects/sharek-example/applicants",
    );
  });

  it("reads and updates the signed-in reader's saved state", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { saved: true } });
    mockedAxios.post.mockResolvedValueOnce({ data: { saved: true } });
    mockedAxios.delete.mockResolvedValueOnce({ data: { saved: false } });

    await expect(
      getPublishedProjectSavedState("sharek-example"),
    ).resolves.toEqual({ saved: true });
    await expect(savePublishedProject("sharek-example")).resolves.toEqual({
      saved: true,
    });
    await expect(unsavePublishedProject("sharek-example")).resolves.toEqual({
      saved: false,
    });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/public/projects/sharek-example/save",
    );
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/public/projects/sharek-example/save",
    );
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      "/public/projects/sharek-example/save",
    );
  });

  it("gets one published project, withholding source when private-backed", async () => {
    const detail: PublicProjectDetailDto = {
      id: "project-2",
      slug: "private-backed-project",
      title: "Private-backed project",
      description: null,
      tags: [],
      technologies: [],
      category: null,
      difficulty: null,
      publishedAt: "2026-07-21T10:10:00.000Z",
      owner: null,
      source: { provider: "github", attributionStatus: "withheld" },
    };
    mockedAxios.get.mockResolvedValueOnce({ data: detail });

    await expect(
      getPublishedProjectBySlug("private-backed-project"),
    ).resolves.toEqual(detail);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/public/projects/private-backed-project",
    );
  });
});
