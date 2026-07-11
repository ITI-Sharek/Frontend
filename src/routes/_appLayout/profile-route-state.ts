import { ContributorProfileError } from "@/modules/contributors";

export type ProfileRouteState = "loading" | "ready" | "not-found" | "error";

export function getProfileRouteState({
  isPending,
  hasData,
  error,
}: {
  isPending: boolean;
  hasData: boolean;
  error: unknown;
}): ProfileRouteState {
  if (isPending) return "loading";
  if (
    error instanceof ContributorProfileError &&
    error.code === "not-found"
  ) {
    return "not-found";
  }
  if (error) return "error";
  if (hasData) return "ready";
  return "error";
}
