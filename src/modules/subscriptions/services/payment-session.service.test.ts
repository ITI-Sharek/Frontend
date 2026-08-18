// @vitest-environment happy-dom

import { afterEach, describe, expect, it } from "vitest";

import {
  clearPendingPaymentId,
  isPaymentId,
  isSafeHostedCheckoutUrl,
  readPendingPaymentId,
  savePendingPaymentId,
} from "./payment-session.service";

const paymentId = "33333333-3333-4333-8333-333333333333";

describe("payment session helpers", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it("keeps only UUIDv4 payment ids across the hosted redirect", () => {
    expect(isPaymentId(paymentId)).toBe(true);
    expect(isPaymentId("not-a-payment-id")).toBe(false);

    savePendingPaymentId(paymentId);
    expect(readPendingPaymentId()).toBe(paymentId);
    clearPendingPaymentId();
    expect(readPendingPaymentId()).toBeNull();
  });

  it("accepts HTTPS hosted checkout URLs and rejects unsafe redirects", () => {
    expect(
      isSafeHostedCheckoutUrl(
        "https://accept.paymobsolutions.com/unifiedcheckout/abc",
      ),
    ).toBe(true);
    expect(isSafeHostedCheckoutUrl("http://localhost:4000/payments")).toBe(false);
    expect(isSafeHostedCheckoutUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHostedCheckoutUrl("not-a-url")).toBe(false);
  });
});
