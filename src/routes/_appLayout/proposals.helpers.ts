import type { QueryClient } from "@tanstack/react-query";

import type { ContributionProposalDto } from "@/modules/contribution-proposals";
import { contributionRequestKeys } from "@/modules/contribution-requests";

/**
 * Accepting a Contribution Proposal transactionally creates an owner-owned
 * draft Contribution Request, which belongs to the contribution-requests
 * module. The proposals module must never import another module directly
 * (docs/ARCHITECTURE.md section 3), so this cross-module cache reconciliation is
 * composed here at the route layer.
 *
 * Only the owner's project list needs invalidating: the new request is a draft,
 * so the public feed is unaffected and its detail key has nothing cached yet.
 */
export function invalidateProposalAcceptanceSideEffects(
  queryClient: QueryClient,
  proposal: ContributionProposalDto,
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: contributionRequestKeys.ownerProjectList(proposal.projectId),
  });
}
