// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OwnerMatchingPanel } from "./owner-matching-panel";

const mocks = vi.hoisted(() => ({
  ownerQuery: vi.fn(),
  generateMutation: vi.fn(),
  inviteMutation: vi.fn(),
}));

vi.mock("../api/queries/use-matching-queries", () => ({
  useOwnerMatchesQuery: mocks.ownerQuery,
}));
vi.mock("../api/mutations/use-matching-mutations", () => ({
  useGenerateOwnerMatchesMutation: mocks.generateMutation,
  useInviteMatchedContributorMutation: mocks.inviteMutation,
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const completed = {
  requestId: "request-1",
  planType: "silver" as const,
  resultLimit: 5 as const,
  status: "completed" as const,
  matches: [
    {
      contributorId: "contributor-1",
      contributorName: "Sara Ahmed",
      contributorUsername: "sara-dev",
      matchScore: 0.94,
      confidence: "HIGH" as const,
      justification: "Strong Node.js and REST evidence.",
      matchedSkills: [
        {
          name: "Node.js",
          proficiency: "advanced" as const,
          evidenceIds: ["skill-1"],
        },
      ],
      evidenceIds: ["skill-1", "requirement-1"],
      rank: 1,
    },
  ],
};

describe("OwnerMatchingPanel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    mocks.ownerQuery.mockReturnValue({
      data: completed,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    mocks.generateMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mocks.inviteMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ created: true }),
      isPending: false,
    });
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    vi.clearAllMocks();
  });

  it("explains evidence-backed matches and keeps invitation language non-selective", async () => {
    await act(async () => root.render(<OwnerMatchingPanel requestId="request-1" />));

    expect(container.textContent).toContain("Sara Ahmed");
    expect(container.textContent).toContain("Strong Node.js and REST evidence.");
    expect(container.textContent).toContain("مصادر الأدلة: 2");
    expect(container.textContent).toContain("دعوة للتقديم");
    expect(container.textContent).not.toContain("تم اختيار");

    const invite = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("دعوة للتقديم"),
    );
    if (!invite) throw new Error("Expected invite button");
    await act(async () => invite.click());

    expect(mocks.inviteMutation.mock.results[0]?.value.mutateAsync).toHaveBeenCalledWith(
      "contributor-1",
    );
    expect(container.textContent).toContain("تم إرسال الدعوة");
  });

  it("renders a privacy-safe locked preview for Bronze owners", async () => {
    const planRequired = new AxiosError("plan required");
    planRequired.response = {
      data: { code: "CONTRIBUTOR_MATCHING_PLAN_REQUIRED" },
      status: 403,
      statusText: "Forbidden",
      headers: {},
      config: {} as never,
    };
    mocks.ownerQuery.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: planRequired,
      refetch: vi.fn(),
    });

    await act(async () => root.render(<OwnerMatchingPanel requestId="request-1" />));

    expect(container.textContent).toContain("المطابقة بالذكاء الاصطناعي متاحة");
    expect(container.textContent).not.toContain("Sara Ahmed");
  });
});
