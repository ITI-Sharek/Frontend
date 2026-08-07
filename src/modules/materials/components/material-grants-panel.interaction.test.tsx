// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MaterialGrantDto } from "../types/material.types";
import { MaterialGrantsPanel } from "./material-grants-panel";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const GRANTEE_ID = "11111111-1111-4111-8111-111111111111";

const grant = (overrides: Partial<MaterialGrantDto> = {}): MaterialGrantDto => ({
  granteeId: GRANTEE_ID,
  granteeName: "نور حسن",
  granteeUsername: "nour",
  grantedBy: "77777777-7777-4777-8777-777777777777",
  grantedAt: "2026-08-01T10:00:00.000Z",
  revokedAt: null,
  revokedBy: null,
  ...overrides,
});

function typeInto(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    globalThis.HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("Material grants panel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    container.remove();
  });

  async function render(
    props: Partial<{
      grants: MaterialGrantDto[];
      isLoading: boolean;
      isSubmitting: boolean;
      onGrant: (input: unknown) => Promise<void>;
      onRevoke: (input: unknown) => Promise<void>;
    }> = {},
  ) {
    await act(async () => {
      root.render(
        <MaterialGrantsPanel
          grants={props.grants ?? []}
          isLoading={props.isLoading ?? false}
          isSubmitting={props.isSubmitting ?? false}
          onGrant={((props.onGrant ?? (() => Promise.resolve())))}
          onRevoke={((props.onRevoke ?? (() => Promise.resolve())))}
        />,
      );
    });
  }

  const input = () => container.querySelector<HTMLInputElement>("input")!;
  const grantButton = () =>
    container.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const revokeButton = () =>
    [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("سحب الصلاحية"),
    );

  it("names the grantee rather than showing a raw identifier", async () => {
    await render({ grants: [grant()] });

    expect(container.textContent).toContain("نور حسن");
    expect(container.textContent).toContain("@nour");
  });

  it("copes with a contributor who has no username yet", async () => {
    await render({ grants: [grant({ granteeUsername: null })] });

    expect(container.textContent).toContain("نور حسن");
    expect(container.textContent).not.toContain("@null");
  });

  it("says revocation is immediate, including for links already issued", async () => {
    await render();

    expect(container.textContent).toContain(
      "ينتهي الوصول فور سحب الصلاحية، بما في ذلك روابط التنزيل التي أُصدرت قبل السحب",
    );
  });

  it("grants with a bare UUID idempotency key", async () => {
    const onGrant = vi.fn().mockResolvedValue(undefined);
    await render({ onGrant });

    await act(async () => {
      typeInto(input(), GRANTEE_ID);
    });
    await act(async () => {
      container
        .querySelector("form")
        ?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(onGrant).toHaveBeenCalledWith({
      granteeId: GRANTEE_ID,
      idempotencyKey: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
    });
  });

  it("reports a refused grant in the panel", async () => {
    const onGrant = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: { data: { code: "MATERIAL_GRANT_NOT_ASSIGNEE" } },
    });
    await render({ onGrant });

    await act(async () => {
      typeInto(input(), GRANTEE_ID);
    });
    await act(async () => {
      container
        .querySelector("form")
        ?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "إسناد قائم",
    );
  });

  it("revokes a live grant", async () => {
    const onRevoke = vi.fn().mockResolvedValue(undefined);
    await render({ grants: [grant()], onRevoke });

    await act(async () => {
      revokeButton()?.click();
    });

    expect(onRevoke).toHaveBeenCalledWith({
      granteeId: GRANTEE_ID,
      idempotencyKey: expect.any(String),
    });
  });

  it("keeps revoked grants visible instead of hiding the history", async () => {
    // Who once had access is exactly what someone reviewing a leak needs.
    await render({
      grants: [grant({ revokedAt: "2026-08-05T10:00:00.000Z" })],
    });

    expect(container.querySelector("details")?.textContent).toContain(
      "صلاحيات مسحوبة",
    );
    expect(container.textContent).toContain("لا توجد صلاحيات سارية");
    // No revoke control for a grant that is already revoked.
    expect(revokeButton()).toBeUndefined();
  });

  it("labels the identifier field and keeps it left-to-right", async () => {
    await render();

    const field = input();
    expect(container.querySelector(`label[for="${field.id}"]`)).not.toBeNull();
    // A UUID inside an RTL document renders in a mangled order without this.
    expect(field.getAttribute("dir")).toBe("ltr");
  });

  it("disables the grant button while a grant is in flight", async () => {
    await render({ isSubmitting: true });

    expect(grantButton().disabled).toBe(true);
  });
});
