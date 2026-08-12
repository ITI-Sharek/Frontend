import { CircleAlert, ClipboardCheck, ExternalLink, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { DELIVERY_LIFECYCLE_COPY, formatDeliveryDate } from "./delivery-lifecycle-copy";
import { deliveryKeys } from "../api/query-keys";
import { httpDeliveryClient } from "../services/delivery-client";
import type { DeliveryClient } from "../types/delivery.types";

export function OwnerDeliveryInbox({ client = httpDeliveryClient }: { client?: DeliveryClient }) {
  const lifecycleQuery = useQuery({
    queryKey: deliveryKeys.ownerLifecycle(),
    queryFn: () => client.getOwnerLifecycle(),
  });
  const queueQuery = useQuery({
    queryKey: deliveryKeys.ownerQueue(),
    queryFn: () => client.getOwnerReviewQueue(),
  });

  const isPending = lifecycleQuery.isPending || queueQuery.isPending;
  const isError = lifecycleQuery.isError || queueQuery.isError;
  const pendingDeliveryIds = new Set(queueQuery.data?.deliveries.map((item) => item.id) ?? []);
  const contributions = lifecycleQuery.data?.contributions ?? [];

  return (
    <section aria-labelledby="owner-delivery-inbox-heading" className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="owner-delivery-inbox-heading" className="text-xl font-bold text-foreground">متابعة التسليمات</h2>
          <p className="mt-1 text-sm text-muted-foreground">راجع التسليمات الجديدة وتابع دورة كل مساهمة مقبولة.</p>
        </div>
        {!isPending && !isError && (
          <span className="text-sm font-semibold text-foreground">{pendingDeliveryIds.size} تحتاج مراجعتك</span>
        )}
      </div>

      {isPending ? (
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          جارٍ تحميل التسليمات…
        </p>
      ) : isError ? (
        <Card className="border-destructive/25 p-5">
          <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
            <CircleAlert className="size-4" aria-hidden />
            تعذر تحميل متابعة التسليمات.
          </p>
          <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => void Promise.all([lifecycleQuery.refetch(), queueQuery.refetch()])}>
            إعادة المحاولة
          </Button>
        </Card>
      ) : contributions.length === 0 ? (
        <Card className="border-dashed p-6 text-center">
          <ClipboardCheck className="mx-auto size-7 text-muted-foreground" aria-hidden />
          <p className="mt-2 font-semibold text-foreground">لا توجد تسليمات أو إسنادات بعد</p>
        </Card>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
          {contributions.map((contribution) => {
            const needsReview = contribution.delivery ? pendingDeliveryIds.has(contribution.delivery.id) : false;
            const submittedAt = formatDeliveryDate(contribution.delivery?.submittedAt ?? null);
            return (
              <article key={contribution.applicationId} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-foreground">{contribution.contributionRequestTitle}</h3>
                    {needsReview && <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">تحتاج مراجعة</span>}
                  </div>
                  <p className="mt-1 text-sm text-foreground">{contribution.contributor.displayName}</p>
                  <p role="status" className="mt-1 text-sm text-muted-foreground">{DELIVERY_LIFECYCLE_COPY[contribution.lifecycleStatus]}</p>
                  {submittedAt && <p className="mt-1 text-xs text-muted-foreground">آخر تسليم: {submittedAt}</p>}
                </div>
                <Button asChild size="sm" variant={needsReview ? "primary" : "outline"} className="w-full sm:w-auto">
                  <a href={ROUTES.contributionRequest(contribution.contributionRequestId)}>
                    {needsReview ? "مراجعة التسليم" : "فتح الطلب"}
                    <ExternalLink className="size-4" aria-hidden />
                  </a>
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
