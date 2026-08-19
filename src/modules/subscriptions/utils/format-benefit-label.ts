import type { TFunction } from "i18next";

import type { SubscriptionBenefitDto } from "../types/subscription.types";

/**
 * Formats a subscription benefit label into the active locale.
 *
 * Backend benefits are server-authored and default to English descriptions.
 * This function localizes known benefit keys into the user's active language
 * (with full Arabic and English pluralization rules) and gracefully falls back
 * to the server-supplied `benefit.label` for any unknown or future benefits.
 */
export function formatBenefitLabel(
  benefit: SubscriptionBenefitDto,
  t: TFunction,
): string {
  const { key, state, label } = benefit;

  switch (key) {
    case "OWNER_MONTHLY_CONTRIBUTION_REQUESTS": {
      const match = label.match(/\d+/);
      const count = match ? parseInt(match[0], 10) : undefined;
      if (count !== undefined) {
        return t(
          "subscriptions.benefitItems.OWNER_MONTHLY_CONTRIBUTION_REQUESTS",
          {
            count,
            defaultValue: label,
          },
        );
      }
      return label;
    }

    case "OWNER_CONTRIBUTOR_MATCHING": {
      if (state === "included") {
        const match = label.match(/\d+/);
        const count = match ? parseInt(match[0], 10) : undefined;
        if (count !== undefined) {
          return t(
            "subscriptions.benefitItems.OWNER_CONTRIBUTOR_MATCHING_included",
            {
              count,
              defaultValue: label,
            },
          );
        }
      }
      return t(
        "subscriptions.benefitItems.OWNER_CONTRIBUTOR_MATCHING_unavailable",
        {
          defaultValue: label,
        },
      );
    }

    case "CONTRIBUTOR_DAILY_APPLICATIONS": {
      const match = label.match(/\d+/);
      const count = match ? parseInt(match[0], 10) : 1;
      return t("subscriptions.benefitItems.CONTRIBUTOR_DAILY_APPLICATIONS", {
        count,
        defaultValue: label,
      });
    }

    case "CONTRIBUTOR_MATCHED_PROJECTS": {
      if (state === "included") {
        const match = label.match(/\d+/);
        const count = match ? parseInt(match[0], 10) : undefined;
        if (count !== undefined) {
          return t(
            "subscriptions.benefitItems.CONTRIBUTOR_MATCHED_PROJECTS_included",
            {
              count,
              defaultValue: label,
            },
          );
        }
      }
      return t(
        "subscriptions.benefitItems.CONTRIBUTOR_MATCHED_PROJECTS_unavailable",
        {
          defaultValue: label,
        },
      );
    }

    default:
      return label;
  }
}
