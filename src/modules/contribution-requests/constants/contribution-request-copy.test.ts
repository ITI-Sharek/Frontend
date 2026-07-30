import { describe, expect, it } from "vitest";

import { getContributionRequestErrorMessage } from "./contribution-request-copy";

describe("Contribution Request localized stable errors", () => {
  it("maps the safe 404 without exposing whether another owner has the id", () => {
    const error = apiError(404, "CONTRIBUTION_REQUEST_NOT_FOUND");
    expect(getContributionRequestErrorMessage(error, "ar")).toContain(
      "غير متاح لهذا الحساب",
    );
    expect(getContributionRequestErrorMessage(error, "en")).toContain(
      "unavailable to this account",
    );
    expect(getContributionRequestErrorMessage(error, "en")).not.toMatch(
      /another owner|exists/i,
    );
  });

  it("uses actionable copy for concurrency and Project publication", () => {
    expect(
      getContributionRequestErrorMessage(
        apiError(409, "CONTRIBUTION_REQUEST_CONCURRENT_MODIFICATION"),
        "en",
      ),
    ).toContain("latest version");
    expect(
      getContributionRequestErrorMessage(
        apiError(409, "CONTRIBUTION_REQUEST_PROJECT_NOT_PUBLISHED"),
        "ar",
      ),
    ).toContain("انشر المشروع");
  });

  it("preserves explicit session-expiry behavior", () => {
    expect(getContributionRequestErrorMessage(apiError(401), "en")).toContain(
      "session expired",
    );
  });

  it("maps malformed Requirement payloads at the triggering form action", () => {
    const error = apiError(
      400,
      "CONTRIBUTION_REQUEST_REQUIREMENT_INPUT_INVALID",
    );

    expect(getContributionRequestErrorMessage(error, "ar")).toContain(
      "صيغة المتطلبات",
    );
    expect(getContributionRequestErrorMessage(error, "en")).toContain(
      "Requirement format",
    );
  });
});

function apiError(status: number, code?: string) {
  return {
    isAxiosError: true,
    response: { status, data: code ? { code } : {} },
  };
}
