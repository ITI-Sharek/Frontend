import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  getPublicProfileSections,
  getVisibleCompletionPrompts,
} from "./contributor-profile-sections";
import {
  ContributorProfileView,
  getVisitorProfilePreview,
} from "./contributor-profile-view";
import { ContributorReputationStrip } from "./contributor-reputation-strip";
import type { ContributorProfileDto } from "../types/contributor-profile.types";

// `Link` needs a RouterProvider; these are markup-only assertions.
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

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
    githubInstallations: [],
    reputationSummary: {
      rating: 4.8,
      reviewsCount: 6,
      completedContributions: 1,
      totalAssignedTasks: 1,
      successRate: 100,
      topVerifiedSkills: [
        { name: "React", verifiedContributionCount: 1 },
      ],
    },
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
    experienceLevel: {
      id: "level-five-to-ten",
      key: "five_to_ten",
      labelEn: "5-10 years",
      labelAr: "5-10 سنوات",
    },
    fields: [
      { id: "field-web", key: "web", labelEn: "Web", labelAr: "الويب" },
      { id: "field-ai", key: "ai", labelEn: "AI", labelAr: "الذكاء الاصطناعي" },
    ],
    declaredSkills: ["React", "Node.js"],
    ...overrides,
  };
}

describe("contributor profile view helpers", () => {
  it("removes owner-only profile details from the visitor preview", () => {
    const preview = getVisitorProfilePreview(
      makeProfile({
        skills: [
          ...makeProfile().skills,
          {
            name: "Docker",
            proficiencyLevel: "intermediate",
            confidence: 0.7,
            status: "pending",
            evidenceSummary: "Pending review",
          },
        ],
      }),
    );

    expect(preview.viewerRelationship).toBe("authenticated-viewer");
    expect(preview.completionPrompts).toEqual([]);
    expect(preview.declaredSkills).toEqual([]);
    expect(preview.githubInstallations).toEqual([]);
    expect(preview.skills.map((skill) => skill.name)).toEqual(["React"]);
  });

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
          reputationSummary: {
            rating: null,
            reviewsCount: 0,
            completedContributions: 0,
            totalAssignedTasks: 0,
            successRate: 0,
            topVerifiedSkills: [],
          },
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

  it("renders backend-projected reputation metrics and verified skills", () => {
    const html = renderToStaticMarkup(
      <ContributorProfileView
        profile={(
          {
            ...makeProfile(),
            reputationSummary: {
              rating: 4.7,
              reviewsCount: 6,
              completedContributions: 13,
              totalAssignedTasks: 14,
              successRate: 92.86,
              topVerifiedSkills: [
                { name: "React", verifiedContributionCount: 6 },
                { name: "TypeScript", verifiedContributionCount: 5 },
              ],
            },
          }
        )}
      />,
    );

    expect(html).toContain("92.9%");
    expect(html).toContain("13");
    expect(html).toContain("React");
    expect(html).toContain("6 مساهمات موثقة");
    expect(html).toContain("TypeScript");

    expect(html).toContain("البيانات الشخصية");
    expect(html).toContain("ملف موثّق");
    expect(html).toContain("عرض كزائر");

    const reputationHtml = renderToStaticMarkup(
      <ContributorReputationStrip profile={makeProfile()} />,
    );
    expect(reputationHtml).not.toContain("Node.js");
  });
});
