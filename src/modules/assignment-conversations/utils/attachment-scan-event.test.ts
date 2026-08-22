import { describe, expect, it } from "vitest";

import { isAttachmentScanStateChangedEvent } from "./attachment-scan-event";

const event = {
  eventId: "88888888-8888-4888-8888-888888888888",
  type: "attachment.scan_state_changed",
  version: 1,
  occurredAt: "2026-08-09T12:03:00.000Z",
  aggregateId: "33333333-3333-4333-8333-333333333333",
  aggregateVersion: 1,
  payload: {
    attachmentId: "33333333-3333-4333-8333-333333333333",
    messageId: "66666666-6666-4666-8666-666666666666",
    filename: "report.pdf",
    byteSize: 2_048,
    mimeType: "application/pdf",
    caption: null,
    scanState: "ready",
  },
};

describe("attachment scan realtime event", () => {
  it("accepts only a version-one envelope whose aggregate matches the attachment", () => {
    expect(isAttachmentScanStateChangedEvent(event)).toBe(true);
    expect(
      isAttachmentScanStateChangedEvent({
        ...event,
        aggregateId: "99999999-9999-4999-8999-999999999999",
      }),
    ).toBe(false);
    expect(
      isAttachmentScanStateChangedEvent({ ...event, version: 2 }),
    ).toBe(false);
    expect(
      isAttachmentScanStateChangedEvent({
        ...event,
        type: "conversation.message.created",
      }),
    ).toBe(false);
  });

  it("rejects an unknown scan state and a malformed aggregate version", () => {
    expect(
      isAttachmentScanStateChangedEvent({
        ...event,
        payload: { ...event.payload, scanState: "quarantined" },
      }),
    ).toBe(false);
    expect(
      isAttachmentScanStateChangedEvent({
        ...event,
        aggregateVersion: -1,
      }),
    ).toBe(false);
    expect(
      isAttachmentScanStateChangedEvent({
        ...event,
        aggregateVersion: 1.5,
      }),
    ).toBe(false);
  });

  it("accepts every scan state and a null or string caption", () => {
    for (const scanState of ["scanning", "ready", "blocked", "unavailable"]) {
      expect(
        isAttachmentScanStateChangedEvent({
          ...event,
          payload: { ...event.payload, scanState },
        }),
      ).toBe(true);
    }
    expect(
      isAttachmentScanStateChangedEvent({
        ...event,
        payload: { ...event.payload, caption: "For the review" },
      }),
    ).toBe(true);
  });
});
