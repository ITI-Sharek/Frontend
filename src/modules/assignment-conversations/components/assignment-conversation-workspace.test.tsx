// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AssignmentConversationWorkspace } from "./assignment-conversation-workspace";

vi.mock("../api/queries/use-assignment-conversation-queries", () => ({
  useAssignmentConversationQuery: vi.fn(),
  useAssignmentConversationsQuery: vi.fn(),
  useAssignmentMessagesQuery: vi.fn(),
  useChatAttachmentUploadConstraintsQuery: vi.fn(),
}));
vi.mock("../api/mutations/use-assignment-conversation-mutations", () => ({
  useSendAssignmentMessageMutation: vi.fn(),
  useCreateAttachmentUploadMutation: vi.fn(),
  useAttachmentDownloadUrlMutation: vi.fn(),
}));

const {
  useAssignmentConversationQuery,
  useAssignmentConversationsQuery,
  useAssignmentMessagesQuery,
  useChatAttachmentUploadConstraintsQuery,
} = await import("../api/queries/use-assignment-conversation-queries");
const {
  useSendAssignmentMessageMutation,
  useCreateAttachmentUploadMutation,
  useAttachmentDownloadUrlMutation,
} = await import("../api/mutations/use-assignment-conversation-mutations");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

describe("AssignmentConversationWorkspace", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    vi.mocked(useAssignmentConversationsQuery).mockReturnValue({
      data: { pages: [{ items: [], nextCursor: null }] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useAssignmentConversationQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as never);
    vi.mocked(useAssignmentMessagesQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as never);
    vi.mocked(useSendAssignmentMessageMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
    } as never);
    vi.mocked(useChatAttachmentUploadConstraintsQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as never);
    vi.mocked(useCreateAttachmentUploadMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
    vi.mocked(useAttachmentDownloadUrlMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.clearAllMocks();
  });

  it("renders the empty state when the authenticated member has no conversations", async () => {
    await act(async () => {
      root.render(
        <AssignmentConversationWorkspace
          onSelectConversation={vi.fn()}
        />,
      );
    });

    expect(container.textContent).toContain("لا توجد محادثات بعد");
  });

  it("names both participants and differentiates messages by sender", async () => {
    vi.mocked(useAssignmentConversationsQuery).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                conversationId: "conversation-1",
                assignmentId: "assignment-1",
                status: "active",
                ownerId: "owner-1",
                ownerName: "Owner Name",
                contributorId: "contributor-1",
                contributorName: "Contributor Name",
                createdAt: "2026-08-10T10:00:00.000Z",
                updatedAt: "2026-08-10T10:00:00.000Z",
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useAssignmentMessagesQuery).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                messageId: "message-2",
                conversationId: "conversation-1",
                sequence: 2,
                senderId: "owner-1",
                senderName: "Owner Name",
                body: "Please review this",
                replyToMessageId: null,
                createdAt: "2026-08-10T10:02:00.000Z",
                editedAt: null,
                retractedAt: null,
                attachments: [],
              },
              {
                messageId: "message-1",
                conversationId: "conversation-1",
                sequence: 1,
                senderId: "contributor-1",
                senderName: "Contributor Name",
                body: "I finished the task",
                replyToMessageId: null,
                createdAt: "2026-08-10T10:01:00.000Z",
                editedAt: null,
                retractedAt: null,
                attachments: [],
              },
            ],
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as never);

    await act(async () => {
      root.render(
        <AssignmentConversationWorkspace
          currentUserId="contributor-1"
          onSelectConversation={vi.fn()}
        />,
      );
    });

    expect(container.textContent).toContain("Owner Name");
    expect(container.textContent).toContain("Contributor Name");
    expect(container.querySelector('[data-sender="own"]')).not.toBeNull();
    expect(container.querySelector('[data-sender="other"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="رسالة من Owner Name"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="رسالة من Contributor Name"]')).not.toBeNull();
  });

  it("opens an authorized deep-linked conversation outside the first cursor page", async () => {
    vi.mocked(useAssignmentConversationQuery).mockReturnValue({
      data: {
        conversationId: "conversation-deep-link",
        assignmentId: "assignment-deep-link",
        status: "active",
        ownerId: "owner-1",
        ownerName: "Deep Link Owner",
        contributorId: "contributor-1",
        contributorName: "Deep Link Contributor",
        createdAt: "2026-08-10T10:00:00.000Z",
        updatedAt: "2026-08-10T10:00:00.000Z",
      },
      isLoading: false,
      isError: false,
    } as never);

    await act(async () => {
      root.render(
        <AssignmentConversationWorkspace
          selectedConversationId="conversation-deep-link"
          currentUserId="contributor-1"
          onSelectConversation={vi.fn()}
        />,
      );
    });

    expect(useAssignmentConversationQuery).toHaveBeenCalledWith(
      "conversation-deep-link",
    );
    expect(container.textContent).toContain("Deep Link Owner");
    expect(container.textContent).toContain("Deep Link Contributor");
    expect(useAssignmentMessagesQuery).toHaveBeenCalledWith(
      "conversation-deep-link",
      "",
    );
  });
});
