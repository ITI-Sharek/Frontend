import { z } from "zod";

export const applicationSubmissionSchema = z.object({
  contributionApproach: z
    .string()
    .trim()
    .min(10, "اكتب نهج مساهمة من 10 إلى 5000 حرف.")
    .max(5000, "اكتب نهج مساهمة من 10 إلى 5000 حرف."),
  proposedDeliveryDurationDays: z.coerce
    .number()
    .int("حدد مدة تسليم كاملة بين يوم واحد و365 يومًا.")
    .min(1, "حدد مدة تسليم كاملة بين يوم واحد و365 يومًا.")
    .max(365, "حدد مدة تسليم كاملة بين يوم واحد و365 يومًا."),
});

export type ApplicationSubmissionInput = z.input<
  typeof applicationSubmissionSchema
>;
export type ApplicationSubmissionValues = z.output<
  typeof applicationSubmissionSchema
>;
