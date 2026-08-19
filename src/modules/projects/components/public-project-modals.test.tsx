// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApplyProjectDialog } from "./public-project-modals";
import type { TaskItemData } from "./public-project-modals";
import type { PublicProjectDetailDto } from "../types/public-project.types";
import * as authModule from "@/modules/auth";
import * as contribModule from "@/modules/contribution-requests";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockProject: PublicProjectDetailDto = {
  id: "project-1",
  slug: "sharek-example",
  title: "ShareK Example",
  description: "Test description",
  tags: ["collaboration"],
  technologies: ["TypeScript"],
  category: "web",
  difficulty: "intermediate",
  heroImageUrl: null,
  publishedAt: "2026-07-21T10:10:00.000Z",
  owner: null,
  source: {
    provider: "github",
    attributionStatus: "public",
    fullName: "sharek/example",
    repositoryUrl: "https://github.com/sharek/example",
    fetchedAt: "2026-07-21T10:00:02.000Z",
    statistics: {
      stars: 0,
      forks: 0,
      contributors: null,
      latestCommitAt: null,
      sourceUpdatedAt: null,
      defaultBranch: null,
      recentCommits: [],
      rootEntries: [],
      rootEntriesUnavailableReason: null,
      treeEntries: [],
      treeTruncated: false,
      treeUnavailableReason: null,
    },
  },
};

const mockTasks: TaskItemData[] = [
  {
    id: "task-1",
    title: "Implement Feature X",
    tags: ["React"],
    difficulty: "intermediate",
    dueDate: "2026-09-01",
    reward: "100 USD",
    status: "open",
  },
];

describe("ApplyProjectDialog", () => {
  let container: HTMLDivElement;
  let root: Root;
  let queryClient: QueryClient;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  it("shows sign in prompt when user is not authenticated", async () => {
    vi.spyOn(authModule, "useCurrentUserQuery").mockReturnValue({
      data: undefined,
      isLoading: false,
      isPending: false,
      isSuccess: false,
      isError: false,
    } as ReturnType<typeof authModule.useCurrentUserQuery>);

    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <ApplyProjectDialog
            open={true}
            onOpenChange={vi.fn()}
            project={mockProject}
            tasks={mockTasks}
          />
        </QueryClientProvider>,
      );
    });

    expect(document.body.textContent).toContain("تسجيل الدخول مطلوب");
    expect(document.body.querySelector('a[href="/login"]')).not.toBeNull();
  });

  it("shows contributor account required notice when user is an owner", async () => {
    vi.spyOn(authModule, "useCurrentUserQuery").mockReturnValue({
      data: {
        id: "owner-1",
        email: "owner@example.com",
        first_name: "Owner",
        last_name: "User",
        role: "owner",
        status: "active",
      },
      isLoading: false,
      isPending: false,
      isSuccess: true,
      isError: false,
    } as unknown as ReturnType<typeof authModule.useCurrentUserQuery>);

    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <ApplyProjectDialog
            open={true}
            onOpenChange={vi.fn()}
            project={mockProject}
            tasks={mockTasks}
          />
        </QueryClientProvider>,
      );
    });

    expect(document.body.textContent).toContain("حساب مساهم مطلوب");
  });

  it("renders the application form for active contributor and validates short approach", async () => {
    vi.spyOn(authModule, "useCurrentUserQuery").mockReturnValue({
      data: {
        id: "contrib-1",
        email: "contrib@example.com",
        first_name: "Contributor",
        last_name: "User",
        role: "contributor",
        status: "active",
      },
      isLoading: false,
      isPending: false,
      isSuccess: true,
      isError: false,
    } as unknown as ReturnType<typeof authModule.useCurrentUserQuery>);

    const mockMutate = vi.fn();
    vi.spyOn(contribModule, "useSubmitApplicationMutation").mockReturnValue({
      mutate: mockMutate,
      reset: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    } as unknown as ReturnType<typeof contribModule.useSubmitApplicationMutation>);

    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <ApplyProjectDialog
            open={true}
            onOpenChange={vi.fn()}
            project={mockProject}
            tasks={mockTasks}
          />
        </QueryClientProvider>,
      );
    });

    const submitBtn = document.body.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(submitBtn).not.toBeNull();

    // Submit with empty / short note
    const form = document.body.querySelector<HTMLFormElement>("form");
    await act(async () => {
      form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(mockMutate).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("يجب كتابة 10 أحرف على الأقل");
  });
});
