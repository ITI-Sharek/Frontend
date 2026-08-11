import { describe, expect, it } from "vitest";

import {
  getOwnerContributionRequestStatusMeta,
  isContributionRequestApplicationsClosed,
} from "./contribution-request-status";

describe("owner Contribution Request time-based status", () => {
  const now = new Date("2026-08-08T12:00:00.000Z");

  it("closes a published Request at the exact Applications Close Time", () => {
    const request = {
      status: "published" as const,
      applicationsCloseTime: now.toISOString(),
    };

    expect(isContributionRequestApplicationsClosed(request, now)).toBe(true);
    expect(getOwnerContributionRequestStatusMeta(request, now).label).toBe(
      "التقديم مغلق",
    );
  });

  it("keeps a future published Request active", () => {
    expect(
      isContributionRequestApplicationsClosed(
        {
          status: "published",
          applicationsCloseTime: "2026-08-08T12:00:01.000Z",
        },
        now,
      ),
    ).toBe(false);
  });

  it("does not apply the close-time presentation to other lifecycle states", () => {
    expect(
      isContributionRequestApplicationsClosed(
        {
          status: "cancelled",
          applicationsCloseTime: "2020-08-05T12:00:00.000Z",
        },
        now,
      ),
    ).toBe(false);
  });
});
