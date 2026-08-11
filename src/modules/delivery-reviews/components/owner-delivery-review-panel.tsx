import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, ExternalLink, Loader2, Star } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";

import { deliveryKeys } from "../api/query-keys";
import { httpDeliveryClient } from "../services/delivery-client";
import type {
  DeliveryClient,
  ReviewDeliveryCommand,
} from "../types/delivery.types";

type ReviewOutcome = ReviewDeliveryCommand["outcome"];

export function OwnerDeliveryReviewPanel({
  requestId,
  client = httpDeliveryClient,
}: {
  requestId: string;
  client?: DeliveryClient;
}) {
  const queryClient = useQueryClient();
  const lifecycleQuery = useQuery({
    queryKey: deliveryKeys.ownerLifecycle(),
    queryFn: () => client.getOwnerLifecycle(),
  });
  const queueQuery = useQuery({
    queryKey: deliveryKeys.ownerQueue(),
    queryFn: () => client.getOwnerReviewQueue(),
  });
  const requestContributions =
    lifecycleQuery.data?.contributions.filter(
      (item) => item.contributionRequestId === requestId,
    ) ?? [];
  const contribution =
    requestContributions.find(
      (item) => item.applicationStatus === "ACCEPTED",
    ) ?? requestContributions.at(0);
  const delivery = contribution?.delivery ?? null;
  const detailQuery = useQuery({
    queryKey: deliveryKeys.detail(delivery?.id ?? "pending"),
    queryFn: () => client.getDelivery(delivery!.id),
    enabled: Boolean(delivery),
  });
  const idempotencyKey = useRef<string | null>(null);
  const [outcome, setOutcome] = useState<ReviewOutcome>("APPROVED");
  const [rating, setRating] = useState("");
  const [feedback, setFeedback] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const reviewMutation = useMutation({
    mutationFn: () =>
      client.reviewDelivery(delivery!.id, {
        outcome,
        rating: outcome === "APPROVED" ? Number(rating) : undefined,
        feedback: feedback.trim() || undefined,
        idempotencyKey: (idempotencyKey.current ??= crypto.randomUUID()),
      }),
    onSuccess: async (reviewedDelivery) => {
      idempotencyKey.current = null;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: deliveryKeys.ownerLifecycle() }),
        queryClient.invalidateQueries({ queryKey: deliveryKeys.ownerQueue() }),
        queryClient.invalidateQueries({
          queryKey: deliveryKeys.detail(reviewedDelivery.id),
        }),
      ]);
    },
  });

  if (lifecycleQuery.isPending || queueQuery.isPending) {
    return (
      <p role="status" className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        جارٍ تحميل حالة التسليم…
      </p>
    );
  }

  if (lifecycleQuery.isError || queueQuery.isError) {
    return (
      <Card className="mt-6 border-destructive/25 p-5">
        <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
          <CircleAlert className="size-4" aria-hidden />
          تعذر تحميل مساحة مراجعة التسليم.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => {
            void lifecycleQuery.refetch();
            void queueQuery.refetch();
          }}
        >
          إعادة المحاولة
        </Button>
      </Card>
    );
  }

  if (!contribution) {
    return (
      <Card className="mt-6 p-5">
        <p className="text-sm text-muted-foreground">
          لا يوجد إسناد عمل مرتبط بهذا الطلب.
        </p>
      </Card>
    );
  }

  if (!delivery) {
    return (
      <Card className="mt-6 p-5">
        <h2 className="font-bold text-foreground">التسليم</h2>
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          بانتظار أن يرسل المساهم رابط Pull Request.
        </p>
      </Card>
    );
  }

  const queueDelivery = queueQuery.data.deliveries.find(
    (item) => item.id === delivery.id,
  );
  const contributor = detailQuery.data?.contributor ?? contribution.contributor;

  if (delivery.status === "APPROVED") {
    return (
      <Card className="mt-6 border-evidence-teal/30 bg-evidence-teal/5 p-5">
        <h2 className="font-bold text-foreground">اكتمل طلب المساهمة</h2>
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          اعتمدت التسليم وسُجل التقييم في سجل المراجعة.
        </p>
      </Card>
    );
  }

  if (delivery.status === "CHANGES_REQUESTED" || delivery.status === "REJECTED") {
    return (
      <Card className="mt-6 p-5">
        <h2 className="font-bold text-foreground">حالة التسليم</h2>
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          {delivery.status === "CHANGES_REQUESTED"
            ? "بانتظار إعادة إرسال المساهم بعد طلب التغييرات."
            : "تم رفض التسليم مع حفظ الملاحظات."}
        </p>
      </Card>
    );
  }

  function changeOutcome(nextOutcome: ReviewOutcome) {
    idempotencyKey.current = null;
    setOutcome(nextOutcome);
    setValidationError(null);
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    setReviewError(null);
    if (outcome === "APPROVED" && !["1", "2", "3", "4", "5"].includes(rating)) {
      setValidationError("اختر تقييمًا من نجمة واحدة إلى خمس نجوم قبل الاعتماد.");
      return;
    }
    if (outcome !== "APPROVED" && !feedback.trim()) {
      setValidationError("اكتب ملاحظات واضحة للمساهم قبل إرسال هذا القرار.");
      return;
    }
    try {
      await reviewMutation.mutateAsync();
    } catch {
      setReviewError("تعذر حفظ قرار المراجعة الآن. حاول مرة أخرى.");
    }
  }

  const actionLabel = {
    APPROVED: "اعتماد التسليم",
    CHANGES_REQUESTED: "طلب تغييرات",
    REJECTED: "رفض التسليم",
  }[outcome];

  return (
    <Card className="mt-6 p-5 md:p-6">
      <h2 className="text-lg font-bold text-foreground">
        مراجعة تسليم {contributor.displayName}
      </h2>
      <a
        href={delivery.pullRequestUrl}
        target="_blank"
        rel="noreferrer"
        dir="ltr"
        className="mt-3 inline-flex items-center gap-2 break-all font-mono text-sm text-primary underline-offset-4 hover:underline"
      >
        {delivery.pullRequestUrl}
        <ExternalLink className="size-4 shrink-0" aria-hidden />
      </a>

      {queueDelivery && queueDelivery.contributionRequest.requirements.length > 0 && (
        <section aria-labelledby="delivery-requirements-heading" className="mt-5">
          <h3 id="delivery-requirements-heading" className="font-semibold text-foreground">
            متطلبات المراجعة
          </h3>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-muted-foreground">
            {queueDelivery.contributionRequest.requirements.map((requirement) => (
              <li key={`${requirement.kind}-${requirement.position}`}>
                {requirement.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      <form
        className="mt-6 space-y-4 border-t border-border pt-5"
        onSubmit={(event) => void submitReview(event)}
      >
        <div>
          <Label htmlFor="delivery-review-outcome">قرار المراجعة</Label>
          <select
            id="delivery-review-outcome"
            name="outcome"
            className="mt-2 h-[50px] w-full rounded-input border border-border bg-input-bg px-[17px] text-foreground outline-none focus:border-primary/60 focus:ring-3 focus:ring-primary/10"
            value={outcome}
            disabled={reviewMutation.isPending}
            onChange={(event) => changeOutcome(event.target.value as ReviewOutcome)}
          >
            <option value="APPROVED">اعتماد</option>
            <option value="CHANGES_REQUESTED">طلب تغييرات</option>
            <option value="REJECTED">رفض</option>
          </select>
        </div>

        {outcome === "APPROVED" && (
          <div>
            <Label htmlFor="delivery-review-rating">التقييم</Label>
            <div className="relative mt-2">
              <Star className="pointer-events-none absolute end-4 top-4 size-4 text-muted-foreground" aria-hidden />
              <select
                id="delivery-review-rating"
                name="rating"
                className="h-[50px] w-full rounded-input border border-border bg-input-bg px-[17px] pe-11 text-foreground outline-none focus:border-primary/60 focus:ring-3 focus:ring-primary/10"
                value={rating}
                disabled={reviewMutation.isPending}
                onChange={(event) => {
                  idempotencyKey.current = null;
                  setRating(event.target.value);
                  setValidationError(null);
                }}
              >
                <option value="">اختر التقييم</option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value} {value === 1 ? "نجمة" : "نجوم"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="delivery-review-feedback">
            ملاحظات المراجعة {outcome === "APPROVED" ? "(اختياري)" : "(مطلوب)"}
          </Label>
          <textarea
            id="delivery-review-feedback"
            name="feedback"
            rows={4}
            maxLength={5000}
            className="mt-2 w-full resize-y rounded-input border border-border bg-input-bg px-[17px] py-[13px] text-base text-foreground outline-none focus:border-primary/60 focus:ring-3 focus:ring-primary/10"
            value={feedback}
            disabled={reviewMutation.isPending}
            onChange={(event) => {
              idempotencyKey.current = null;
              setFeedback(event.target.value);
              setValidationError(null);
            }}
          />
        </div>

        {validationError && <p role="alert" className="text-sm text-destructive">{validationError}</p>}
        {reviewError && <p role="alert" className="text-sm text-destructive">{reviewError}</p>}
        <Button type="submit" disabled={reviewMutation.isPending}>
          {reviewMutation.isPending ? "جارٍ حفظ القرار…" : actionLabel}
        </Button>
      </form>
    </Card>
  );
}
