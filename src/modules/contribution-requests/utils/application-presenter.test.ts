import { describe, expect, it } from "vitest";

import {
  getApplicationReviewTiming,
  getApplicationStatusMeta,
} from "./application-presenter";
import type { ApplicationDto } from "../types/application.types";

const pendingApplication: ApplicationDto = {
  id: "application-1",
  contributionRequestId: "request-1",
  contributor: { id: "user-1", username: "sara", displayName: "Sara" },
  profileContext: {
    bio: null,
    availability: null,
    experienceLevel: null,
    fields: [],
    declaredSkills: [],
  },
  contributionApproach: "A tested implementation approach.",
  proposedDeliveryDurationDays: 5,
  status: "PENDING_OWNER_REVIEW",
  requirementSnapshot: { required: [], preferred: [] },
  evidenceSummary: [],
  submittedAt: "2026-07-28T10:00:00.000Z",
  reviewDueAt: "2026-07-31T10:00:00.000Z",
  expiresAt: "2026-08-04T10:00:00.000Z",
  expiredAt: null,
  overdue: false,
  ownerDecision: null,
  assignment: null,
};

describe("Application presentation", () => {
  it.each([
    "ACCEPTED",
    "DECLINED_BY_OWNER",
    "NOT_SELECTED",
    "EXPIRED",
    "WITHDRAWN",
    "REQUEST_CANCELLED",
  ] as const)("gives %s distinct explicit outcome copy", (status) => {
    const meta = getApplicationStatusMeta(status);
    expect(meta.label).not.toBe("");
    expect(meta.description).not.toBe("");
    expect(meta.icon).toBeTypeOf("object");
  });

  it("states neutral effects for every non-accepted terminal outcome", () => {
    for (const status of [
      "DECLINED_BY_OWNER",
      "NOT_SELECTED",
      "EXPIRED",
      "WITHDRAWN",
      "REQUEST_CANCELLED",
    ] as const) {
      expect(getApplicationStatusMeta(status).neutralEffect).toMatch(
        /لا (?:ي|ت)ؤثر/,
      );
    }
  });

  it("uses the backend overdue flag instead of calculating workflow state", () => {
    expect(
      getApplicationReviewTiming({ ...pendingApplication, overdue: false }).label,
    ).toBe("بانتظار المراجعة");
    expect(
      getApplicationReviewTiming({ ...pendingApplication, overdue: true }).label,
    ).toBe("تحتاج قرارًا الآن");
  });
});
