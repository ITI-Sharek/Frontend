import { describe, expect, it } from "vitest";

import i18n from "@/lib/i18n";
import {
  getOwnerTypeLabel,
  getSafeUnavailableAreas,
  sourceNeedsRepositoryControlRecovery,
} from "./project-source-presenter";

// Tests pin the language to Arabic in vitest.setup.ts, so the shared i18n
// instance resolves real strings — the same strings the components render.
const t = i18n.getFixedT("ar");

describe("getOwnerTypeLabel", () => {
  it("labels user and organization owners", () => {
    expect(getOwnerTypeLabel(t, "user")).toBe("حساب شخصي");
    expect(getOwnerTypeLabel(t, "organization")).toBe("منظمة");
  });

  it("labels an unreconciled legacy owner as unknown rather than defaulting to personal", () => {
    expect(getOwnerTypeLabel(t, "unknown")).toBe("نوع الحساب غير معروف");
  });
});

describe("sourceNeedsRepositoryControlRecovery", () => {
  it("flags authorization-required and revoked states", () => {
    expect(
      sourceNeedsRepositoryControlRecovery({
        authorizationStatus: "authorization_required",
      }),
    ).toBe(true);
    expect(
      sourceNeedsRepositoryControlRecovery({ authorizationStatus: "revoked" }),
    ).toBe(true);
  });

  it("flags unselected and revoked selection states", () => {
    expect(
      sourceNeedsRepositoryControlRecovery({ selectionStatus: "unselected" }),
    ).toBe(true);
    expect(
      sourceNeedsRepositoryControlRecovery({ selectionStatus: "revoked" }),
    ).toBe(true);
  });

  it("does not flag a healthy authorized/selected source", () => {
    expect(
      sourceNeedsRepositoryControlRecovery({
        authorizationStatus: "authorized",
        selectionStatus: "selected",
      }),
    ).toBe(false);
  });

  it("does not flag an absent status as needing recovery", () => {
    expect(sourceNeedsRepositoryControlRecovery({})).toBe(false);
  });
});

describe("getSafeUnavailableAreas", () => {
  it("returns the backend's array as-is", () => {
    expect(getSafeUnavailableAreas({ unavailableAreas: ["statistics"] })).toEqual([
      "statistics",
    ]);
  });

  it("defaults to an empty array when absent", () => {
    expect(getSafeUnavailableAreas({})).toEqual([]);
  });
});
