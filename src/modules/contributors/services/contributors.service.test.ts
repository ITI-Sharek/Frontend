import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  ensureCurrentContributorProfile,
  getContributorProfileByUsername,
} from "./contributors.service";
import type { ContributorProfileDto } from "../types/contributor-profile.types";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axiosInstance);

const profile: ContributorProfileDto = {
  username: "sara",
  displayName: "Sara Ahmed",
  avatarUrl: null,
  roleLabel: "Contributor",
  bio: null,
  skills: [
    {
      name: "React",
      proficiencyLevel: "advanced",
      confidence: 0.92,
      status: "approved",
      evidenceSummary: "Detected from GitHub repositories",
    },
  ],
  availability: null,
  githubStatus: { connected: false, username: null },
  githubInstallations: [],
  reputationSummary: { rating: null, reviewsCount: 0 },
  contributionHistory: [],
  completionPrompts: [],
  viewerRelationship: "owner",
  experienceLevel: null,
  fields: [],
  declaredSkills: [],
};

function axiosError(status: number, message = "Mapped backend message") {
  return {
    isAxiosError: true,
    response: {
      status,
      data: { message },
    },
  };
}

describe("contributors service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads contributor profiles from the canonical username endpoint", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: profile });

    await expect(
      getContributorProfileByUsername("sara ahmed"),
    ).resolves.toEqual(profile);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/contributors/profiles/sara%20ahmed",
    );
  });

  it("ensures the current contributor profile through the agreed endpoint", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: profile });

    await expect(ensureCurrentContributorProfile()).resolves.toEqual(profile);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/contributors/profiles/me/ensure",
    );
  });

  it("normalizes installation summaries from older profile responses", async () => {
    const legacyInstallation = {
      installationLinkId: "link-1",
      accountLogin: "sharek-org",
      accountType: "organization" as const,
      status: "active" as const,
      verifiedAt: "2026-07-26T10:00:00.000Z",
      manageUrl: null,
    };
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        ...profile,
        githubInstallations: [legacyInstallation],
      },
    });

    await expect(
      getContributorProfileByUsername("sara"),
    ).resolves.toMatchObject({
      githubInstallations: [{ accountLogin: "sharek-org", repositories: [] }],
    });
  });

  it.each([
    [401, "unauthenticated"],
    [403, "forbidden"],
    [404, "not-found"],
    [409, "duplicate-username"],
    [422, "invalid-username"],
    [400, "invalid-username"],
  ] as const)(
    "maps HTTP %s to contributor profile error %s",
    async (status, code) => {
      mockedAxios.get.mockRejectedValueOnce(axiosError(status));

      await expect(
        getContributorProfileByUsername("sara"),
      ).rejects.toMatchObject({
        code,
        message: "Mapped backend message",
      });
    },
  );

  it("maps network or unknown errors to unavailable", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network down"));

    await expect(getContributorProfileByUsername("sara")).rejects.toMatchObject(
      {
        code: "unavailable",
      },
    );
  });
});
