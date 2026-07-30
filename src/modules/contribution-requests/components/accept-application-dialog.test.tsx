// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AcceptApplicationDialog } from "./accept-application-dialog";
import type { ApplicationDto } from "../types/application.types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

describe("accept Application confirmation", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("states Assignment and sibling consequences before confirmation", async () => {
    await act(async () => {
      root.render(
        <AcceptApplicationDialog
          application={application()}
          isOpen
          isSubmitting={false}
          error={null}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />,
      );
    });

    expect(container.textContent).toContain("إسناد عمل واحدًا");
    expect(container.textContent).toContain(
      "جميع طلبات التقديم الأخرى المعلقة",
    );
    expect(document.activeElement?.textContent).toContain(
      "مراجعة الطلب مرة أخرى",
    );
  });

  it("closes with Escape when no decision is being submitted", async () => {
    const onCancel = vi.fn();
    await act(async () => {
      root.render(
        <AcceptApplicationDialog
          application={application()}
          isOpen
          isSubmitting={false}
          error={null}
          onCancel={onCancel}
          onConfirm={vi.fn()}
        />,
      );
    });

    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

function application(): ApplicationDto {
  return {
    id: "application-1",
    contributionRequestId: "request-1",
    contributor: { id: "user-1", username: "sara", displayName: "سارة" },
    profileContext: {
      bio: null,
      availability: null,
      experienceLevel: null,
      fields: [],
      declaredSkills: [],
    },
    contributionApproach: "A complete approach.",
    proposedDeliveryDurationDays: 5,
    status: "PENDING_OWNER_REVIEW",
    requirementSnapshot: { required: [], preferred: [] },
    evidenceSummary: [],
    submittedAt: "2026-07-28T10:00:00.000Z",
    reviewDueAt: null,
    expiresAt: null,
    expiredAt: null,
    overdue: false,
    ownerDecision: null,
    assignment: null,
  };
}
