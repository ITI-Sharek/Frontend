import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { SkillProfileGenerationDto } from "@/modules/skill-profiles";

import { ContributorWalkthrough } from "./contributor-walkthrough";
import type { ContributorProfileDto } from "../../types/contributor-profile.types";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

const profile: ContributorProfileDto = {
  username: "sara",
  displayName: "Sara Ahmed",
  avatarUrl: null,
  roleLabel: "Contributor",
  bio: "Frontend contributor",
  skills: [],
  availability: null,
  githubStatus: { connected: true, username: "sara-dev" },
  githubInstallations: [
    {
      installationLinkId: "link-1",
      accountLogin: "sara-dev",
      accountType: "user",
      status: "active",
      verifiedAt: "2026-08-17T08:00:00.000Z",
      manageUrl: null,
      repositories: [],
    },
  ],
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
  completionPrompts: ["generate_skills"],
  viewerRelationship: "owner",
  experienceLevel: {
    id: "level-1",
    key: "one_to_three",
    labelEn: "1–3 years",
    labelAr: "١–٣ سنوات",
  },
  fields: [{ id: "field-1", key: "web", labelEn: "Web", labelAr: "ويب" }],
  declaredSkills: [],
};

const generation: SkillProfileGenerationDto = {
  generationId: "generation-1",
  status: "analyzing",
  progress: { selectedRepositoryCount: 3, snapshottedRepositoryCount: 2 },
  failureReason: null,
  installationLinkId: "link-1",
  providerInstallationId: "provider-1",
  consentVersion: "1",
  consentedAt: "2026-08-17T08:00:00.000Z",
  authorizationVerifiedAt: "2026-08-17T08:00:00.000Z",
  retryOfGenerationId: null,
  selectedRepositories: [],
  skills: [],
  fraudSignals: [],
  evidenceQuality: null,
  provider: null,
  model: null,
  promptVersion: null,
  schemaVersion: null,
  serviceVersion: null,
  createdAt: "2026-08-17T08:00:00.000Z",
  updatedAt: "2026-08-17T08:00:00.000Z",
  completedAt: null,
};

describe("ContributorWalkthrough", () => {
  it("shows live generation progress instead of simulated stages", () => {
    const html = renderToStaticMarkup(
      <ContributorWalkthrough
        profile={profile}
        generation={generation}
        profileEditHref="/profile/edit"
        analysisHref="/settings?section=github"
        exploreHref="/explore"
        dashboardHref="/dashboard"
      />,
    );

    expect(html).toContain("2 من 3");
    expect(html).toContain("/settings?section=github");
    expect(html).not.toContain("sara-dev/real-project");
  });
});
