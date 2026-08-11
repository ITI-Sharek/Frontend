// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  adoptContributionRequestMaterialSuggestion,
  adoptProjectMaterialSuggestion,
} from "../../services/materials.service";
import {
  useAdoptContributionRequestMaterialSuggestionMutation,
  useAdoptProjectMaterialSuggestionMutation,
} from "./use-material-analysis-mutations";

const mocks = vi.hoisted(() => ({
  adoptContributionRequestMaterialSuggestion: vi.fn(),
  adoptProjectMaterialSuggestion: vi.fn(),
}));

vi.mock("../../services/materials.service", () => ({
  adoptContributionRequestMaterialSuggestion:
    mocks.adoptContributionRequestMaterialSuggestion,
  adoptProjectMaterialSuggestion: mocks.adoptProjectMaterialSuggestion,
  createMaterialAnalysisSet: vi.fn(),
  rejectMaterialDraftSuggestion: vi.fn(),
  startMaterialAnalysisRun: vi.fn(),
}));

const mockedAdoptProject = vi.mocked(adoptProjectMaterialSuggestion);
const mockedAdoptRequest = vi.mocked(adoptContributionRequestMaterialSuggestion);

type MutationApi = {
  project: ReturnType<typeof useAdoptProjectMaterialSuggestionMutation>;
  request: ReturnType<
    typeof useAdoptContributionRequestMaterialSuggestionMutation
  >;
};

function MutationHarness({ onReady }: { onReady: (api: MutationApi) => void }) {
  const project = useAdoptProjectMaterialSuggestionMutation("project-1");
  const request =
    useAdoptContributionRequestMaterialSuggestionMutation("project-1");
  onReady({ project, request });
  return null;
}

describe("material analysis adoption cache reconciliation", () => {
  let container: HTMLDivElement;
  let root: Root;
  let queryClient: QueryClient;
  let api: MutationApi;

  beforeEach(async () => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockedAdoptProject.mockReset();
    mockedAdoptRequest.mockReset();

    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <MutationHarness onReady={(value) => (api = value)} />
        </QueryClientProvider>,
      );
    });
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    queryClient.clear();
    vi.clearAllMocks();
  });

  it("updates the current project and refreshes only the owner project list", async () => {
    const project = { id: "project-1", revision: 5, status: "draft" };
    mockedAdoptProject.mockResolvedValueOnce({ project });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    await act(async () => {
      await api.project.mutateAsync({
        suggestionId: "suggestion-1",
        expectedRevision: 4,
        idempotencyKey: "idempotency-1",
      });
    });

    expect(
      queryClient.getQueryData(["projects", "mine", "detail", "project-1"]),
    ).toEqual(project);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["projects", "mine", "list"],
    });
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: ["projects"],
    });
  });

  it("updates both request detail cache shapes and only refreshes the owner list", async () => {
    const contributionRequest = {
      id: "request-1",
      projectId: "project-1",
      status: "draft",
    };
    mockedAdoptRequest.mockResolvedValueOnce({ contributionRequest });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    await act(async () => {
      await api.request.mutateAsync({
        suggestionId: "suggestion-2",
        applicationsCloseTime: "2099-08-09T15:00:00.000Z",
        idempotencyKey: "idempotency-2",
      });
    });

    expect(
      queryClient.getQueryData(["contribution-requests", "detail", "request-1"]),
    ).toEqual(contributionRequest);
    expect(
      queryClient.getQueryData([
        "contribution-requests",
        "details",
        "request-1",
      ]),
    ).toEqual(contributionRequest);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["contribution-requests", "owner-project-list", "project-1"],
    });
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: ["contribution-requests"],
    });
  });
});
