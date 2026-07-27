import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import { SKILL_ANALYSIS_CONSENT_VERSION } from "../constants/skill-analysis.constants";
import {
  getLatestSkillProfileGeneration,
  retrySkillProfileGeneration,
  startSkillProfileGeneration,
} from "./skill-profile-generation.service";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn() },
}));

const mockedAxios = vi.mocked(axiosInstance);

function apiError(status: number, code: string, metadata?: unknown) {
  return new AxiosError("failed", String(status), undefined, undefined, {
    status,
    statusText: "",
    headers: {},
    config: { headers: {} },
    data: { statusCode: status, code, message: "failed", metadata },
  } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("skill profile generation service", () => {
  it("starts a generation with installation link, repository ids and consent", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { generationId: "gen-1" } });

    await startSkillProfileGeneration({
      installationLinkId: "link-1",
      repositoryIds: ["123456789"],
      consent: { accepted: true, version: SKILL_ANALYSIS_CONSENT_VERSION },
    });

    const [url, body] = mockedAxios.post.mock.calls[0];
    expect(url).toBe("/skill-profiles/me/generations");
    expect(body).toEqual({
      installationLinkId: "link-1",
      repositoryIds: ["123456789"],
      consent: { accepted: true, version: "github-skill-analysis-v1" },
    });
    // Repository display names are never submitted as authorization input.
    expect(JSON.stringify(body)).not.toContain("/");
  });

  it("recovers the latest generation after a reload", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { generationId: "gen-1", status: "analyzing" },
    });

    const latest = await getLatestSkillProfileGeneration();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/skill-profiles/me/generations/latest",
    );
    expect(latest?.generationId).toBe("gen-1");
  });

  it("treats a missing latest generation as an empty state", async () => {
    mockedAxios.get.mockRejectedValueOnce(
      apiError(404, "SKILL_PROFILE_GENERATION_NOT_FOUND"),
    );

    await expect(getLatestSkillProfileGeneration()).resolves.toBeNull();
  });

  it("rethrows unexpected latest-generation failures", async () => {
    mockedAxios.get.mockRejectedValueOnce(
      apiError(503, "SKILL_PROFILE_QUEUE_UNAVAILABLE"),
    );

    await expect(getLatestSkillProfileGeneration()).rejects.toBeInstanceOf(
      AxiosError,
    );
  });

  it("retries with fresh consent and no repeated selection", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { generationId: "gen-2" } });

    await retrySkillProfileGeneration({
      generationId: "gen-1",
      consent: { accepted: true, version: SKILL_ANALYSIS_CONSENT_VERSION },
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/skill-profiles/me/generations/gen-1/retry",
      { consent: { accepted: true, version: "github-skill-analysis-v1" } },
    );
  });
});
