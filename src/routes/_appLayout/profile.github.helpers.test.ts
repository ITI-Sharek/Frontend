import { describe, expect, it } from "vitest";

import {
  buildConsent,
  buildStartGenerationPayload,
  canStartGeneration,
  findInstallation,
  getAutoSelectableCandidateId,
  getCallbackPhase,
  validateGithubSkillAnalysisSearch,
} from "./profile.github.helpers";
import type { GitHubAppInstallationLinkDto } from "@/modules/github-app";

const installation: GitHubAppInstallationLinkDto = {
  installationLinkId: "link-1",
  providerInstallationId: "12345678",
  accountLogin: "sharek-org",
  accountType: "organization",
  status: "active",
  repositorySelection: "selected",
  installedAt: "2026-07-20T10:00:00.000Z",
  verifiedAt: null,
  manageUrl: null,
};

describe("callback search parsing", () => {
  it("keeps only the opaque attempt id and stable error code", () => {
    expect(
      validateGithubSkillAnalysisSearch({
        attemptId: "attempt-1",
        code: "provider-code",
        state: "provider-state",
        access_token: "secret",
      }),
    ).toEqual({ attemptId: "attempt-1" });
  });

  it("drops empty and non-string values", () => {
    expect(validateGithubSkillAnalysisSearch({ attemptId: "", error: 42 })).toEqual(
      {},
    );
  });
});

describe("callback phase", () => {
  it("resolves an attempt when one is present", () => {
    expect(getCallbackPhase({ attemptId: "attempt-1" })).toEqual({
      kind: "resolving",
      attemptId: "attempt-1",
    });
  });

  it("marks an invalid or expired callback as restartable", () => {
    expect(getCallbackPhase({ error: "GITHUB_APP_STATE_INVALID" })).toEqual({
      kind: "error",
      code: "GITHUB_APP_STATE_INVALID",
      restartable: true,
    });
  });

  it("keeps provider outages as non-restartable errors", () => {
    expect(
      getCallbackPhase({ error: "GITHUB_APP_PROVIDER_UNAVAILABLE" }).kind,
    ).toBe("error");
    expect(
      getCallbackPhase({ error: "GITHUB_APP_PROVIDER_UNAVAILABLE" }),
    ).toMatchObject({ restartable: false });
  });

  it("is idle without callback params", () => {
    expect(getCallbackPhase({})).toEqual({ kind: "idle" });
  });
});

describe("candidate selection", () => {
  it("continues automatically with a single candidate", () => {
    expect(
      getAutoSelectableCandidateId([
        {
          providerInstallationId: "12345678",
          accountLogin: "sharek-org",
          accountType: "organization",
        },
      ]),
    ).toBe("12345678");
  });

  it("asks the user when several candidates exist", () => {
    expect(
      getAutoSelectableCandidateId([
        {
          providerInstallationId: "1",
          accountLogin: "a",
          accountType: "user",
        },
        {
          providerInstallationId: "2",
          accountLogin: "b",
          accountType: "organization",
        },
      ]),
    ).toBeNull();
  });

  it("returns nothing when there are no candidates", () => {
    expect(getAutoSelectableCandidateId([])).toBeNull();
    expect(getAutoSelectableCandidateId(undefined)).toBeNull();
  });
});

describe("start gating", () => {
  const base = {
    installationLinkId: "link-1",
    selectedRepositoryIds: ["123456789"],
    consentAccepted: true,
    isSubmitting: false,
    hasActiveGeneration: false,
  };

  it("allows a consented selection of one to ten repositories", () => {
    expect(canStartGeneration(base)).toBe(true);
    expect(
      canStartGeneration({
        ...base,
        selectedRepositoryIds: Array.from({ length: 10 }, (_, i) => String(i)),
      }),
    ).toBe(true);
  });

  it("requires explicit consent", () => {
    expect(canStartGeneration({ ...base, consentAccepted: false })).toBe(false);
  });

  it("requires at least one and at most ten repositories", () => {
    expect(canStartGeneration({ ...base, selectedRepositoryIds: [] })).toBe(
      false,
    );
    expect(
      canStartGeneration({
        ...base,
        selectedRepositoryIds: Array.from({ length: 11 }, (_, i) => String(i)),
      }),
    ).toBe(false);
  });

  it("requires a selected installation and no in-flight generation", () => {
    expect(canStartGeneration({ ...base, installationLinkId: null })).toBe(
      false,
    );
    expect(canStartGeneration({ ...base, hasActiveGeneration: true })).toBe(
      false,
    );
    expect(canStartGeneration({ ...base, isSubmitting: true })).toBe(false);
  });
});

describe("generation payloads", () => {
  it("submits repository ids and current consent only", () => {
    expect(buildStartGenerationPayload("link-1", ["123456789"])).toEqual({
      installationLinkId: "link-1",
      repositoryIds: ["123456789"],
      consent: { accepted: true, version: "github-skill-analysis-v1" },
    });
  });

  it("builds an accepted consent for retry", () => {
    expect(buildConsent()).toEqual({
      accepted: true,
      version: "github-skill-analysis-v1",
    });
  });
});

describe("installation lookup", () => {
  it("finds the selected link", () => {
    expect(findInstallation([installation], "link-1")).toBe(installation);
    expect(findInstallation([installation], "other")).toBeNull();
    expect(findInstallation(undefined, "link-1")).toBeNull();
    expect(findInstallation([installation], null)).toBeNull();
  });
});
