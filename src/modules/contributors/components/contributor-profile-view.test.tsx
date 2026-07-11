import { describe, expect, it } from "vitest";

import {
  getPublicProfileSections,
  getVisibleCompletionPrompts,
} from "./contributor-profile-sections";
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
    skills: [{ id: "skill-1", name: "React" }],
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
});
