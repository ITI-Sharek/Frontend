import { describe, expect, it } from "vitest";

import { isAssignmentCallEvent } from "./assignment-call-event";

const call = {
  callId: "11111111-1111-4111-8111-111111111111",
  conversationId: "22222222-2222-4222-8222-222222222222",
  callerId: "33333333-3333-4333-8333-333333333333",
  callerName: "Owner Name",
  calleeId: "44444444-4444-4444-8444-444444444444",
  calleeName: "Contributor Name",
  outcome: "RINGING",
  startedAt: "2026-08-22T10:00:00.000Z",
  answeredAt: null,
  endedAt: null,
  durationSeconds: null,
  endReason: null,
  maxDurationSeconds: 3_600,
};

function event(overrides: Record<string, unknown> = {}) {
  return {
    eventId: "55555555-5555-4555-8555-555555555555",
    type: "assignment_call.ringing",
    version: 1,
    occurredAt: "2026-08-22T10:00:00.000Z",
    aggregateId: call.callId,
    aggregateVersion: 1,
    payload: { call },
    ...overrides,
  };
}

describe("isAssignmentCallEvent", () => {
  it("accepts a well-formed envelope for each known event type", () => {
    for (const type of [
      "assignment_call.ringing",
      "assignment_call.answered",
      "assignment_call.declined",
      "assignment_call.ended",
    ]) {
      expect(isAssignmentCallEvent(event({ type }))).toBe(true);
    }
  });

  it("rejects an unknown event type", () => {
    expect(isAssignmentCallEvent(event({ type: "assignment_call.missed" }))).toBe(false);
  });

  it("rejects a mismatched aggregateId/callId pair", () => {
    expect(
      isAssignmentCallEvent(event({ aggregateId: "99999999-9999-4999-8999-999999999999" })),
    ).toBe(false);
  });

  it("rejects an unknown outcome", () => {
    expect(
      isAssignmentCallEvent(
        event({ payload: { call: { ...call, outcome: "SNOOZED" } } }),
      ),
    ).toBe(false);
  });

  it("rejects a non-positive aggregateVersion", () => {
    expect(isAssignmentCallEvent(event({ aggregateVersion: 0 }))).toBe(false);
  });

  it("rejects a completely malformed payload", () => {
    expect(isAssignmentCallEvent({ type: "assignment_call.ringing" })).toBe(false);
    expect(isAssignmentCallEvent(null)).toBe(false);
    expect(isAssignmentCallEvent("assignment_call.ringing")).toBe(false);
  });
});
