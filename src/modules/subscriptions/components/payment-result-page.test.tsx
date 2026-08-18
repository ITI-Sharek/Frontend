// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PaymentStatusDto } from "../types/subscription.types";
import {
  clearPendingPaymentId,
  savePendingPaymentId,
} from "../services/payment-session.service";
import { PaymentResultPage } from "./payment-result-page";

vi.mock("../api/queries/use-subscription-query", () => ({
  usePaymentStatusQuery: vi.fn(),
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn(),
}));

const { usePaymentStatusQuery } =
  await import("../api/queries/use-subscription-query");
const { useQueryClient } = await import("@tanstack/react-query");

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const paymentId = "33333333-3333-4333-8333-333333333333";

function payment(overrides: Partial<PaymentStatusDto> = {}): PaymentStatusDto {
  return {
    paymentId,
    planType: "gold",
    roleContext: "contributor",
    amountCents: 50000,
    currency: "EGP",
    status: "pending",
    createdAt: "2026-08-18T00:00:00.000Z",
    paidAt: null,
    ...overrides,
  };
}

describe("PaymentResultPage", () => {
  let container: HTMLDivElement;
  let root: Root;
  const refetch = vi.fn();
  const invalidateQueries = vi.fn();

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries } as never);
    vi.mocked(usePaymentStatusQuery).mockReturnValue({
      data: payment(),
      isPending: false,
      isError: false,
      error: null,
      refetch,
    } as never);
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    clearPendingPaymentId();
    vi.clearAllMocks();
  });

  it("keeps a pending attempt pending instead of claiming success from a redirect", async () => {
    await act(async () =>
      root.render(<PaymentResultPage paymentId={paymentId} />),
    );

    expect(container.textContent).toContain("ما زال قيد المعالجة");
    expect(container.textContent).not.toContain("مفعّلة");
    expect(container.querySelector("[role='status']")).not.toBeNull();
  });

  it("shows Gold only after the backend status is paid", async () => {
    vi.mocked(usePaymentStatusQuery).mockReturnValue({
      data: payment({
        status: "paid",
        paidAt: "2026-08-18T00:01:00.000Z",
      }),
      isPending: false,
      isError: false,
      error: null,
      refetch,
    } as never);

    await act(async () =>
      root.render(<PaymentResultPage paymentId={paymentId} />),
    );

    expect(container.textContent).toContain("الخطة الذهبية مفعّلة");
    expect(invalidateQueries).toHaveBeenCalled();
  });

  it("offers a new attempt after a failed payment", async () => {
    vi.mocked(usePaymentStatusQuery).mockReturnValue({
      data: payment({ status: "failed" }),
      isPending: false,
      isError: false,
      error: null,
      refetch,
    } as never);

    await act(async () =>
      root.render(<PaymentResultPage paymentId={paymentId} />),
    );

    expect(container.textContent).toContain("لم يكتمل الدفع");
    expect(container.textContent).toContain("حاول الدفع مرة أخرى");
    expect(container.querySelector("a button")).toBeNull();
  });

  it.each([
    ["cancelled", "تم إلغاء الدفع"],
    ["refunded", "تم رد مبلغ الدفع"],
  ] as const)(
    "explains a %s payment without calling it failed",
    async (status, title) => {
      vi.mocked(usePaymentStatusQuery).mockReturnValue({
        data: payment({ status }),
        isPending: false,
        isError: false,
        error: null,
        refetch,
      } as never);

      await act(async () =>
        root.render(<PaymentResultPage paymentId={paymentId} />),
      );

      expect(container.textContent).toContain(title);
      expect(container.textContent).not.toContain("لم يكتمل الدفع");
      expect(container.querySelector("a button")).toBeNull();
    },
  );

  it("uses the session payment id when the provider returns without a query", async () => {
    savePendingPaymentId(paymentId);
    await act(async () => root.render(<PaymentResultPage />));

    expect(vi.mocked(usePaymentStatusQuery)).toHaveBeenCalledWith(
      paymentId,
      expect.objectContaining({ enabled: true }),
    );
  });

  it("explains when the browser has no payment attempt to verify", async () => {
    await act(async () => root.render(<PaymentResultPage />));

    expect(container.textContent).toContain("لم يتم العثور على محاولة الدفع");
  });
});
