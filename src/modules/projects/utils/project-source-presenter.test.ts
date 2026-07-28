import { describe, expect, it } from "vitest";

import {
  getOwnerTypeLabel,
  getSafeUnavailableAreas,
  sourceNeedsRepositoryControlRecovery,
} from "./project-source-presenter";

describe("getOwnerTypeLabel", () => {
  it("labels user and organization owners", () => {
    expect(getOwnerTypeLabel("user")).toBe("حساب شخصي");
    expect(getOwnerTypeLabel("organization")).toBe("منظمة");
  });

  it("labels an unreconciled legacy owner as unknown rather than defaulting to personal", () => {
    expect(getOwnerTypeLabel("unknown")).toBe("نوع الحساب غير معروف");
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
