import { describe, expect, it, vi } from "vitest";

import type { AuthUserDto } from "../types/auth.types";

const useCurrentUserQuery = vi.fn();
vi.mock("../api/queries/use-current-user-query", () => ({
  useCurrentUserQuery: (initial?: AuthUserDto) => useCurrentUserQuery(initial),
}));

const { useResolvedCurrentUser } = await import("./use-resolved-current-user");

const owner: AuthUserDto = {
  id: "77777777-7777-4777-8777-777777777777",
  email: "owner@sharek.local",
  role: "owner",
  status: "active",
} as AuthUserDto;

function queryState(overrides: Record<string, unknown> = {}) {
  useCurrentUserQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
    isFetching: false,
    ...overrides,
  });
}

describe("useResolvedCurrentUser", () => {
  it("uses the route context when the router already resolved the user", () => {
    queryState();

    expect(useResolvedCurrentUser(owner)).toEqual({
      currentUser: owner,
      isResolving: false,
    });
  });

  it("falls back to the query when the context is empty", () => {
    // This is the direct-load and refresh case: SSR leaves the context empty
    // because the server has no session.
    queryState({ data: owner });

    expect(useResolvedCurrentUser(undefined)).toEqual({
      currentUser: owner,
      isResolving: false,
    });
  });

  it("reports resolving rather than absent while the query is in flight", () => {
    // The whole point: a page must not read this as "not allowed". Doing so is
    // what showed a proposal's own author a denial on refresh.
    queryState({ isLoading: true });

    expect(useResolvedCurrentUser(undefined)).toEqual({
      currentUser: undefined,
      isResolving: true,
    });
  });

  it("reports a settled absence for a signed-out visitor", () => {
    // The query is disabled without a token, so it never loads and never
    // fetches. That is a real "no user", not a pending one — otherwise the
    // page would spin forever instead of saying what is wrong.
    queryState();

    expect(useResolvedCurrentUser(undefined)).toEqual({
      currentUser: undefined,
      isResolving: false,
    });
  });

  it("stops resolving once a refetch produces the user", () => {
    queryState({ data: owner, isFetching: true });

    expect(useResolvedCurrentUser(undefined).isResolving).toBe(false);
  });
});
