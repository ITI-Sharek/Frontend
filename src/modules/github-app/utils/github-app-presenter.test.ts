import { describe, expect, it } from "vitest";

import {
  getGitHubAppErrorMessage,
  getInstallationStatusMeta,
  getUsableInstallations,
  isRestartableCallbackError,
  resolveSelectedInstallationLinkId,
} from "./github-app-presenter";
import type {
  GitHubAppInstallationLinkDto,
  GitHubAppInstallationStatus,
} from "../types/github-app.types";

function makeInstallation(
  overrides: Partial<GitHubAppInstallationLinkDto> = {},
): GitHubAppInstallationLinkDto {
  return {
    installationLinkId: "link-1",
    providerInstallationId: "12345678",
    accountLogin: "sharek-org",
    accountType: "organization",
    status: "active",
    repositorySelection: "selected",
    installedAt: "2026-07-20T10:00:00.000Z",
    verifiedAt: "2026-07-26T10:00:00.000Z",
    manageUrl: "https://github.com/settings/installations/12345678",
    ...overrides,
  };
}

const ALL_STATUSES: GitHubAppInstallationStatus[] = [
  "active",
  "disconnected",
  "reauthorization_required",
  "revoked",
];

describe("github app installation presenter", () => {
  it("renders every installation status with distinct copy", () => {
    const labels = ALL_STATUSES.map(
      (status) => getInstallationStatusMeta(status).label,
    );
    expect(new Set(labels).size).toBe(ALL_STATUSES.length);
  });

  it("treats only active links as usable for analysis", () => {
    for (const status of ALL_STATUSES) {
      expect(getInstallationStatusMeta(status).usable).toBe(
        status === "active",
      );
    }
  });

  it("offers re-authorization for every non-active status", () => {
    for (const status of ALL_STATUSES) {
      expect(getInstallationStatusMeta(status).needsReauthorization).toBe(
        status !== "active",
      );
    }
  });

  it("filters usable installations across multiple links", () => {
    const installations = [
      makeInstallation({ installationLinkId: "a", status: "revoked" }),
      makeInstallation({ installationLinkId: "b", status: "active" }),
      makeInstallation({ installationLinkId: "c", status: "active" }),
    ];
    expect(
      getUsableInstallations(installations).map(
        (item) => item.installationLinkId,
      ),
    ).toEqual(["b", "c"]);
  });

  it("keeps a still-usable selection and otherwise falls back", () => {
    const installations = [
      makeInstallation({ installationLinkId: "a", status: "active" }),
      makeInstallation({ installationLinkId: "b", status: "active" }),
    ];
    expect(resolveSelectedInstallationLinkId(installations, "b")).toBe("b");
    expect(resolveSelectedInstallationLinkId(installations, "missing")).toBe(
      "a",
    );
    expect(resolveSelectedInstallationLinkId([], "b")).toBeNull();
    expect(
      resolveSelectedInstallationLinkId(
        [makeInstallation({ status: "revoked" })],
        null,
      ),
    ).toBeNull();
  });

  it("maps each documented GitHub App error code to safe copy", () => {
    const codes = [
      "GITHUB_APP_STATE_INVALID",
      "GITHUB_APP_INSTALLATION_ACCESS_NOT_VERIFIED",
      "GITHUB_APP_INSTALLATION_NOT_VERIFIED",
      "GITHUB_APP_REPOSITORY_NOT_SELECTED",
      "GITHUB_APP_PROVIDER_UNAVAILABLE",
      "GITHUB_APP_PROVIDER_INVALID_RESPONSE",
      "GITHUB_REPOSITORY_OAUTH_MIGRATED",
    ];
    const fallback = getGitHubAppErrorMessage("SOMETHING_UNKNOWN");
    for (const code of codes) {
      expect(getGitHubAppErrorMessage(code)).not.toBe(fallback);
      expect(getGitHubAppErrorMessage(code)).not.toContain(code);
    }
  });

  it("marks invalid or unverified callbacks as restartable", () => {
    expect(isRestartableCallbackError("GITHUB_APP_STATE_INVALID")).toBe(true);
    expect(
      isRestartableCallbackError("GITHUB_APP_INSTALLATION_ACCESS_NOT_VERIFIED"),
    ).toBe(true);
    expect(isRestartableCallbackError("GITHUB_APP_PROVIDER_UNAVAILABLE")).toBe(
      false,
    );
    expect(isRestartableCallbackError(null)).toBe(false);
  });
});
