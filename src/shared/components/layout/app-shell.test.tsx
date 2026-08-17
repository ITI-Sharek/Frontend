// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "./app-shell";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

function NavigationIcon({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean }) {
  return <svg aria-hidden={ariaHidden} />;
}

describe("AppShell accessibility", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dir = "rtl";
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    root.unmount();
    container.remove();
  });

  it("makes the sidebar resize separator keyboard-operable", async () => {
    await act(async () => {
      root.render(
        <AppShell
          nav={[{ label: "الرئيسية", to: "/home", icon: NavigationIcon }]}
        >
          <p>المحتوى</p>
        </AppShell>,
      );
    });

    const separator = container.querySelector<HTMLElement>(
      '[role="separator"]',
    );
    expect(separator).not.toBeNull();
    expect(separator?.tabIndex).toBe(0);
    expect(separator?.getAttribute("aria-valuemin")).toBe("180");
    expect(separator?.getAttribute("aria-valuemax")).toBe("360");
    expect(separator?.getAttribute("aria-valuenow")).toBe("240");

    await act(async () => {
      separator?.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "ArrowLeft" }),
      );
    });

    expect(separator?.getAttribute("aria-valuenow")).toBe("256");
  });

  it("does not render a footer in workspace app shell", async () => {
    await act(async () => {
      root.render(
        <AppShell
          nav={[{ label: "الرئيسية", to: "/home", icon: NavigationIcon }]}
        >
          <p>المحتوى</p>
        </AppShell>,
      );
    });

    const footer = container.querySelector("footer");
    expect(footer).toBeNull();
  });
});
