import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  adjustSkillReviewProficiency,
  approveSkillReview,
  rejectSkillReview,
} from "../../services/admin-skill-reviews.service";
import type {
  AdjustSkillReviewProficiencyPayload,
  ApproveSkillReviewPayload,
  RejectSkillReviewPayload,
} from "../../types/admin-skill-review.types";
import { skillProfileKeys } from "../query-keys";

function useInvalidateSkillReviewQueries() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: skillProfileKeys.adminReviews(),
    });
}

export function useApproveSkillReviewMutation() {
  const invalidate = useInvalidateSkillReviewQueries();
  return useMutation({
    mutationFn: ({
      skillProfileId,
      payload,
    }: {
      skillProfileId: string;
      payload?: ApproveSkillReviewPayload;
    }) => approveSkillReview(skillProfileId, payload),
    onSuccess: invalidate,
  });
}

export function useRejectSkillReviewMutation() {
  const invalidate = useInvalidateSkillReviewQueries();
  return useMutation({
    mutationFn: ({
      skillProfileId,
      payload,
    }: {
      skillProfileId: string;
      payload: RejectSkillReviewPayload;
    }) => rejectSkillReview(skillProfileId, payload),
    onSuccess: invalidate,
  });
}

export function useAdjustSkillReviewProficiencyMutation() {
  const invalidate = useInvalidateSkillReviewQueries();
  return useMutation({
    mutationFn: ({
      skillProfileId,
      payload,
    }: {
      skillProfileId: string;
      payload: AdjustSkillReviewProficiencyPayload;
    }) => adjustSkillReviewProficiency(skillProfileId, payload),
    onSuccess: invalidate,
  });
}
