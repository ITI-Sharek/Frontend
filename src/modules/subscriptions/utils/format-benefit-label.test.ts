import { describe, expect, it } from "vitest";
import i18n from "@/lib/i18n";
import { formatBenefitLabel } from "./format-benefit-label";

describe("formatBenefitLabel", () => {
  describe("Arabic translations (default)", () => {
    it("formats owner monthly contribution requests correctly for Arabic plural forms", async () => {
      await i18n.changeLanguage("ar");
      const t = i18n.t.bind(i18n);

      expect(
        formatBenefitLabel(
          {
            key: "OWNER_MONTHLY_CONTRIBUTION_REQUESTS",
            state: "included",
            label: "5 published Contribution Requests per month",
          },
          t,
        ),
      ).toBe("5 طلبات مساهمة منشورة شهريًا");

      expect(
        formatBenefitLabel(
          {
            key: "OWNER_MONTHLY_CONTRIBUTION_REQUESTS",
            state: "included",
            label: "30 published Contribution Requests per month",
          },
          t,
        ),
      ).toBe("30 طلب مساهمة منشورًا شهريًا");

      expect(
        formatBenefitLabel(
          {
            key: "OWNER_MONTHLY_CONTRIBUTION_REQUESTS",
            state: "included",
            label: "1 published Contribution Request per month",
          },
          t,
        ),
      ).toBe("طلب مساهمة منشور واحد شهريًا");
    });

    it("formats owner contributor matching for unavailable and included states", async () => {
      await i18n.changeLanguage("ar");
      const t = i18n.t.bind(i18n);

      expect(
        formatBenefitLabel(
          {
            key: "OWNER_CONTRIBUTOR_MATCHING",
            state: "unavailable",
            label: "AI contributor matching",
          },
          t,
        ),
      ).toBe("مطابقة المساهمين بالذكاء الاصطناعي");

      expect(
        formatBenefitLabel(
          {
            key: "OWNER_CONTRIBUTOR_MATCHING",
            state: "included",
            label: "AI contributor matching with up to 10 suggestions per Request",
          },
          t,
        ),
      ).toBe("مطابقة المساهمين بالذكاء الاصطناعي مع ما يصل إلى 10 اقتراحات لكل طلب");
    });

    it("formats contributor daily applications", async () => {
      await i18n.changeLanguage("ar");
      const t = i18n.t.bind(i18n);

      expect(
        formatBenefitLabel(
          {
            key: "CONTRIBUTOR_DAILY_APPLICATIONS",
            state: "included",
            label: "1 Application per day",
          },
          t,
        ),
      ).toBe("طلب تقديم واحد يوميًا");

      expect(
        formatBenefitLabel(
          {
            key: "CONTRIBUTOR_DAILY_APPLICATIONS",
            state: "included",
            label: "5 Applications per day",
          },
          t,
        ),
      ).toBe("5 طلبات تقديم يوميًا");
    });

    it("formats contributor matched projects for unavailable and included states", async () => {
      await i18n.changeLanguage("ar");
      const t = i18n.t.bind(i18n);

      expect(
        formatBenefitLabel(
          {
            key: "CONTRIBUTOR_MATCHED_PROJECTS",
            state: "unavailable",
            label: "Matched projects",
          },
          t,
        ),
      ).toBe("المشاريع المُطابقة");

      expect(
        formatBenefitLabel(
          {
            key: "CONTRIBUTOR_MATCHED_PROJECTS",
            state: "included",
            label: "10 matched projects",
          },
          t,
        ),
      ).toBe("10 مشاريع مُطابقة");
    });

    it("falls back to server label for unknown benefit keys", async () => {
      await i18n.changeLanguage("ar");
      const t = i18n.t.bind(i18n);

      expect(
        formatBenefitLabel(
          {
            key: "UNKNOWN_FUTURE_KEY",
            state: "included",
            label: "Custom server feature",
          },
          t,
        ),
      ).toBe("Custom server feature");
    });
  });

  describe("English translations", () => {
    it("formats benefits in English properly", async () => {
      await i18n.changeLanguage("en");
      const t = i18n.t.bind(i18n);

      expect(
        formatBenefitLabel(
          {
            key: "OWNER_MONTHLY_CONTRIBUTION_REQUESTS",
            state: "included",
            label: "5 published Contribution Requests per month",
          },
          t,
        ),
      ).toBe("5 published Contribution Requests per month");

      expect(
        formatBenefitLabel(
          {
            key: "OWNER_CONTRIBUTOR_MATCHING",
            state: "unavailable",
            label: "AI contributor matching",
          },
          t,
        ),
      ).toBe("AI contributor matching");

      expect(
        formatBenefitLabel(
          {
            key: "OWNER_CONTRIBUTOR_MATCHING",
            state: "included",
            label: "AI contributor matching with up to 10 suggestions per Request",
          },
          t,
        ),
      ).toBe("AI contributor matching with up to 10 suggestions per Request");

      expect(
        formatBenefitLabel(
          {
            key: "CONTRIBUTOR_DAILY_APPLICATIONS",
            state: "included",
            label: "1 Application per day",
          },
          t,
        ),
      ).toBe("1 Application per day");

      expect(
        formatBenefitLabel(
          {
            key: "CONTRIBUTOR_DAILY_APPLICATIONS",
            state: "included",
            label: "5 Applications per day",
          },
          t,
        ),
      ).toBe("5 Applications per day");

      expect(
        formatBenefitLabel(
          {
            key: "CONTRIBUTOR_MATCHED_PROJECTS",
            state: "unavailable",
            label: "Matched projects",
          },
          t,
        ),
      ).toBe("Matched projects");

      expect(
        formatBenefitLabel(
          {
            key: "CONTRIBUTOR_MATCHED_PROJECTS",
            state: "included",
            label: "10 matched projects",
          },
          t,
        ),
      ).toBe("10 matched projects");
    });
  });
});
