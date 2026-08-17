import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SharekLoader } from "./sharek-loader";

describe("SharekLoader", () => {
  it("renders with default size (72px) and accessible status role", () => {
    const html = renderToStaticMarkup(<SharekLoader />);

    expect(html).toContain('role="status"');
    expect(html).toContain("sharek-loader");
    expect(html).toContain('width="72"');
    expect(html).toContain('height="72"');
  });

  it("renders with sm size (40px) and lg size (84px)", () => {
    const smHtml = renderToStaticMarkup(<SharekLoader size="sm" />);
    expect(smHtml).toContain('width="40"');
    expect(smHtml).toContain('height="40"');

    const lgHtml = renderToStaticMarkup(<SharekLoader size="lg" />);
    expect(lgHtml).toContain('width="84"');
    expect(lgHtml).toContain('height="84"');
  });

  it("renders custom numeric size", () => {
    const html = renderToStaticMarkup(<SharekLoader size={56} />);
    expect(html).toContain('width="56"');
    expect(html).toContain('height="56"');
  });

  it("renders wordmark when showWordmark is true", () => {
    const html = renderToStaticMarkup(<SharekLoader showWordmark={true} />);
    expect(html).toContain("شارك");
    expect(html).toContain("sharek-loader__wordmark");
  });

  it("renders label when showLabel is true", () => {
    const html = renderToStaticMarkup(
      <SharekLoader showLabel={true} label="جاري مزامنة السجلات..." />
    );
    expect(html).toContain("جاري مزامنة السجلات...");
  });

  it("renders orbital rotor, both arcs with heads, center dot and pulse ring in SVG", () => {
    const html = renderToStaticMarkup(<SharekLoader />);

    expect(html).toContain("sharek-loader__rotor");
    expect(html).toContain("sharek-loader__arc-group--teal");
    expect(html).toContain("sharek-loader__arc-group--indigo");
    expect(html).toContain("sharek-loader__center-dot");
    expect(html).toContain("sharek-loader__pulse");
    expect(html).toContain("sharek-loader__track");
  });
});
