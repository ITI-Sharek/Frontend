import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  acceptContributionProposal,
  declineContributionProposal,
  getContributionProposal,
  listMyContributionProposals,
  listProjectContributionProposals,
  reportContributionProposalMisuse,
  requestContributionProposalRevision,
  setContributionProposalIntake,
  submitContributionProposal,
  submitContributionProposalVersion,
  withdrawContributionProposal,
} from "./contribution-proposals.service";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

const mockedAxios = vi.mocked(axiosInstance);

describe("Contribution Proposal service contract", () => {
  beforeEach(() => vi.clearAllMocks());

  it("submits the four proposal fields, disclosure, and retry key", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { id: "proposal-1" } });
    const payload = {
      projectId: "project 1",
      title: "Improve onboarding",
      problemOrOpportunity: "Contributors need clearer first steps.",
      proposedOutcome: "Create a guided contribution checklist.",
      projectBenefit: "Reduce setup time for new contributors.",
      acknowledgesAttributionAndAssignmentDisclosure: true as const,
      idempotencyKey: "submit-key",
    };

    await submitContributionProposal(payload);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/contribution-proposals",
      payload,
    );
  });

  it("loads only the current contributor list and an encoded owner project list", async () => {
    mockedAxios.get.mockResolvedValue({ data: { proposals: [], pageInfo: {} } });

    await listMyContributionProposals();
    await listProjectContributionProposals("project 1");
    await getContributionProposal("proposal 1");

    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      "/contribution-proposals/mine",
      { params: {} },
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      "/contribution-proposals/for-project/project%201",
      { params: {} },
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      3,
      "/contribution-proposals/proposal%201",
    );
  });

  it("forwards the keyset cursor to both paginated list endpoints", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { proposals: [], pageInfo: { nextCursor: null, hasNextPage: false } },
    });

    await listMyContributionProposals({ cursor: "cursor-token" });
    await listProjectContributionProposals("project 1", { cursor: "cursor-token" });

    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      "/contribution-proposals/mine",
      { params: { cursor: "cursor-token" } },
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      "/contribution-proposals/for-project/project%201",
      { params: { cursor: "cursor-token" } },
    );
  });

  it("uses immutable-version and owner decision endpoints without editing versions", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "proposal-1" } });
    const fields = {
      title: "Improve onboarding",
      problemOrOpportunity: "Contributors need clearer first steps.",
      proposedOutcome: "Create a guided contribution checklist.",
      projectBenefit: "Reduce setup time for new contributors.",
    };

    await submitContributionProposalVersion({
      proposalId: "proposal-1",
      idempotencyKey: "version-key",
      ...fields,
    });
    await requestContributionProposalRevision({
      proposalId: "proposal-1",
      idempotencyKey: "revision-key",
      reason: "Please clarify the outcome.",
    });
    await acceptContributionProposal({
      proposalId: "proposal-1",
      idempotencyKey: "accept-key",
    });
    await declineContributionProposal({
      proposalId: "proposal-1",
      idempotencyKey: "decline-key",
      reason: "This does not fit the roadmap.",
    });

    expect(mockedAxios.post.mock.calls.map(([url]) => url)).toEqual([
      "/contribution-proposals/proposal-1/versions",
      "/contribution-proposals/proposal-1/revision-requests",
      "/contribution-proposals/proposal-1/accept",
      "/contribution-proposals/proposal-1/decline",
    ]);
    expect(mockedAxios.post).not.toHaveBeenCalledWith(
      expect.stringContaining("versions"),
      expect.objectContaining({ version: expect.anything() }),
    );
  });

  it("keeps withdrawal header-based, reporting separate, and intake owner-scoped", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    mockedAxios.put.mockResolvedValue({ data: { projectId: "project-1", enabled: false } });

    await withdrawContributionProposal({
      proposalId: "proposal-1",
      idempotencyKey: "withdraw-key",
    });
    await reportContributionProposalMisuse({
      proposalId: "proposal-1",
      idempotencyKey: "report-key",
      reason: "This version appears inconsistent with the recorded history.",
    });
    await setContributionProposalIntake("project 1", false);

    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      1,
      "/contribution-proposals/proposal-1/withdraw",
      undefined,
      { headers: { "Idempotency-Key": "withdraw-key" } },
    );
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      "/contribution-proposals/proposal-1/misuse-reports",
      { idempotencyKey: "report-key", reason: expect.any(String) },
    );
    expect(mockedAxios.put).toHaveBeenCalledWith(
      "/contribution-proposals/for-project/project%201/intake",
      { enabled: false },
    );
  });
});
