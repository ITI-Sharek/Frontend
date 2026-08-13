import { CircleAlert, ClipboardCheck, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

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

      {query.isPending ? (
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t("deliveryReviews.contributorLifecycle.loading")}
        </p>
      ) : query.isError ? (
        <Card className="border-destructive/25 p-5">
          <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
            <CircleAlert className="size-4" aria-hidden />
            {t("deliveryReviews.contributorLifecycle.loadError")}
          </p>
          <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => void query.refetch()}>
            {t("common.retry")}
          </Button>
        </Card>
      ) : query.data.contributions.length === 0 ? (
        <Card className="border-dashed p-6 text-center">
          <ClipboardCheck className="mx-auto size-7 text-muted-foreground" aria-hidden />
          <p className="mt-2 font-semibold text-foreground">{t("deliveryReviews.contributorLifecycle.emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("deliveryReviews.contributorLifecycle.emptyDescription")}
          </p>
        </Card>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
          {query.data.contributions.map((contribution) => {
            const dueAt = formatDeliveryDate(contribution.deliveryDueAt, i18n.language);
            return (
              <article key={contribution.applicationId} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground">{contribution.contributionRequestTitle}</h3>
                  <p role="status" className="mt-1 text-sm font-medium text-evidence-teal-foreground dark:text-evidence-teal">
                    {lifecycleCopy[contribution.lifecycleStatus]}
                  </p>
                  {dueAt && contribution.lifecycleStatus === "AWAITING_DELIVERY" && (
                    <p className="mt-1 text-xs text-muted-foreground">{t("deliveryReviews.contributorLifecycle.dueAt", { date: dueAt })}</p>
                  )}
                </div>
                <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                  <a href={ROUTES.application(contribution.applicationId)}>{t("deliveryReviews.contributorLifecycle.open")}</a>
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
