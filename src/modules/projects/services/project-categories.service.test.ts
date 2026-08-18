import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import { listProjectDifficulties } from "./project-categories.service";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { get: vi.fn() },
}));

const mockedAxios = vi.mocked(axiosInstance);

describe("project taxonomy catalog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("gets project difficulties from the project catalog, not contributor experience levels", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        { key: "beginner", labelEn: "Beginner", labelAr: "مبتدئ" },
        { key: "intermediate", labelEn: "Intermediate", labelAr: "متوسط" },
        { key: "advanced", labelEn: "Advanced", labelAr: "متقدم" },
      ],
    });

    await expect(listProjectDifficulties()).resolves.toEqual([
      { key: "beginner", labelEn: "Beginner", labelAr: "مبتدئ" },
      { key: "intermediate", labelEn: "Intermediate", labelAr: "متوسط" },
      { key: "advanced", labelEn: "Advanced", labelAr: "متقدم" },
    ]);
    expect(mockedAxios.get).toHaveBeenCalledWith("/projects/difficulties");
  });
});
