import { CircleAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { ContributionJourneyPath } from "./contribution-journey-path";
import { getDeliveryLifecycleCopy, formatDeliveryDate } from "./delivery-lifecycle-copy";
import { deliveryKeys } from "../api/query-keys";
import { httpDeliveryClient } from "../services/delivery-client";
import type { DeliveryClient } from "../types/delivery.types";

export function ContributorDeliveryLifecycleSection({
  client = httpDeliveryClient,
}: {
  client?: DeliveryClient;
}) {
  const { t, i18n } = useTranslation();
  const lifecycleCopy = getDeliveryLifecycleCopy(t);
  const query = useQuery({
    queryKey: deliveryKeys.contributorLifecycle(),
    queryFn: () => client.getContributorLifecycle(),
  });

  if (query.isPending || query.data?.contributions.length === 0) {
    return null;
  }

  return (
    <section id="deliveries" aria-labelledby="contributor-deliveries-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 id="contributor-deliveries-heading" className="text-xl font-bold text-foreground">
            {t("deliveryReviews.contributorLifecycle.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("deliveryReviews.contributorLifecycle.description")}
          </p>
        </div>
      </div>

      {query.isError ? (
        <Card className="border-destructive/25 p-5">
          <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
            <CircleAlert className="size-4" aria-hidden />
            {t("deliveryReviews.contributorLifecycle.loadError")}
          </p>
          <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => void query.refetch()}>
            {t("common.retry")}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {query.data.contributions.map((contribution) => {
            const dueAt = formatDeliveryDate(contribution.deliveryDueAt, i18n.language);
            return (
              <article
                key={contribution.applicationId}
                className="overflow-hidden rounded-card border border-border bg-card shadow-[var(--shadow-record)]"
              >
                <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="bidi text-pretty text-[17px] font-bold leading-snug text-foreground">
                      {contribution.contributionRequestTitle}
                    </h3>
                    <p
                      role="status"
                      className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-evidence-teal/30 bg-evidence-soft px-2.5 py-1 text-xs font-bold text-evidence-soft-foreground"
                    >
                      {lifecycleCopy[contribution.lifecycleStatus]}
                    </p>
                    {dueAt && contribution.lifecycleStatus === "AWAITING_DELIVERY" && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("deliveryReviews.contributorLifecycle.dueAt", { date: dueAt })}
                      </p>
                    )}
                  </div>
                  <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                    <a href={ROUTES.application(contribution.applicationId)}>
                      {t("deliveryReviews.contributorLifecycle.open")}
                    </a>
                  </Button>
                </div>

                {/* The same status, drawn against the stages it belongs to. */}
                <div className="bg-surface-fog/60 px-4 pb-3 pt-5 sm:px-6">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-subtle-foreground">
                    {t("deliveryReviews.journey.title")}
                  </p>
                  <ContributionJourneyPath status={contribution.lifecycleStatus} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
