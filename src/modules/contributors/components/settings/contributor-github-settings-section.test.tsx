// @vitest-environment happy-dom

import type { ReactNode } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ContributorProfileDto } from "../../types/contributor-profile.types";
import { ContributorGithubSettingsSection } from "./contributor-github-settings-section";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const mockProfile: ContributorProfileDto = {
  username: "karimmohamed",
  displayName: "Karim Mohamed",
  avatarUrl: "https://example.com/avatar.jpg",
  roleLabel: "Senior Contributor",
  bio: "Full stack developer",
  skills: [],
  availability: "Available for open source projects",
  githubStatus: {
    connected: true,
    username: "karimmohamed",
  },
  githubInstallations: [],
  reputationSummary: {
    rating: 4.9,
    reviewsCount: 12,
    completedContributions: 24,
    totalAssignedTasks: 25,
    successRate: 96,
    topVerifiedSkills: [],
  },
  badges: [],
  contributionHistory: [],
  completionPrompts: [],
  viewerRelationship: "owner",
  experienceLevel: null,
  fields: [],
  declaredSkills: [],
};

describe("ContributorGithubSettingsSection", () => {
  let container: HTMLDivElement;
  let root: Root;
  let queryClient: QueryClient;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    queryClient.clear();
  });

  function renderComponent(props: Partial<Parameters<typeof ContributorGithubSettingsSection>[0]> = {}) {
    act(() => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <ContributorGithubSettingsSection
            profile={mockProfile}
            onConnectGitHub={vi.fn().mockResolvedValue(undefined)}
            onDisconnectGitHub={vi.fn().mockResolvedValue(undefined)}
            {...props}
          />
        </QueryClientProvider>,
      );
    });
  }

  it("renders connected social GitHub account with username and actions", () => {
    renderComponent();
    expect(container.textContent).toContain("@karimmohamed");
  });

  it("renders disconnected social GitHub account when not connected", () => {
    renderComponent({
      profile: {
        ...mockProfile,
        githubStatus: { connected: false, username: null },
      },
    });
    expect(container.textContent).not.toContain("@karimmohamed");
  });

  it("renders AI skills analysis section with Connect button when no installations", () => {
    renderComponent();
    const buttons = container.querySelectorAll("button");
    const buttonTexts = Array.from(buttons).map((b) => b.textContent);
    expect(buttonTexts.some((text) => text?.includes("GitHub") || text?.includes("ربط"))).toBe(true);
  });
});
