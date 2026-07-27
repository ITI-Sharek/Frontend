import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

import {
  canRetryGeneration,
  getActiveGenerationIdFromError,
  getGenerationProgressPercent,
  getGenerationStatusMeta,
  getSkillProfileErrorMessage,
  isGenerationActive,
  isGenerationTerminal,
} from "./skill-generation-presenter";
import type { SkillProfileGenerationStatus } from "../types/skill-profile-generation.types";

const ALL_STATUSES: SkillProfileGenerationStatus[] = [
  "queued",
  "collecting_evidence",
  "analyzing",
  "pending_review",
  "needs_more_evidence",
  "failed",
];

function apiError(code: string, metadata?: unknown) {
  return new AxiosError("failed", "409", undefined, undefined, {
    status: 409,
    statusText: "",
    headers: {},
    config: { headers: {} },
    data: { statusCode: 409, code, message: "failed", metadata },
  } as never);
}

describe("generation status presenter", () => {
  it("describes every status", () => {
    for (const status of ALL_STATUSES) {
      const meta = getGenerationStatusMeta(status);
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
    }
  });

  it("marks exactly the documented terminal statuses", () => {
    const terminal = ALL_STATUSES.filter(isGenerationTerminal);
    expect(terminal).toEqual([
      "pending_review",
      "needs_more_evidence",
      "failed",
    ]);
    expect(ALL_STATUSES.filter(isGenerationActive)).toEqual([
      "queued",
      "collecting_evidence",
      "analyzing",
    ]);
  });

  it("never presents pending_review as approved", () => {
    const meta = getGenerationStatusMeta("pending_review");
    expect(meta.description).toContain("بانتظار اعتماد الإدارة");
    expect(meta.label).not.toContain("معتمد");
    expect(meta.description).not.toMatch(/تم الاعتماد|معتمدة بالفعل/);
  });

  it("asks for clearer contributions on needs_more_evidence", () => {
    expect(getGenerationStatusMeta("needs_more_evidence").description).toContain(
      "مستودعات",
    );
  });

  it("offers retry only for failed and needs_more_evidence", () => {
    const retryable = ALL_STATUSES.filter((status) =>
      canRetryGeneration({ status }),
    );
    expect(retryable).toEqual(["needs_more_evidence", "failed"]);
    expect(canRetryGeneration(null)).toBe(false);
  });

  it("derives progress from snapshotted repositories", () => {
    expect(
      getGenerationProgressPercent({
        status: "collecting_evidence",
        progress: { selectedRepositoryCount: 4, snapshottedRepositoryCount: 1 },
      }),
    ).toBe(25);
    expect(
      getGenerationProgressPercent({
        status: "pending_review",
        progress: { selectedRepositoryCount: 4, snapshottedRepositoryCount: 0 },
      }),
    ).toBe(100);
    expect(
      getGenerationProgressPercent({
        status: "queued",
        progress: { selectedRepositoryCount: 0, snapshottedRepositoryCount: 0 },
      }),
    ).toBe(0);
  });

  it("maps documented skill-profile error codes to safe copy", () => {
    const fallback = getSkillProfileErrorMessage("UNKNOWN_CODE");
    for (const code of [
      "SKILL_PROFILE_ANALYSIS_CONSENT_REQUIRED",
      "SKILL_PROFILE_GENERATION_ALREADY_ACTIVE",
      "SKILL_PROFILE_QUEUE_UNAVAILABLE",
      "SKILL_PROFILE_GENERATION_NOT_RETRYABLE",
      "SKILL_PROFILE_GENERATION_NOT_FOUND",
      "SKILL_PROFILE_GENERATION_FORBIDDEN",
      "SKILL_PROFILE_REPOSITORY_SELECTION_LIMIT_EXCEEDED",
      "SKILL_PROFILE_REPOSITORY_SELECTION_DUPLICATE",
      "SKILL_PROFILE_REPOSITORY_ID_INVALID",
    ]) {
      expect(getSkillProfileErrorMessage(code)).not.toBe(fallback);
    }
  });

  it("extracts the active generation id from a duplicate start", () => {
    expect(
      getActiveGenerationIdFromError(
        apiError("SKILL_PROFILE_GENERATION_ALREADY_ACTIVE", {
          generationId: "gen-active",
        }),
      ),
    ).toBe("gen-active");
  });

  it("ignores metadata from unrelated errors", () => {
    expect(
      getActiveGenerationIdFromError(
        apiError("SKILL_PROFILE_QUEUE_UNAVAILABLE", {
          generationId: "gen-active",
        }),
      ),
    ).toBeNull();
    expect(getActiveGenerationIdFromError(new Error("boom"))).toBeNull();
  });
});
