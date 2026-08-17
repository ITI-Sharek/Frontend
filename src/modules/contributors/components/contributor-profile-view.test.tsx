import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  getPublicProfileSections,
  getVisibleCompletionPrompts,
} from "./contributor-profile-sections";
import { ContributorProfileView } from "./contributor-profile-view";
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

    const reputationHtml = renderToStaticMarkup(
      <ContributorReputationStrip profile={makeProfile()} />,
    );
    expect(reputationHtml).not.toContain("Node.js");
  });

  it("renders repository and contribution facts without profile mock content", () => {
    const html = renderToStaticMarkup(
      <ContributorProfileView
        profile={makeProfile({
          githubInstallations: [
            {
              installationLinkId: "installation-1",
              accountLogin: "sara-dev",
              accountType: "user",
              status: "active",
              verifiedAt: "2026-08-17T08:00:00.000Z",
              manageUrl: null,
              repositories: [
                {
                  repositoryId: "repo-1",
                  fullName: "sara-dev/real-project",
                  visibility: "public",
                  defaultBranch: "main",
                },
              ],
            },
          ],
          contributionHistory: [
            {
              id: "contribution-1",
              title: "Implemented the real project search",
              description: "Published contribution record",
              role: "Contributor",
            },
          ],
        })}
      />,
    );

    expect(html).toContain("sara-dev/real-project");
    expect(html).toContain("Implemented the real project search");
    expect(html).not.toContain("todo-app");
    expect(html).not.toContain("Cairo, Egypt");
    expect(html).not.toContain("Joined Mar 2023");
  });

  it("renders the profile sections with one accessible tabs primitive", () => {
    const html = renderToStaticMarkup(
      <ContributorProfileView profile={makeProfile()} />,
    );

    expect(html.match(/role="tablist"/g)).toHaveLength(1);
    expect(html.match(/role="tab"/g)).toHaveLength(6);
    expect(html.match(/role="tabpanel"/g)).toHaveLength(6);
    expect(html).toContain('aria-label="أقسام الملف الشخصي"');
  });

  it("renders the requested activeSection tab when passed from URL", () => {
    const html = renderToStaticMarkup(
      <ContributorProfileView
        profile={makeProfile()}
        activeSection="skills"
      />,
    );

    expect(html).toContain('id="profile-panel-skills"');
    expect(html).toContain('data-state="active"');
  });
});
