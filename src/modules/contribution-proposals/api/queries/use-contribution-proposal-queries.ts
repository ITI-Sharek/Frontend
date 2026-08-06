import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getContributionProposal,
  listMyContributionProposals,
  listProjectContributionProposals,
} from "../../services/contribution-proposals.service";
import { contributionProposalKeys } from "../query-keys";

// The backend paginates both proposal lists by keyset cursor (default 20 per
// page) and returns `pageInfo.nextCursor`. Page params live inside the infinite
// query's data rather than in the query key, so the existing mutation
// invalidations keep working untouched — and a refetch re-reads every loaded
// page instead of stranding an accumulator the query client cannot reset.
export function useMyContributionProposalsQuery() {
  return useInfiniteQuery({
    queryKey: contributionProposalKeys.mine(),
    queryFn: ({ pageParam }) => listMyContributionProposals({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pageInfo.nextCursor ?? undefined,
  });
}

export function useProjectContributionProposalsQuery(projectId: string) {
  return useInfiniteQuery({
    queryKey: contributionProposalKeys.project(projectId),
    queryFn: ({ pageParam }) =>
      listProjectContributionProposals(projectId, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pageInfo.nextCursor ?? undefined,
    enabled: projectId.length > 0,
  });
}

export function useContributionProposalQuery(proposalId: string) {
  return useQuery({
    queryKey: contributionProposalKeys.detail(proposalId),
    queryFn: () => getContributionProposal(proposalId),
    enabled: proposalId.length > 0,
  });
}
