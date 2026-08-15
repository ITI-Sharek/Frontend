import { useMutation } from "@tanstack/react-query";

import { generateOwnerContributorMatches } from "../../services/matching.service";

export function useOwnerContributorMatchingMutation() {
  return useMutation({
    mutationFn: generateOwnerContributorMatches,
  });
}
