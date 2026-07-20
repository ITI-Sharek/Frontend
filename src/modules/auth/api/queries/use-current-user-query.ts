import { useQuery } from "@tanstack/react-query";

import { storageService } from "@/services/storage.service";

import { getCurrentUser } from "../../services/auth.service";
import { authKeys } from "../query-keys";
import type { AuthUserDto } from "../../types/auth.types";

/**
 * Enabled only when an access token exists client-side, so it stays inert
 * during SSR and for signed-out visitors (avoids a spurious 401 round trip).
 */
export function useCurrentUserQuery(initialData?: AuthUserDto) {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUser,
    enabled: typeof window !== "undefined" && storageService.getAccessToken() !== null,
    initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
    staleTime: 30_000,
    retry: false,
  });
}
