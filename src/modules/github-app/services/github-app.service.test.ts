import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  completeGitHubAppInstallation,
  disconnectGitHubAppInstallation,
  getGitHubAppConnectionAttempt,
  listGitHubAppInstallations,
  listGitHubAppRepositories,
  startGitHubAppInstallation,
} from "./github-app.service";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axiosInstance);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("github app installation service", () => {
  it("starts a new installation with the install_and_authorize flow", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        installationUrl: "https://github.com/apps/sharek?state=opaque",
        expiresAt: "2026-07-27T12:10:00.000Z",
      },
    });

    const result = await startGitHubAppInstallation({
      flowType: "install_and_authorize",
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/github/app/installations/start",
      { flowType: "install_and_authorize" },
    );
    // The provider URL is server-issued; the client never builds a setup URL.
    expect(result.installationUrl).toBe(
      "https://github.com/apps/sharek?state=opaque",
    );
  });

  it("re-authorizes an existing installation link", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { installationUrl: "https://github.com/apps/sharek", expiresAt: "" },
    });

    await startGitHubAppInstallation({
      flowType: "authorize_existing_installation",
      installationLinkId: "link-1",
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/github/app/installations/start",
      {
        flowType: "authorize_existing_installation",
        installationLinkId: "link-1",
      },
    );
  });

  it("reads candidates for an opaque attempt id", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { attemptId: "attempt-1", expiresAt: "", candidates: [] },
    });

    await getGitHubAppConnectionAttempt("attempt-1");

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/github/app/installations/attempts/attempt-1",
    );
  });

  it("completes with the attempt id and a selected provider installation id", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    await completeGitHubAppInstallation({
      attemptId: "attempt-1",
      providerInstallationId: "12345678",
    });

    const [url, body] = mockedAxios.post.mock.calls[0];
    expect(url).toBe("/github/app/installations/callback");
    expect(body).toEqual({
      attemptId: "attempt-1",
      providerInstallationId: "12345678",
    });
    // No provider code, token, or raw callback payload is ever sent.
    expect(JSON.stringify(body)).not.toMatch(/code|token|secret/i);
  });

  it("completing an installation never starts a generation", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    await completeGitHubAppInstallation({
      attemptId: "attempt-1",
      providerInstallationId: "12345678",
    });

    expect(
      mockedAxios.post.mock.calls.some(([url]) =>
        String(url).includes("/skill-profiles/"),
      ),
    ).toBe(false);
  });

  it("lists installation links without assuming a single link", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [{ installationLinkId: "a" }, { installationLinkId: "b" }],
    });

    const links = await listGitHubAppInstallations();

    expect(mockedAxios.get).toHaveBeenCalledWith("/github/app/installations");
    expect(links).toHaveLength(2);
  });

  it("pages repositories through the selected installation link", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { items: [] } });

    await listGitHubAppRepositories({
      installationLinkId: "link-1",
      page: 2,
      perPage: 30,
    });

    expect(mockedAxios.get).toHaveBeenCalledWith("/github/app/repositories", {
      params: { installationLinkId: "link-1", page: 2, perPage: 30 },
    });
  });

  it("disconnects one local installation link", async () => {
    mockedAxios.delete.mockResolvedValueOnce({
      data: {
        success: true,
        manageUrl: "https://github.com/settings/installations",
      },
    });

    const result = await disconnectGitHubAppInstallation("link-1");

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      "/github/app/installations/link-1",
    );
    expect(result.manageUrl).toBe(
      "https://github.com/settings/installations",
    );
  });

  it("never calls retired repository OAuth routes", async () => {
    mockedAxios.get.mockResolvedValue({ data: { items: [] } });
    mockedAxios.post.mockResolvedValue({ data: {} });
    mockedAxios.delete.mockResolvedValue({ data: {} });

    await startGitHubAppInstallation({ flowType: "install_and_authorize" });
    await listGitHubAppInstallations();
    await listGitHubAppRepositories({ installationLinkId: "link-1" });
    await disconnectGitHubAppInstallation("link-1");

    const requestedUrls = [
      ...mockedAxios.get.mock.calls,
      ...mockedAxios.post.mock.calls,
      ...mockedAxios.delete.mock.calls,
    ].map(([url]) => String(url));

    for (const url of requestedUrls) {
      expect(url.startsWith("/github/app/")).toBe(true);
    }
    expect(requestedUrls).not.toContain("/github/oauth/start");
    expect(requestedUrls).not.toContain("/github/repositories");
    expect(requestedUrls).not.toContain("/github/account");
  });
});
