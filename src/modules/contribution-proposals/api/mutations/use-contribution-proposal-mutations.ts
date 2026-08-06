import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  acceptContributionProposal,
  declineContributionProposal,
  reportContributionProposalMisuse,
  requestContributionProposalRevision,
  setContributionProposalIntake,
  submitContributionProposal,
  submitContributionProposalVersion,
  withdrawContributionProposal,
} from "../../services/contribution-proposals.service";
import type { ContributionProposalDto } from "../../types/contribution-proposal.types";
import { contributionProposalKeys } from "../query-keys";

function useInvalidateProposal() {
  const queryClient = useQueryClient();
  return (proposal: ContributionProposalDto) => {
    queryClient.setQueryData(
      contributionProposalKeys.detail(proposal.id),
      proposal,
    );
    void queryClient.invalidateQueries({
      queryKey: contributionProposalKeys.mine(),
    });
    void queryClient.invalidateQueries({
      queryKey: contributionProposalKeys.project(proposal.projectId),
    });
  };
}

export function useSubmitContributionProposalMutation() {
  const onSuccess = useInvalidateProposal();
  return useMutation({ mutationFn: submitContributionProposal, onSuccess });
}

export function useSubmitContributionProposalVersionMutation() {
  const onSuccess = useInvalidateProposal();
  return useMutation({
    mutationFn: submitContributionProposalVersion,
    onSuccess,
  });
}

export function useRequestContributionProposalRevisionMutation() {
  const onSuccess = useInvalidateProposal();
  return useMutation({
    mutationFn: requestContributionProposalRevision,
    onSuccess,
  });
}

export function useAcceptContributionProposalMutation() {
  const onSuccess = useInvalidateProposal();
  return useMutation({ mutationFn: acceptContributionProposal, onSuccess });
}

export function useDeclineContributionProposalMutation() {
  const onSuccess = useInvalidateProposal();
  return useMutation({ mutationFn: declineContributionProposal, onSuccess });
}

export function useWithdrawContributionProposalMutation() {
  const onSuccess = useInvalidateProposal();
  return useMutation({ mutationFn: withdrawContributionProposal, onSuccess });
}

export function useReportContributionProposalMisuseMutation() {
  return useMutation({ mutationFn: reportContributionProposalMisuse });
}

export function useSetContributionProposalIntakeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, enabled }: { projectId: string; enabled: boolean }) =>
      setContributionProposalIntake(projectId, enabled),
    // The PUT returns the new state, so seed it directly. Invalidating the
    // proposals list instead -- as this did -- refetches every loaded page of
    // an infinite query on a toggle click, for data the toggle never changes.
    onSuccess: (intake) => {
      queryClient.setQueryData(
        contributionProposalKeys.intake(intake.projectId),
        intake,
      );
    },
  });
}
