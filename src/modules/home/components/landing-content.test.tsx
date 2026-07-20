import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CollaborationSpaceSection } from "./collaboration-space-section";
import { ContributionRecordSection } from "./contribution-record-section";
import { FeaturesSection } from "./features-section";
import { HowItWorksSection } from "./how-it-works-section";

describe("landing page product narrative", () => {
  it("centers completed contributions, reviewable evidence, and human decisions", () => {
    const html = renderToStaticMarkup(
      <>
        <HowItWorksSection />
        <FeaturesSection />
      </>,
    );

    expect(html).toContain("الرحلة تبدأ بالعمل المناسب");
    expect(html).toContain("صاحب المشروع يتخذ قرار الاختيار النهائي");
    expect(html).toContain("الدليل ليس شارة");
    expect(html).toContain("التحليل الآلي يقدّم رأياً");
    expect(html).toContain("الأدلة ليست GitHub فقط");
  });

  it("does not restore superseded plans, quotas, or AI eligibility gates", () => {
    const html = renderToStaticMarkup(
      <>
        <HowItWorksSection />
        <FeaturesSection />
      </>,
    );

    expect(html).not.toContain("الخطة الذهبية");
    expect(html).not.toContain("طلبات يومياً");
    expect(html).not.toContain("اجتاز التحقق الذكي");
    expect(html).not.toContain("درجة أهلية");
  });

  it("presents the post-acceptance workspace and the accumulating honest record", () => {
    const html = renderToStaticMarkup(
      <>
        <CollaborationSpaceSection />
        <ContributionRecordSection />
      </>,
    );

    expect(html).toContain("مساحة عمل واحدة");
    expect(html).toContain("حالات صريحة");
    expect(html).toContain("المساهمة تنتهي، والسجل يبقى");
    expect(html).toContain("قيد المراجعة");
    expect(html).toContain("متحقق منها");
  });
});
