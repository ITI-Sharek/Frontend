import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  useRouteLoading,
  ROUTE_LOADING_DEFAULTS,
} from "./use-route-loading";
import type { RouteLoadingState } from "./use-route-loading";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  useRouterState: vi.fn(({ select }) => select({ status: "idle", isLoading: false })),
}));

function TestHookConsumer({
  isLoading,
  onRender,
}: {
  isLoading: boolean;
  onRender: (state: RouteLoadingState) => void;
}) {
  const state = useRouteLoading(isLoading);
  onRender(state);
  return React.createElement("div", {
    "data-navigating": state.isNavigating,
    "data-progress": state.progress,
  });
}

describe("useRouteLoading", () => {
  it("exposes default timing configuration matching the specifications", () => {
    expect(ROUTE_LOADING_DEFAULTS.progressBarDelayMs).toBe(90);
    expect(ROUTE_LOADING_DEFAULTS.progressBarMinVisibleMs).toBe(380);
    expect(ROUTE_LOADING_DEFAULTS.veilDelayMs).toBe(320);
    expect(ROUTE_LOADING_DEFAULTS.veilMinVisibleMs).toBe(620);
  });

  it("returns initial idle state when loading is false", () => {
    let capturedState: RouteLoadingState | null = null;

    renderToStaticMarkup(
      React.createElement(TestHookConsumer, {
        isLoading: false,
        onRender: (state: RouteLoadingState) => {
          capturedState = state;
        },
      })
    );

    const state = capturedState as unknown as RouteLoadingState;
    expect(state.showProgressBar).toBe(false);
    expect(state.showVeil).toBe(false);
    expect(state.isNavigating).toBe(false);
  });

  it("sets isNavigating to true when navigation starts", () => {
    let capturedState: RouteLoadingState | null = null;

    renderToStaticMarkup(
      React.createElement(TestHookConsumer, {
        isLoading: true,
        onRender: (state: RouteLoadingState) => {
          capturedState = state;
        },
      })
    );

    const state = capturedState as unknown as RouteLoadingState;
    expect(state.isNavigating).toBe(true);
  });
});
