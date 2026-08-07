import { useCurrentUserQuery } from "../api/queries/use-current-user-query";
import type { AuthUserDto } from "../types/auth.types";

export interface ResolvedCurrentUser {
  currentUser: AuthUserDto | undefined;
  /** True while we genuinely do not know yet. Never treat this as "denied". */
  isResolving: boolean;
}

/**
 * Resolves the signed-in user for a page that renders differently per role.
 *
 * Route context alone is not enough. `requireRouteAccess` returns an empty
 * context during SSR — deliberately, because the access token lives in memory
 * only and the server genuinely cannot know who is asking. So on a direct load
 * or a refresh, `Route.useRouteContext().currentUser` is undefined for the
 * first render even though the visitor is perfectly authorized.
 *
 * A page that reads the context directly and branches on `!currentUser` will
 * therefore show a denial to its own owner on refresh, while working fine when
 * reached by an in-app click. That is exactly the bug this hook exists to stop:
 * "not loaded yet" and "not allowed" are different answers and must not share
 * a branch.
 *
 * `_appLayout` already resolves the user this way; this makes the same
 * fallback available to the pages nested inside it.
 */
export function useResolvedCurrentUser(
  contextUser: AuthUserDto | undefined,
): ResolvedCurrentUser {
  const query = useCurrentUserQuery(contextUser);
  const currentUser = contextUser ?? query.data;

  return {
    currentUser,
    // `isLoading` covers the first fetch. The `enabled` guard means a
    // signed-out visitor never fetches at all, so pair it with the query
    // being disabled-and-empty rather than reporting an endless resolve.
    isResolving: currentUser === undefined && (query.isLoading || query.isFetching),
  };
}
