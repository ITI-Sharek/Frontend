import { storageService } from "@/services/storage.service";

export function shouldRedirectUnauthenticatedProfile({
  isBrowser = typeof window !== "undefined",
  getAccessToken = storageService.getAccessToken,
}: {
  isBrowser?: boolean;
  getAccessToken?: () => string | null;
} = {}): boolean {
  if (!isBrowser) return false;

  return getAccessToken() === null;
}
