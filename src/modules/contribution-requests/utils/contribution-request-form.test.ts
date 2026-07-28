import { describe, expect, it } from "vitest";

import {
  toContributionRequestPayload,
  validateContributionRequestForm,
} from "./contribution-request-form";
import type { ContributionRequestFormState } from "../types/contribution-request.types";

describe("Contribution Request form contract", () => {
  it("preserves Requirement order and converts local close time to ISO", () => {
    const form = validForm();
    form.requiredRequirements = ["First outcome", "Second outcome"];

    const payload = toContributionRequestPayload(form);

    expect(payload.requiredRequirements).toEqual([
      { text: "First outcome" },
      { text: "Second outcome" },
    ]);
    expect(payload.applicationsCloseTime).toBe(
      new Date("2030-03-10T12:00").toISOString(),
    );
    expect(payload).not.toHaveProperty("ownerId");
  });

  it("rejects duplicate and cross-classified Requirements", () => {
    const errors = validateContributionRequestForm(
      {
        ...validForm(),
        requiredRequirements: ["Tested endpoint", "tested endpoint"],
        preferredRequirements: ["TESTED ENDPOINT"],
      },
      "en",
      new Date("2026-01-01T00:00:00.000Z"),
    );

    expect(errors.requiredRequirements).toContain("cannot be duplicated");
    expect(errors.preferredRequirements).toContain("cannot be duplicated");
  });

  it("enforces close/target boundaries with a controllable current time", () => {
    const past = validateContributionRequestForm(
      { ...validForm(), applicationsCloseTime: "2025-12-31T23:59" },
      "en",
      new Date("2026-01-01T00:00:00.000Z"),
    );
    expect(past.applicationsCloseTime).toContain("future");

    const invalidTarget = validateContributionRequestForm(
      {
        ...validForm(),
        applicationsCloseTime: "2030-03-10T12:00",
        targetCompletionDate: "2030-03-10",
      },
      "en",
      new Date("2026-01-01T00:00:00.000Z"),
    );
    expect(invalidTarget.targetCompletionDate).toContain("after");

    const impossibleTarget = validateContributionRequestForm(
      { ...validForm(), targetCompletionDate: "2030-02-30" },
      "en",
      new Date("2026-01-01T00:00:00.000Z"),
    );
    expect(impossibleTarget.targetCompletionDate).toBeDefined();
  });

  it("requires a valid reward and currency pair", () => {
    const missingCurrency = validateContributionRequestForm(
      { ...validForm(), reward: "150", rewardCurrency: "" },
      "en",
      new Date("2026-01-01T00:00:00.000Z"),
    );
    expect(missingCurrency.rewardCurrency).toContain("together");

    const decimals = validateContributionRequestForm(
      { ...validForm(), reward: "1.999", rewardCurrency: "USD" },
      "en",
      new Date("2026-01-01T00:00:00.000Z"),
    );
    expect(decimals.reward).toContain("two decimal");
  });
});

function validForm(): ContributionRequestFormState {
  return {
    title: "Build a webhook viewer",
    description: "Implement the private draft workflow safely.",
    requiredRequirements: ["Deliver tested endpoints"],
    preferredRequirements: ["Document the contract"],
    technologyTags: ["NestJS"],
    applicationsCloseTime: "2030-03-10T12:00",
    targetCompletionDate: "2030-03-20",
    difficulty: "intermediate",
    reward: "150",
    rewardCurrency: "usd",
  };
}
