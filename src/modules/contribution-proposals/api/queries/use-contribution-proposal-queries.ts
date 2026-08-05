import { useQuery } from "@tanstack/react-query";

import {
  getContributionProposal,
  listMyContributionProposals,
  listProjectContributionProposals,
} from "../../services/contribution-proposals.service";
import { contributionProposalKeys } from "../query-keys";

export function useMyContributionProposalsQuery() {
  return useQuery({
    queryKey: contributionProposalKeys.mine(),
    queryFn: listMyContributionProposals,
  });
}

export function useProjectContributionProposalsQuery(projectId: string) {
  return useQuery({
    queryKey: contributionProposalKeys.project(projectId),
    queryFn: () => listProjectContributionProposals(projectId),
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
