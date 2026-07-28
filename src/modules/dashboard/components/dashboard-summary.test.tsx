import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DashboardSummary } from "./dashboard-summary";
import type {
  ApplicationsSummaryDto,
  GrowthSummaryDto,
} from "../types/dashboard.types";

const growth: GrowthSummaryDto = {
  ratingPrevious: 4.6,
  ratingCurrent: 4.8,
  completedCount: 6,
  successRate: 92,
  skillsVerifiedThisMonth: 2,
};

const applications: ApplicationsSummaryDto = { pendingOwnerReviewCount: 3 };

describe("DashboardSummary", () => {
  it("shows the pending-owner-review count without an AI eligibility bucket", () => {
    const html = renderToStaticMarkup(
      <DashboardSummary growth={growth} applications={applications} />,
    );

    expect(html).toContain("بانتظار صاحب المشروع");
    expect(html).toContain("3");
    expect(html).not.toContain("مؤهلة");
    expect(html).not.toContain("eligible");
  });
});
