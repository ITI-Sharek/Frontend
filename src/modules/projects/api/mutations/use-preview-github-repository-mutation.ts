import { useMutation } from "@tanstack/react-query";

import { previewGitHubRepository } from "../../services/project-drafts.service";

/** No `Idempotency-Key`: repeating a preview has no project-side effect. */
export function usePreviewGitHubRepositoryMutation() {
  return useMutation({ mutationFn: previewGitHubRepository });
}
