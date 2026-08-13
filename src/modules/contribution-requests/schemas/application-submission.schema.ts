import { z } from "zod";
import type { TFunction } from "i18next";

import { translate } from "@/lib/translate";

function createApplicationSubmissionSchema(message: string) {
  return z.object({
    contributionApproach: z.string().trim().min(10, message).max(5000, message),
    proposedDeliveryDurationDays: z.coerce
      .number()
      .int(message)
      .min(1, message)
      .max(365, message),
  });
}

export const applicationSubmissionSchema = createApplicationSubmissionSchema(
  translate("contributionRequests.contributorDetail.validation"),
);

export function getApplicationSubmissionSchema(t: TFunction) {
  return createApplicationSubmissionSchema(
    t("contributionRequests.contributorDetail.validation"),
  );
}

export type ApplicationSubmissionInput = z.input<
  typeof applicationSubmissionSchema
>;
export type ApplicationSubmissionValues = z.output<
  typeof applicationSubmissionSchema
>;
