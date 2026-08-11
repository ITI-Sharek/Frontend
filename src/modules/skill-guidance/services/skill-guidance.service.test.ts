import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import { requestSkillGapGuidance } from "./skill-guidance.service";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { post: vi.fn() },
}));

const mockedAxios = vi.mocked(axiosInstance);

describe("skill guidance service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requests source-scoped guidance for the selected published Request", async () => {
    const response = { kind: "no_assessable_evidence" } as const;
    mockedAxios.post.mockResolvedValueOnce({ data: response });

    await expect(requestSkillGapGuidance("request 1")).resolves.toEqual(response);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/contributors/me/skill-gap-guidance",
      { contributionRequestId: "request 1" },
    );
  });
});
