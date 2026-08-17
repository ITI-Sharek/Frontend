import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SharekMarkLoader } from "./sharek-loader";

describe("SharekMarkLoader", () => {
  it("renders with the default size", () => {
    const html = renderToStaticMarkup(<SharekMarkLoader />);

    expect(html).toContain('width="72"');
    expect(html).toContain('height="72"');
  });

  it("renders the requested numeric size", () => {
    const smallHtml = renderToStaticMarkup(<SharekMarkLoader size={40} />);
    const largeHtml = renderToStaticMarkup(<SharekMarkLoader size={84} />);

    expect(smallHtml).toContain('width="40"');
    expect(largeHtml).toContain('width="84"');
  });

  it("renders both handoff arcs and the pulse ring", () => {
    const html = renderToStaticMarkup(<SharekMarkLoader />);

    expect(html).toContain("sk-loader__ring");
    expect(html).toContain("sk-loader__ring--b");
    expect(html).toContain("sk-loader__pulse");
  });
});
