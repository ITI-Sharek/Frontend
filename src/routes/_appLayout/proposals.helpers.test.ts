import { describe, expect, it, vi } from "vitest";

import type { ContributionProposalDto } from "@/modules/contribution-proposals";

import { invalidateProposalAcceptanceSideEffects } from "./proposals.helpers";

describe("invalidateProposalAcceptanceSideEffects", () => {
  it("invalidates the owner project request list for the accepted proposal", async () => {
    const queryClient = { invalidateQueries: vi.fn().mockResolvedValue(undefined) };

    await invalidateProposalAcceptanceSideEffects(
      queryClient as never,
      { projectId: "project 1" } as ContributionProposalDto,
    );

    // Asserted as a literal so a rename on either side of this cross-module
    // boundary fails loudly rather than silently skipping the invalidation.
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["contribution-requests", "owner-project-list", "project 1"],
    });
  });
});
