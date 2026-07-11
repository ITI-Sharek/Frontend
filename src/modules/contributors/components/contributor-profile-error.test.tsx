import { describe, expect, it } from "vitest";

import { getContributorProfileErrorMessage } from "./contributor-profile-error";

describe("contributor profile error", () => {
  it("uses a default retryable profile error message", () => {
    expect(getContributorProfileErrorMessage()).toContain("تعذر تحميل");
  });

  it("uses a custom retryable profile error message", () => {
    expect(getContributorProfileErrorMessage("Retry later")).toBe("Retry later");
  });
});
