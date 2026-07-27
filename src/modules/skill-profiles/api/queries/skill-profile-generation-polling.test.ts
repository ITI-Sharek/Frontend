import { describe, expect, it } from "vitest";

import {
  SKILL_PROFILE_POLL_INTERVAL_MS,
  skillProfileGenerationQueryOptions,
} from "./use-skill-profile-generation-query";
import type {
  SkillProfileGenerationDto,
  SkillProfileGenerationStatus,
} from "../../types/skill-profile-generation.types";

function makeGeneration(
  status: SkillProfileGenerationStatus,
): SkillProfileGenerationDto {
  return {
    generationId: "gen-1",
    status,
    progress: { selectedRepositoryCount: 1, snapshottedRepositoryCount: 0 },
    failureReason: null,
    installationLinkId: "link-1",
    providerInstallationId: "12345678",
    consentVersion: "github-skill-analysis-v1",
    consentedAt: "2026-07-27T10:00:00.000Z",
    authorizationVerifiedAt: "2026-07-27T10:00:00.000Z",
    retryOfGenerationId: null,
    selectedRepositories: [
      { repositoryId: "123456789", fullName: "sharek-org/service" },
    ],
    skills: [],
    fraudSignals: [],
    evidenceQuality: null,
    provider: null,
    model: null,
    promptVersion: null,
    schemaVersion: null,
    serviceVersion: null,
    createdAt: "2026-07-27T10:00:00.000Z",
    updatedAt: "2026-07-27T10:00:00.000Z",
    completedAt: null,
  };
}

function intervalFor(status: SkillProfileGenerationStatus | undefined) {
  const options = skillProfileGenerationQueryOptions({
    generationId: "gen-1",
  });
  const refetchInterval = options.refetchInterval as (query: {
    state: { data: SkillProfileGenerationDto | undefined };
  }) => number | false;
  return refetchInterval({
    state: { data: status ? makeGeneration(status) : undefined },
  });
}

describe("generation polling", () => {
  it("keeps polling through every active status", () => {
    for (const status of [
      "queued",
      "collecting_evidence",
      "analyzing",
    ] as const) {
      expect(intervalFor(status)).toBe(SKILL_PROFILE_POLL_INTERVAL_MS);
    }
  });

  it("stops polling on every terminal status", () => {
    for (const status of [
      "pending_review",
      "needs_more_evidence",
      "failed",
    ] as const) {
      expect(intervalFor(status)).toBe(false);
    }
  });

  it("polls before the first response arrives", () => {
    expect(intervalFor(undefined)).toBe(SKILL_PROFILE_POLL_INTERVAL_MS);
  });

  it("stays disabled without a generation id", () => {
    expect(
      skillProfileGenerationQueryOptions({ generationId: "" }).enabled,
    ).toBe(false);
  });
});
