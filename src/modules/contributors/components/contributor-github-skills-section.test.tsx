import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  ContributorGithubSkillsSection,
  getGithubSkillsSectionModel,
} from "./contributor-github-skills-section";
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
    bio: null,
    skills: [],
    availability: null,
    githubStatus: { connected: false, username: null },
    githubInstallations: [],
    reputationSummary: {
      rating: null,
      reviewsCount: 0,
      completedContributions: 0,
      totalAssignedTasks: 0,
      successRate: 0,
      topVerifiedSkills: [],
    },
    badges: [],
    contributionHistory: [],
    completionPrompts: [],
    viewerRelationship: "owner",
    experienceLevel: null,
    fields: [],
    declaredSkills: [],
    ...overrides,
  };
}

const installation = {
  installationLinkId: "link-1",
  accountLogin: "sharek-org",
  accountType: "organization" as const,
  status: "active" as const,
  verifiedAt: "2026-07-26T10:00:00.000Z",
  manageUrl: null,
  repositories: [],
};

describe("optional github skills section", () => {
  it("works with no GitHub installation and never blocks the profile", () => {
    const html = renderToStaticMarkup(
      <ContributorGithubSkillsSection profile={makeProfile()} />,
    );
    expect(html).toContain("اختياري");
    expect(html).toContain("لا يوجد أي ربط لتطبيق GitHub");
    expect(html).toContain("/settings");
  });

  it("keeps GitHub social login independent from repository analysis", () => {
    const model = getGithubSkillsSectionModel(
      makeProfile({ githubStatus: { connected: true, username: "sara-dev" } }),
    );
    // Social login being connected never implies repository authorization.
    expect(model.socialLoginConnected).toBe(true);
    expect(model.hasActiveInstallation).toBe(false);
  });

  it("lists every installation for the owner", () => {
    const html = renderToStaticMarkup(
      <ContributorGithubSkillsSection
        profile={makeProfile({
          githubInstallations: [
            installation,
            {
              ...installation,
              installationLinkId: "link-2",
              accountLogin: "sara-dev",
              accountType: "user",
              status: "reauthorization_required",
            },
          ],
        })}
      />,
    );
    expect(html).toContain("sharek-org");
    expect(html).toContain("sara-dev");
    expect(html).toContain("يحتاج إعادة تفويض");
  });

  it("shows the repositories selected in each GitHub App installation", () => {
    const html = renderToStaticMarkup(
      <ContributorGithubSkillsSection
        profile={makeProfile({
          githubInstallations: [
            {
              ...installation,
              repositories: [
                {
                  repositoryId: "repo-1",
                  fullName: "sharek-org/selected-project",
                  visibility: "private",
                  defaultBranch: "main",
                },
              ],
            },
          ],
        })}
      />,
    );

    expect(html).toContain("sharek-org/selected-project");
  });

  it("hides private installation information from other viewers", () => {
    const profile = makeProfile({
      viewerRelationship: "authenticated-viewer",
      githubInstallations: [installation],
    });

    expect(getGithubSkillsSectionModel(profile)).toMatchObject({
      visible: false,
      installations: [],
    });
    expect(
      renderToStaticMarkup(
        <ContributorGithubSkillsSection profile={profile} />,
      ),
    ).toBe("");
  });
});
