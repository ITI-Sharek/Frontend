import { describe, expect, it } from "vitest";

import { validateContributionRequestSearch } from "./tasks.index";

describe("Contribution Request feed search", () => {
  it("preserves both values of the supported reward filter", () => {
    expect(
      validateContributionRequestSearch({ hasReward: "false" }),
    ).toEqual({ hasReward: false });
    expect(validateContributionRequestSearch({ hasReward: true })).toEqual({
      hasReward: true,
    });
  });
});
