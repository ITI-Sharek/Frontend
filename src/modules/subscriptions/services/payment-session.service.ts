const PENDING_PAYMENT_KEY = "sharek.pending-paymob-payment";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isPaymentId(value: unknown): value is string {
  return typeof value === "string" && UUID_V4_PATTERN.test(value);
}

/** Keep the payment id across the cross-origin Paymob hosted checkout hop. */
export function savePendingPaymentId(paymentId: string): void {
  if (typeof window === "undefined" || !isPaymentId(paymentId)) return;
  try {
    window.sessionStorage.setItem(PENDING_PAYMENT_KEY, paymentId);
  } catch {
    // A blocked storage area must not prevent the hosted checkout navigation.
  }
}

export function readPendingPaymentId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const paymentId = window.sessionStorage.getItem(PENDING_PAYMENT_KEY);
    return isPaymentId(paymentId) ? paymentId : null;
  } catch {
    return null;
  }
}

export function clearPendingPaymentId(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_PAYMENT_KEY);
  } catch {
    // Ignore storage cleanup failures; the payment is already terminal.
  }
}

/** Backend owns the checkout URL; this rejects malformed or unsafe redirects. */
export function isSafeHostedCheckoutUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0;
  } catch {
    return false;
  }
}
