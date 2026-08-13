import { describe, expect, it } from "vitest";

import i18n from "@/lib/i18n";

import { getContributorProfileErrorMessage } from "./contributor-profile-error";

describe("contributor profile error", () => {
  it("uses the translated default profile error message", () => {
    const t = i18n.getFixedT("ar");
    expect(getContributorProfileErrorMessage(t)).toBe(
      "تعذر تحميل ملف المساهم. حاول مرة أخرى.",
    );
  });

  it("uses a custom retryable profile error message", () => {
    const t = i18n.getFixedT("ar");
    expect(
      getContributorProfileErrorMessage(t, "Retry later"),
    ).toBe("Retry later");
  });
});
