import { axiosInstance } from "@/lib/axios/axios-instance";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  listAssignmentMessages,
  sendAssignmentMessage,
} from "./assignment-conversations.service";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axiosInstance);

describe("assignment conversation service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads message history through the authorized conversation endpoint", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { items: [], nextCursor: null },
    });

    await expect(
      listAssignmentMessages("conversation/1", { limit: 20, query: "Redis" }),
    ).resolves.toEqual({ items: [], nextCursor: null });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/assignment-conversations/conversation%2F1/messages",
      { params: { limit: 20, query: "Redis" } },
    );
  });

  it("sends a durable message with its idempotency key", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { messageId: "message-1", body: "Hello" },
    });

    await expect(
      sendAssignmentMessage({
        conversationId: "conversation-1",
        idempotencyKey: "message-1",
        body: "Hello",
      }),
    ).resolves.toMatchObject({ messageId: "message-1" });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/assignment-conversations/conversation-1/messages",
      { idempotencyKey: "message-1", body: "Hello" },
    );
  });
});
