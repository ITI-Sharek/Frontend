import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ACTIVE_ROUTE_TRANSITION,
  ROUTE_TRANSITION_PROFILES,
  useDelayedFlag,
} from "./use-route-loading";

function DelayedFlagConsumer({ value }: { value: boolean }) {
  const visible = useDelayedFlag(value);
  return React.createElement("div", { "data-visible": visible });
}

describe("route loading", () => {
  it("keeps the master branch's demo transition profile active", () => {
    expect(ACTIVE_ROUTE_TRANSITION).toBe(ROUTE_TRANSITION_PROFILES.demo);
    expect(ACTIVE_ROUTE_TRANSITION.bar.delay).toBe(40);
    expect(ACTIVE_ROUTE_TRANSITION.veil.minDuration).toBe(900);
  });

  it("does not show a delayed flag for an idle route", () => {
    const html = renderToStaticMarkup(React.createElement(DelayedFlagConsumer, { value: false }));

    expect(html).toContain('data-visible="false"');
  });
});
