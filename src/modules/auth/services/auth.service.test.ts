import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import { updateCurrentUserPreferences } from "./auth.service";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { patch: vi.fn() },
}));

const mockedAxios = vi.mocked(axiosInstance);

describe("identity language preference service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates only the authenticated user's preferred language", async () => {
    const user = { id: "user-1", preferredLanguage: "en" };
    mockedAxios.patch.mockResolvedValueOnce({ data: user });

    await expect(
      updateCurrentUserPreferences({ preferredLanguage: "en" }),
    ).resolves.toEqual(user);
    expect(mockedAxios.patch).toHaveBeenCalledWith("/auth/me/preferences", {
      preferredLanguage: "en",
    });
  });
});
