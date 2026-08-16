// @vitest-environment happy-dom

import { act, forwardRef } from "react";
import { createRoot } from "react-dom/client";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileMenu } from "./profile-menu";

vi.mock("@tanstack/react-router", () => ({
  Link: forwardRef<
    HTMLAnchorElement,
    AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; to: string }
  >(({ children, to, ...props }, ref) => (
    <a ref={ref} href={to} {...props}>
      {children}
    </a>
  )),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

describe("ProfileMenu", () => {
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

  it("uses menu semantics and invokes logout through the shared dropdown", async () => {
    const onLogout = vi.fn();
    await act(async () => {
      root.render(
        <ProfileMenu
          displayName="Sara Ahmed"
          items={[{ label: "الملف الشخصي", to: "/profile" }]}
          onLogout={onLogout}
        />,
      );
    });

    const trigger = container.querySelector<HTMLButtonElement>(
      '[data-slot="dropdown-menu-trigger"]',
    );
    if (!trigger) throw new Error("Expected profile menu trigger");
    await act(async () => {
      trigger.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
      );
    });

    const menu = document.querySelector('[role="menu"]');
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(menu?.querySelectorAll('[role="menuitem"]')).toHaveLength(2);

    const logout = [...(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
      .find((item) => item.textContent.includes("تسجيل الخروج"));
    if (!logout) throw new Error("Expected logout menu item");
    await act(async () => logout.click());

    expect(onLogout).toHaveBeenCalledOnce();
  });
});
