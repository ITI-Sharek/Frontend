import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SkillAnalysisConsent } from "./skill-analysis-consent";
import { SkillGenerationStatusPanel } from "./skill-generation-status-panel";
import type {
  SkillProfileGenerationDto,
  SkillProfileGenerationStatus,
} from "../types/skill-profile-generation.types";

function makeGeneration(
  status: SkillProfileGenerationStatus,
  overrides: Partial<SkillProfileGenerationDto> = {},
): SkillProfileGenerationDto {
  return {
    generationId: "gen-1",
    status,
    progress: { selectedRepositoryCount: 2, snapshottedRepositoryCount: 1 },
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
    ...overrides,
  };
}

const noop = () => {};

describe("skill analysis consent", () => {
  it("renders unchecked when consent has not been given", () => {
    const html = renderToStaticMarkup(
      <SkillAnalysisConsent accepted={false} onChange={noop} />,
    );
    expect(html).toContain('data-state="unchecked"');
    expect(html).toContain("github-skill-analysis-v1");
    expect(html).toContain("أوافق صراحةً");
  });

  it("reflects an explicit acceptance", () => {
    const html = renderToStaticMarkup(
      <SkillAnalysisConsent accepted onChange={noop} />,
    );
    expect(html).toContain('data-state="checked"');
  });
});

describe("generation status panel", () => {
  it("renders every status without crashing", () => {
    for (const status of [
      "queued",
      "collecting_evidence",
      "analyzing",
      "pending_review",
      "needs_more_evidence",
      "failed",
    ] as const) {
      const html = renderToStaticMarkup(
        <SkillGenerationStatusPanel
          generation={makeGeneration(status)}
          onRetry={noop}
        />,
      );
      expect(html).toContain("حالة التحليل");
    }
  });

  it("presents pending_review as awaiting admin review, not approved", () => {
    const html = renderToStaticMarkup(
      <SkillGenerationStatusPanel
        generation={makeGeneration("pending_review", {
          skills: [
            {
              id: "skill-1",
              name: "TypeScript",
              proficiency: "intermediate",
              confidence: 0.9,
              status: "pending",
              evidenceSummary: null,
            },
          ],
        })}
        onRetry={noop}
      />,
    );
    expect(html).toContain("بانتظار مراجعة الإدارة");
    expect(html).toContain("قيد المراجعة");
    expect(html).not.toContain("إعادة المحاولة");
  });

  it("shows the safe failure reason and a retry action when failed", () => {
    const html = renderToStaticMarkup(
      <SkillGenerationStatusPanel
        generation={makeGeneration("failed", {
          failureReason: "تعذّر الوصول إلى أحد المستودعات",
        })}
        onRetry={noop}
      />,
    );
    expect(html).toContain("تعذّر الوصول إلى أحد المستودعات");
    expect(html).toContain("إعادة المحاولة");
  });

  it("offers retry for needs_more_evidence only alongside fresh consent", () => {
    const html = renderToStaticMarkup(
      <SkillGenerationStatusPanel
        generation={makeGeneration("needs_more_evidence")}
        onRetry={noop}
        retryDisabled
        retryConsentSlot={
          <SkillAnalysisConsent accepted={false} onChange={noop} />
        }
      />,
    );
    expect(html).toContain("إعادة المحاولة");
    expect(html).toContain("أوافق صراحةً");
    expect(html).toContain("disabled");
  });

  it("does not offer retry while the generation is still running", () => {
    const html = renderToStaticMarkup(
      <SkillGenerationStatusPanel
        generation={makeGeneration("analyzing")}
        onRetry={noop}
      />,
    );
    expect(html).not.toContain("إعادة المحاولة");
  });
});
