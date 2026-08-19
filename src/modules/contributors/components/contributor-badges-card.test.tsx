import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ContributorBadgesCard } from "./contributor-badges-card";

describe("ContributorBadgesCard", () => {
  it("renders the empty state when the contributor has no badges", () => {
    const html = renderToStaticMarkup(<ContributorBadgesCard />);

    expect(html).toContain("تظهر الإنجازات تلقائيًا");
  });

  it("renders the first-contribution badge earned by the contributor", () => {
    const html = renderToStaticMarkup(
      <ContributorBadgesCard
        badges={[
          {
            id: "badge-1",
            badgeType: "first_contribution",
            awardedAt: "2026-08-18T13:00:00.000Z",
          },
        ]}
      />,
    );

    expect(html).toContain("أول مساهمة");
    expect(html).toContain("تم اعتماد أول تسليم لك");
  });
});
