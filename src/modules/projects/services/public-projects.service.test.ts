import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  getPublishedProjectBySlug,
  listPublishedProjects,
} from "./public-projects.service";
import type {
  PublicProjectDetailDto,
  PublicProjectsListResponseDto,
} from "../types/public-project.types";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { get: vi.fn() },
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
          source: {
            provider: "github",
            attributionStatus: "public",
            fullName: "sharek/example",
            repositoryUrl: "https://github.com/sharek/example",
            fetchedAt: "2026-07-21T10:00:02.000Z",
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
      source: {
        provider: "github",
        attributionStatus: "public",
        fullName: "sharek/example",
        repositoryUrl: "https://github.com/sharek/example",
        fetchedAt: null,
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
