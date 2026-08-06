import { describe, expect, it } from "vitest";

import type { ContributionProposalVersionDto } from "../types/contribution-proposal.types";
import { toProposalFields } from "./proposal-fields";

const CANONICAL_KEYS = [
  "problemOrOpportunity",
  "projectBenefit",
  "proposedOutcome",
  "title",
];

describe("toProposalFields", () => {
  it("drops the non-editable keys carried by a version payload", () => {
    const version: ContributionProposalVersionDto = {
      version: 3,
      title: "عنوان",
      problemOrOpportunity: "مشكلة",
      proposedOutcome: "نتيجة",
      projectBenefit: "فائدة",
      authoredBy: "contributor-id",
      createdAt: "2026-08-05T10:00:00.000Z",
    };

    const fields = toProposalFields(version);

    expect([...Object.keys(fields)].sort()).toEqual(CANONICAL_KEYS);
    expect(fields).toEqual({
      title: "عنوان",
      problemOrOpportunity: "مشكلة",
      proposedOutcome: "نتيجة",
      projectBenefit: "فائدة",
    });
  });

  it("coerces non-string values instead of throwing", () => {
    const fields = toProposalFields({
      title: 3,
      problemOrOpportunity: null,
    } as never);

    expect(fields.title).toBe("");
    expect(fields.problemOrOpportunity).toBe("");
  });

  it("trims surrounding whitespace", () => {
    expect(toProposalFields({ title: "  عنوان  " }).title).toBe("عنوان");
  });

  it("returns empty canonical fields for an absent value", () => {
    expect(toProposalFields(undefined)).toEqual({
      title: "",
      problemOrOpportunity: "",
      proposedOutcome: "",
      projectBenefit: "",
    });
  });
});
