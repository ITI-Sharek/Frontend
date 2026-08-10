// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { updateCurrentUserPreferences } from "../../services/auth.service";
import { authKeys } from "../query-keys";
import { useUpdateCurrentUserPreferencesMutation } from "./use-current-user-preferences-mutation";

vi.mock("../../services/auth.service", () => ({
  updateCurrentUserPreferences: vi.fn(),
}));

const mockedUpdate = vi.mocked(updateCurrentUserPreferences);

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const user = {
  id: "user-1",
  preferredLanguage: "en" as const,
};

describe("current-user preferences mutation", () => {
  let container: HTMLDivElement;
  let root: Root;
  let queryClient: QueryClient;
  let mutateAsync: ReturnType<
    typeof useUpdateCurrentUserPreferencesMutation
  >["mutateAsync"];

  beforeEach(async () => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <MutationHarness onReady={(value) => (mutateAsync = value)} />
        </QueryClientProvider>,
      );
    });
    mockedUpdate.mockResolvedValue(user as never);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    queryClient.clear();
    vi.clearAllMocks();
  });

  it("updates the public user cache and invalidates localized server data", async () => {
    const localizedQueryKey = ["notifications", "list"] as const;
    queryClient.setQueryData(localizedQueryKey, { items: [] });

    await act(async () => {
      await mutateAsync({ preferredLanguage: "en" });
    });

    expect(queryClient.getQueryData(authKeys.currentUser())).toEqual(user);
    expect(queryClient.getQueryState(localizedQueryKey)?.isInvalidated).toBe(
      true,
    );
    expect(
      queryClient.getQueryState(authKeys.currentUser())?.isInvalidated,
    ).toBe(false);
  });
});

function MutationHarness({
  onReady,
}: {
  onReady: (
    mutateAsync: ReturnType<
      typeof useUpdateCurrentUserPreferencesMutation
    >["mutateAsync"],
  ) => void;
}) {
  const mutation = useUpdateCurrentUserPreferencesMutation();
  onReady(mutation.mutateAsync);
  return null;
}
