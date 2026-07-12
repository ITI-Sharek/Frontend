import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  getPublicProfileSections,
  getVisibleCompletionPrompts,
} from "./contributor-profile-sections";
import { ContributorProfileView } from "./contributor-profile-view";
import type { ContributorProfileDto } from "../types/contributor-profile.types";

function makeProfile(
  overrides: Partial<ContributorProfileDto> = {},
): ContributorProfileDto {
  return {
    username: "sara",
    displayName: "Sara Ahmed",
    avatarUrl: null,
    roleLabel: "Contributor",
    bio: "Frontend engineer",
    skills: [
      {
        name: "React",
        proficiencyLevel: "advanced",
        confidence: 0.92,
        status: "approved",
        evidenceSummary: "Detected from GitHub repositories",
      },
    ],
    availability: "10 hours/week",
    githubStatus: { connected: true, username: "sara-dev" },
    reputationSummary: { rating: 4.8, reviewsCount: 6 },
    contributionHistory: [
      {
        id: "history-1",
        title: "Design system",
        description: "Built reusable components",
        role: "Frontend",
      },
    ],
    completionPrompts: ["Add more skills"],
    viewerRelationship: "owner",
    ...overrides,
  };
}

describe("contributor profile view helpers", () => {
  it("detects populated profile sections", () => {
    expect(getPublicProfileSections(makeProfile())).toEqual({
      hasSkills: true,
      hasHistory: true,
      hasBio: true,
      hasAvailability: true,
    });
  });

  it("detects empty profile sections", () => {
    expect(
      getPublicProfileSections(
        makeProfile({
          bio: null,
          skills: [],
          availability: null,
          contributionHistory: [],
        }),
      ),
    ).toEqual({
      hasSkills: false,
      hasHistory: false,
      hasBio: false,
      hasAvailability: false,
    });
  });

  it("hides completion prompts from non-owner viewers", () => {
    expect(
      getVisibleCompletionPrompts(
        makeProfile({ viewerRelationship: "authenticated-viewer" }),
      ),
    ).toEqual([]);
  });

  it("renders actionable empty states for missing optional profile sections", () => {
    const html = renderToStaticMarkup(
      <ContributorProfileView
        profile={makeProfile({
          bio: null,
          skills: [],
          availability: null,
          contributionHistory: [],
          reputationSummary: { rating: null, reviewsCount: 0 },
          githubStatus: { connected: false, username: null },
        })}
      />,
    );

    expect(html).toContain("أضف نبذة تعريفية");
    expect(html).toContain("لا توجد مهارات بعد");
    expect(html).toContain("لا توجد مساهمات منشورة");
    expect(html).toContain("غير محددة");
    expect(html).toContain("جديد");
  });

  it("does not render owner completion prompts for authenticated non-owner viewers", () => {
    const html = renderToStaticMarkup(
      <ContributorProfileView
        profile={makeProfile({
          completionPrompts: ["Add private onboarding details"],
          viewerRelationship: "authenticated-viewer",
        })}
      />,
    );

    expect(html).toContain("عرض عام للمساهم");
    expect(html).not.toContain("Add private onboarding details");
    expect(html).not.toContain("أكمل ملفك");
  });
});
