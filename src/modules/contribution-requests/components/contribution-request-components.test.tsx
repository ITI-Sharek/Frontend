import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ContributionRequestForm } from "./contribution-request-form";
import { DiscardContributionRequestDialog } from "./discard-contribution-request-dialog";
import { createEmptyContributionRequestForm } from "../utils/contribution-request-form";

describe("Contribution Request private draft UI", () => {
  it("renders distinct ordered Requirement sections with accessible controls", () => {
    const html = renderToStaticMarkup(
      <ContributionRequestForm
        initialState={{
          ...createEmptyContributionRequestForm(),
          requiredRequirements: ["First", "Second"],
          preferredRequirements: ["Helpful"],
        }}
        isSubmitting={false}
        submitError={null}
        submitLabel="حفظ المسودة"
        cancelHref="/my-projects/project-1"
        onSubmit={vi.fn()}
      />,
    );

    expect(html).toContain("المتطلبات المطلوبة");
    expect(html).toContain("المتطلبات المفضلة");
    expect(html.indexOf("First")).toBeLessThan(html.indexOf("Second"));
    expect(html).toContain("aria-label=\"تحريك لأعلى\"");
    expect(html).not.toContain("ownerId");
    expect(html).not.toContain("نشر الطلب");
    expect(html).not.toContain("إلغاء الطلب");
  });

  it("explains that discard is terminal history preservation, not deletion", () => {
    const html = renderToStaticMarkup(
      <DiscardContributionRequestDialog
        isOpen
        isDiscarding={false}
        error={null}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(html).toContain("إجراء نهائي");
    expect(html).toContain("لا يحذف السجل");
    expect(html).toContain("aria-modal=\"true\"");
  });
});
