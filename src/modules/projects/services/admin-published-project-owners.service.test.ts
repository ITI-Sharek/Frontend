import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import { listAdminPublishedProjectOwners } from "./admin-published-project-owners.service";
import type { AdminPublishedProjectOwnerDto } from "../types/admin-published-project-owner.types";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { get: vi.fn() },
}));

const mockedAxios = vi.mocked(axiosInstance);

describe("admin published project owners service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads owners whose projects are currently published", async () => {
    const owners: AdminPublishedProjectOwnerDto[] = [
      {
        ownerId: "owner-1",
        ownerName: "Mona Ali",
        ownerEmail: "mona@example.com",
        publishedProjectsCount: 2,
        latestPublishedAt: "2026-07-20T08:00:00.000Z",
        latestProject: {
          id: "project-1",
          title: "Documentation refresh",
          githubRepoUrl: "https://github.com/sharek/docs",
        },
      },
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: owners });

    await expect(listAdminPublishedProjectOwners()).resolves.toEqual(owners);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/admin/published-project-owners",
    );
  });
});
