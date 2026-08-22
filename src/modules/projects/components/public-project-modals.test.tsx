// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApplyProjectDialog
} from "./public-project-modals";
import type {ApplicationSubmissionController, TaskItemData} from "./public-project-modals";
import type { PublicProjectDetailDto } from "../types/public-project.types";

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

function createSubmissionControllerMock() {
  const mockSubmit = vi.fn();
  const controller: ApplicationSubmissionController = {
    submit: mockSubmit,
    reset: vi.fn(),
    isPending: false,
    hasError: false,
    errorCode: null,
    submissionErrorMessage: null,
    dailyLimitResetCopy: null,
  };
  return { controller, mockSubmit };
}

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
    const { controller } = createSubmissionControllerMock();

    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <ApplyProjectDialog
            open={true}
            onOpenChange={vi.fn()}
            project={mockProject}
            tasks={mockTasks}
            applicationSubmission={controller}
            isAuthenticated={false}
            isContributor={false}
            isAuthLoading={false}
          />
        </QueryClientProvider>,
      );
    });

    expect(document.body.textContent).toContain("تسجيل الدخول مطلوب");
    expect(document.body.querySelector('a[href="/login"]')).not.toBeNull();
  });

  it("shows contributor account required notice when user is an owner", async () => {
    const { controller } = createSubmissionControllerMock();

    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <ApplyProjectDialog
            open={true}
            onOpenChange={vi.fn()}
            project={mockProject}
            tasks={mockTasks}
            applicationSubmission={controller}
            isAuthenticated={true}
            isContributor={false}
            isAuthLoading={false}
          />
        </QueryClientProvider>,
      );
    });

    expect(document.body.textContent).toContain("حساب مساهم مطلوب");
  });

  it("renders the application form for active contributor and validates short approach", async () => {
    const { controller, mockSubmit } = createSubmissionControllerMock();

    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <ApplyProjectDialog
            open={true}
            onOpenChange={vi.fn()}
            project={mockProject}
            tasks={mockTasks}
            applicationSubmission={controller}
            isAuthenticated={true}
            isContributor={true}
            isAuthLoading={false}
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

    expect(mockSubmit).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("يجب كتابة 10 أحرف على الأقل");
  });
});
