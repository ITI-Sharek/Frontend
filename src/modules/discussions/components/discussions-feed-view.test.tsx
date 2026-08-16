// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DiscussionsFeedView } from "./discussions-feed-view";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  posts: vi.fn(),
  create: { isPending: false, mutate: vi.fn() },
}));

vi.mock("../api/queries/use-discussion-posts-query", () => ({
  useDiscussionPostsQuery: mocks.posts,
}));

vi.mock("../api/mutations/use-create-discussion-post-mutation", () => ({
  useCreateDiscussionPostMutation: () => mocks.create,
}));

describe("DiscussionsFeedView composition", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    mocks.posts.mockReturnValue({ data: [] });
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("opens a focused dialog and restores focus when Escape closes it", async () => {
    await act(async () => {
      root.render(
        <DiscussionsFeedView
          currentAuthor={{
            id: "contributor-1",
            displayName: "سارة",
            role: "contributor",
            avatarUrl: null,
          }}
        />,
      );
    });

    const trigger = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.includes("منشور"),
    );
    await act(async () => trigger?.click());

    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.activeElement?.id).toBe("discussion-title");

    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });

    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
