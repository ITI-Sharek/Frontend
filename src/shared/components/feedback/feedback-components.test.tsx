import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RouteProgressBar } from "./route-progress-bar";
import { RouteVeilLoader } from "./route-veil-loader";
import { RouteTransitionLoader } from "./route-transition-loader";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  useRouterState: vi.fn(({ select }) => select({ status: "idle", isLoading: false })),
}));

describe("RouteProgressBar", () => {
  it("does not render HTML when not visible and progress is 0", () => {
    const html = renderToStaticMarkup(<RouteProgressBar progress={0} visible={false} />);
    expect(html).toBe("");
  });

  it("renders progressbar element with appropriate aria values when visible", () => {
    const html = renderToStaticMarkup(<RouteProgressBar progress={60} visible={true} />);
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="60"');
    expect(html).toContain("opacity-100");
  });
});

describe("RouteVeilLoader", () => {
  it("does not render when visible is false", () => {
    const html = renderToStaticMarkup(<RouteVeilLoader visible={false} />);
    expect(html).toBe("");
  });

  it("renders with backdrop blur and 84px SharekLoader when visible", () => {
    const html = renderToStaticMarkup(
      <RouteVeilLoader visible={true} label="جارٍ تحميل الصفحة..." />
    );
    expect(html).toContain('role="status"');
    expect(html).toContain("sharek-veil");
    expect(html).toContain("جارٍ تحميل الصفحة...");
    expect(html).toContain("شارك");
  });
});

describe("RouteTransitionLoader", () => {
  it("renders without crashing in idle state", () => {
    const html = renderToStaticMarkup(<RouteTransitionLoader isLoading={false} />);
    expect(html).toBeDefined();
  });
});
