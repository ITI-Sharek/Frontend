// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { acquireLocalMedia } from "../lib/media-devices";
import { CallDevicePreview } from "./call-device-preview";

vi.mock("../lib/media-devices", () => ({
  acquireLocalMedia: vi.fn(),
  listMediaDevices: vi.fn().mockResolvedValue([]),
  stopMediaKindResult: vi.fn(),
}));

vi.mock("../utils/device-preference-storage", () => ({
  readDevicePreference: () => ({ audioDeviceId: null, videoDeviceId: null }),
  writeDevicePreference: vi.fn(),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("CallDevicePreview: camera and microphone default OFF on every mount", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  async function render(variant: "outgoing" | "incoming" = "outgoing") {
    await act(async () => {
      root.render(
        <CallDevicePreview
          peerName="Contributor Name"
          variant={variant}
          onConfirm={() => undefined}
          onCancel={() => undefined}
        />,
      );
    });
  }

  it("never calls getUserMedia (via acquireLocalMedia) on mount", async () => {
    await render();
    expect(acquireLocalMedia).not.toHaveBeenCalled();
  });

  it("renders the microphone toggle as off (aria-pressed=false) on mount", async () => {
    await render();
    const buttons = [...container.querySelectorAll("button[aria-pressed]")];
    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button.getAttribute("aria-pressed")).toBe("false");
    }
  });

  it("shows the camera-off placeholder instead of a live video element on mount", async () => {
    await render();
    expect(container.querySelector('[data-testid="camera-off-placeholder"]')).not.toBeNull();
    expect(container.querySelector("video")).toBeNull();
  });

  it("still defaults to off on a second, independent mount (e.g. re-entering the incoming flow)", async () => {
    await render("outgoing");
    await act(async () => root.unmount());
    container.remove();

    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await render("incoming");

    const buttons = [...container.querySelectorAll("button[aria-pressed]")];
    for (const button of buttons) {
      expect(button.getAttribute("aria-pressed")).toBe("false");
    }
    expect(acquireLocalMedia).not.toHaveBeenCalled();
  });
});
