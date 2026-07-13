import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { ValidationResult } from "./validation-result";
import type { ValidationResultDto } from "../types/task.types";

function makeResult(
  decision: ValidationResultDto["decision"],
): ValidationResultDto {
  return {
    decision,
    confidenceBand: decision === "review_needed" ? "low" : "high",
    justification: "ملفك الموثق يُظهر React متقدمًا.",
    matched: ["React"],
    missing: decision === "ineligible" ? ["JWT"] : [],
    evidenceRefs: ["repo: dashboard-ui (34 commit)"],
    alternatives:
      decision === "ineligible"
        ? [
            {
              id: "t-alt",
              title: "مهمة بديلة",
              projectName: "sharek-backend",
              projectSlug: "sharek-backend",
              requiredTechnologies: ["React"],
              difficulty: "beginner",
              deadlineLabel: null,
              rewardLabel: null,
              applicantsLabel: "لا متقدمين بعد",
              fitHint: null,
            },
          ]
        : [],
  };
}

describe("validation result (WF-06/12)", () => {
  it("eligible: verdict + next actor", () => {
    const html = renderToStaticMarkup(
      <ValidationResult result={makeResult("eligible")} />,
    );
    expect(html).toContain("مؤهل — أُرسل إلى صاحب المشروع");
    expect(html).toContain("ماذا بعد؟");
    expect(html).toContain("القرار النهائي دائمًا لإنسان");
  });

  it("ineligible: honest reason, alternatives, dispute, no paywalled reason", () => {
    const html = renderToStaticMarkup(
      <ValidationResult result={makeResult("ineligible")} />,
    );
    expect(html).toContain("غير مؤهل حاليًا");
    expect(html).toContain("مهام تطابقك بالكامل اليوم");
    expect(html).toContain("اعتراض على القرار");
    expect(html).toContain("السبب نفسه مجاني");
  });

  it("review_needed: human review, attempt reserved, nothing required", () => {
    const html = renderToStaticMarkup(
      <ValidationResult result={makeResult("review_needed")} />,
    );
    expect(html).toContain("يحتاج إلى مراجعة بشرية");
    expect(html).toContain("محاولتك");
    expect(html).toContain("الثقة: منخفضة");
  });
});
