import { axiosInstance } from "@/lib/axios/axios-instance";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAttachmentDownloadUrl,
  createAttachmentUpload,
  getAttachmentUploadConstraints,
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

  it("threads attachment upload ids through the send call only when present", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { messageId: "message-2", body: "" },
    });

    await sendAssignmentMessage({
      conversationId: "conversation-1",
      idempotencyKey: "message-2",
      body: "",
      attachmentUploadIds: ["11111111-1111-4111-8111-111111111111"],
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/assignment-conversations/conversation-1/messages",
      {
        idempotencyKey: "message-2",
        body: "",
        attachmentUploadIds: ["11111111-1111-4111-8111-111111111111"],
      },
    );
  });

  it("starts scanning early with a multipart upload that leaves Content-Type unset", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        uploadId: "upload-1",
        filename: "report.pdf",
        byteSize: 2_048,
        mimeType: "application/pdf",
        scanState: "scanning",
        expiresAt: "2026-08-09T13:00:00.000Z",
      },
    });

    await expect(
      createAttachmentUpload({
        conversationId: "conversation-1",
        file: new File(["x"], "report.pdf", { type: "application/pdf" }),
        idempotencyKey: "22222222-2222-4222-8222-222222222222",
      }),
    ).resolves.toMatchObject({ uploadId: "upload-1", scanState: "scanning" });

    const [url, body, config] = mockedAxios.post.mock.calls[0] as [
      string,
      FormData,
      { headers: Record<string, unknown> },
    ];
    expect(url).toBe(
      "/assignment-conversations/conversation-1/attachment-uploads",
    );
    expect(body).toBeInstanceOf(FormData);
    expect(config.headers["Content-Type"]).toBeUndefined();
  });

  it("mints a fresh, short-lived download URL", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        url: "https://s3.example.com/signed",
        expiresAt: "2026-08-09T13:05:00.000Z",
        disposition: "attachment",
      },
    });

    await expect(
      createAttachmentDownloadUrl({
        conversationId: "conversation-1",
        attachmentId: "33333333-3333-4333-8333-333333333333",
      }),
    ).resolves.toMatchObject({ url: "https://s3.example.com/signed" });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/assignment-conversations/conversation-1/attachments/33333333-3333-4333-8333-333333333333/download-url",
    );
  });

  it("reads the shared attachment upload constraints", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { maxBytes: 26_214_400, maxPerMessage: 5, allowedMimeTypes: ["application/pdf"] },
    });

    await expect(getAttachmentUploadConstraints()).resolves.toEqual({
      maxBytes: 26_214_400,
      maxPerMessage: 5,
      allowedMimeTypes: ["application/pdf"],
    });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/chat-attachment-upload-constraints",
    );
  });
});
