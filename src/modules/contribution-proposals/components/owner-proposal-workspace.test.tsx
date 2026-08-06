// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OwnerProposalWorkspace } from "./owner-proposal-workspace";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  proposals: vi.fn(),
  intake: vi.fn(),
  setIntake: { isPending: false, mutate: vi.fn(), error: null as Error | null },
}));

vi.mock("../api/queries/use-contribution-proposal-queries", () => ({
  useProjectContributionProposalsQuery: mocks.proposals,
  useContributionProposalIntakeQuery: mocks.intake,
}));

vi.mock("../api/mutations/use-contribution-proposal-mutations", () => ({
  useSetContributionProposalIntakeMutation: () => mocks.setIntake,
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const PROJECT_ID = "project-1";

function proposalsResult() {
  return {
    data: { pages: [{ proposals: [], pageInfo: { nextCursor: null, hasNextPage: false } }] },
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  };
}

describe("Owner proposal workspace intake control", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    vi.clearAllMocks();
    mocks.setIntake.error = null;
    mocks.setIntake.isPending = false;
    mocks.proposals.mockReturnValue(proposalsResult());
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  async function render() {
    await act(async () => {
      root.render(<OwnerProposalWorkspace projectId={PROJECT_ID} />);
    });
    return container.querySelector<HTMLButtonElement>("button[aria-pressed]");
  }

  it("reflects the stored intake state rather than guessing", async () => {
    mocks.intake.mockReturnValue({
      data: { projectId: PROJECT_ID, enabled: false },
      isPending: false,
      error: null,
    });

    const toggle = await render();

    expect(toggle?.getAttribute("aria-pressed")).toBe("false");
    expect(toggle?.textContent).toContain("الاستقبال متوقف");
  });

  it("treats a project with no stored row as accepting proposals", async () => {
    // The backend returns enabled: true for a project that has never been
    // toggled; the button must not render "closed" in that case.
    mocks.intake.mockReturnValue({
      data: { projectId: PROJECT_ID, enabled: true },
      isPending: false,
      error: null,
    });

    const toggle = await render();

    expect(toggle?.getAttribute("aria-pressed")).toBe("true");
  });

  it("sends the opposite of the current state when clicked", async () => {
    mocks.intake.mockReturnValue({
      data: { projectId: PROJECT_ID, enabled: true },
      isPending: false,
      error: null,
    });

    const toggle = await render();
    await act(async () => toggle?.click());

    expect(mocks.setIntake.mutate).toHaveBeenCalledWith({
      projectId: PROJECT_ID,
      enabled: false,
    });
  });

  it("cannot be clicked while the state is unknown or in flight", async () => {
    mocks.intake.mockReturnValue({ data: undefined, isPending: true, error: null });

    expect((await render())?.disabled).toBe(true);

    mocks.intake.mockReturnValue({
      data: { projectId: PROJECT_ID, enabled: true },
      isPending: false,
      error: null,
    });
    mocks.setIntake.isPending = true;

    expect((await render())?.disabled).toBe(true);
  });

  it("surfaces a failed toggle instead of silently reverting", async () => {
    mocks.intake.mockReturnValue({
      data: { projectId: PROJECT_ID, enabled: true },
      isPending: false,
      error: null,
    });
    mocks.setIntake.error = new Error("network failed");

    await render();

    expect(container.querySelector('[role="alert"]')?.textContent ?? "").not.toBe("");
  });
});
