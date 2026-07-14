import { useQuery } from "@tanstack/react-query";

import { storageService } from "@/services/storage.service";

import { getCurrentUser } from "../../services/auth.service";
import { authKeys } from "../query-keys";

/**
 * Enabled only when an access token exists client-side, so it stays inert
 * during SSR and for signed-out visitors (avoids a spurious 401 round trip).
 */
export function useCurrentUserQuery() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUser,
    enabled: typeof window !== "undefined" && storageService.getAccessToken() !== null,
    retry: false,
  });
}
