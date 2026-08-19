import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewAdminIdentityVerification } from "../../services/admin-identity.service";
import { adminIdentityKeys } from "../queries/use-admin-identity-verifications-query";
import type { ReviewIdentityVerificationPayload } from "../../types/admin-identity.types";

export function useAdminIdentityReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: ReviewIdentityVerificationPayload;
    }) => reviewAdminIdentityVerification(userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminIdentityKeys.all });
    },
  });
}
