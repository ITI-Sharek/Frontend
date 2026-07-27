import { describe, expect, it } from "vitest";

import {
  isRepositorySelectionValid,
  toggleRepositorySelection,
} from "./repository-selection";

const MAX = 10;

describe("repository selection", () => {
  it("selects and deselects by repository id", () => {
    expect(toggleRepositorySelection([], "111", MAX)).toEqual(["111"]);
    expect(toggleRepositorySelection(["111"], "111", MAX)).toEqual([]);
  });

  it("refuses to select more than the maximum", () => {
    const full = Array.from({ length: MAX }, (_, index) => String(index));
    expect(toggleRepositorySelection(full, "extra", MAX)).toEqual(full);
    expect(toggleRepositorySelection(full, "extra", MAX)).toHaveLength(MAX);
  });

  it("still allows deselection at the limit", () => {
    const full = Array.from({ length: MAX }, (_, index) => String(index));
    expect(toggleRepositorySelection(full, "0", MAX)).toHaveLength(MAX - 1);
  });

  it("requires between one and ten unique repositories", () => {
    expect(isRepositorySelectionValid([], MAX)).toBe(false);
    expect(isRepositorySelectionValid(["1"], MAX)).toBe(true);
    expect(
      isRepositorySelectionValid(
        Array.from({ length: MAX }, (_, index) => String(index)),
        MAX,
      ),
    ).toBe(true);
    expect(
      isRepositorySelectionValid(
        Array.from({ length: MAX + 1 }, (_, index) => String(index)),
        MAX,
      ),
    ).toBe(false);
    expect(isRepositorySelectionValid(["1", "1"], MAX)).toBe(false);
  });
});
