import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { OnboardingView } from "./onboarding-view";
import type {
  OnboardingOutcome,
  OnboardingStateDto,
  OnboardingStep,
} from "../../types/onboarding.types";

function makeState(step: OnboardingStep): OnboardingStateDto {
  return {
    step,
    github: { connected: step !== "connect", username: "sara-dev" },
    analysis: {
      status: "in_progress",
      stages: [
        { id: "fetch", label: "جلب المستودعات العامة", status: "done" },
        { id: "skills", label: "استخراج المهارات مع الأدلة", status: "running" },
      ],
    },
    generatedSkills: [
      { name: "React", proficiency: "advanced", confidence: 0.92 },
    ],
    reviewOutcome: null,
  };
}

function render(step: OnboardingStep, outcome: OnboardingOutcome = "approved") {
  return renderToStaticMarkup(
    <OnboardingView
      state={makeState(step)}
      outcome={outcome}
      onGoToStep={() => {}}
      onConnectGitHub={() => Promise.resolve()}
      exploreHref="/explore"
      dashboardHref="/dashboard"
    />,
  );
}

describe("onboarding view", () => {
  it("shows read-only consent copy on the connect step", () => {
    const html = render("connect");
    expect(html).toContain("ربط حساب GitHub");
    expect(html).toContain("للقراءة فقط");
  });

  it("shows staged progress with leave-and-notify copy", () => {
    const html = render("analysis");
    expect(html).toContain("جارٍ تحليل نشاطك");
    expect(html).toContain("سنخبرك عند اكتمال التحليل");
  });

  it("shows the generated profile with flag affordance and human-review promise", () => {
    const html = render("preview");
    expect(html).toContain("ملفك المهاري المُولَّد");
    expect(html).toContain("الإبلاغ عن خطأ");
    expect(html).toContain("المراجعة البشرية أولاً");
  });

  it("sets the 48-hour expectation while pending review", () => {
    const html = render("review");
    expect(html).toContain("تُستكمل معظم المراجعات خلال 48 ساعة");
    expect(html).toContain("استكشف المشاريع في هذه الأثناء");
  });

  it("renders all three decision outcomes with forward actions", () => {
    expect(render("decision", "approved")).toContain("ملفك موثق");
    const partial = render("decision", "partially_approved");
    expect(partial).toContain("المهارات المعتمدة فقط");
    const rejected = render("decision", "rejected");
    expect(rejected).toContain("اعتراض على القرار");
    expect(rejected).toContain("إعادة التحليل بعد التحسين");
  });
});
