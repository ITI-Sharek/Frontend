import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, ExternalLink, Loader2, Star } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";
import { Textarea } from "@/shared/components/ui/textarea";

import { deliveryKeys } from "../api/query-keys";
import { httpDeliveryClient } from "../services/delivery-client";
import { formatDeliveryDate } from "./delivery-lifecycle-copy";
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
  const { t, i18n } = useTranslation();
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
        {t("deliveryReviews.panel.loading")}
      </p>
    );
  }

  if (lifecycleQuery.isError || queueQuery.isError) {
    return (
      <Card className="mt-6 border-destructive/25 p-5">
        <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
          <CircleAlert className="size-4" aria-hidden />
          {t("deliveryReviews.ownerReview.loadError")}
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
          {t("common.retry")}
        </Button>
      </Card>
    );
  }

  if (!contribution) {
    return (
      <Card className="mt-6 p-5">
        <p className="text-sm text-muted-foreground">
          {t("deliveryReviews.ownerReview.noAssignment")}
        </p>
      </Card>
    );
  }

  if (!delivery) {
    return (
      <Card className="mt-6 p-5">
        <h2 className="font-bold text-foreground">{t("deliveryReviews.ownerReview.delivery")}</h2>
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          {t("deliveryReviews.ownerReview.awaitingContributor")}
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
        <h2 className="font-bold text-foreground">{t("deliveryReviews.ownerReview.completedTitle")}</h2>
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          {t("deliveryReviews.ownerReview.completedDescription")}
        </p>
      </Card>
    );
  }

  if (delivery.status === "CHANGES_REQUESTED" || delivery.status === "REJECTED") {
    return (
      <Card className="mt-6 p-5">
        <h2 className="font-bold text-foreground">{t("deliveryReviews.ownerReview.statusTitle")}</h2>
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          {delivery.status === "CHANGES_REQUESTED"
            ? t("deliveryReviews.ownerReview.awaitingResubmission")
            : t("deliveryReviews.ownerReview.rejectedStatus")}
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
      setValidationError(t("deliveryReviews.ownerReview.ratingRequired"));
      return;
    }
    if (outcome !== "APPROVED" && !feedback.trim()) {
      setValidationError(t("deliveryReviews.ownerReview.feedbackRequired"));
      return;
    }
    try {
      await reviewMutation.mutateAsync();
    } catch {
      setReviewError(t("deliveryReviews.ownerReview.saveError"));
    }
  }

  const actionLabel = {
    APPROVED: t("deliveryReviews.ownerReview.approveDelivery"),
    CHANGES_REQUESTED: t("deliveryReviews.ownerReview.requestChanges"),
    REJECTED: t("deliveryReviews.ownerReview.rejectDelivery"),
  }[outcome];

  return (
    <Card className="mt-6 p-5 md:p-6">
      <h2 className="text-lg font-bold text-foreground">
        {t("deliveryReviews.ownerReview.reviewTitle", { name: contributor.displayName })}
      </h2>
      {contributor.username && (
        <a
          href={ROUTES.contributorProfile(contributor.username)}
          className="mt-1 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("deliveryReviews.ownerReview.viewContributor")}
        </a>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        {t("deliveryReviews.ownerReview.submittedMeta", { date: formatDeliveryDate(delivery.submittedAt, i18n.language) ?? t("deliveryReviews.ownerReview.unavailableTime"), number: delivery.submissionNumber })}
      </p>
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

      {delivery.contributorNotes && (
        <section aria-labelledby="delivery-notes-heading" className="mt-5 rounded-input bg-border/20 p-4">
          <h3 id="delivery-notes-heading" className="font-semibold text-foreground">{t("deliveryReviews.ownerReview.contributorNotes")}</h3>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
            {delivery.contributorNotes}
          </p>
        </section>
      )}

      {queueDelivery && queueDelivery.contributionRequest.requirements.length > 0 && (
        <section aria-labelledby="delivery-requirements-heading" className="mt-5">
          <h3 id="delivery-requirements-heading" className="font-semibold text-foreground">
            {t("deliveryReviews.ownerReview.requirements")}
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

      {detailQuery.isPending && (
        <p role="status" className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t("deliveryReviews.ownerReview.loadingHistory")}
        </p>
      )}

      {detailQuery.data && (
        <section aria-labelledby="owner-delivery-history-heading" className="mt-5">
          <h3 id="owner-delivery-history-heading" className="font-semibold text-foreground">{t("deliveryReviews.panel.history")}</h3>
          <ol className="mt-2 space-y-3">
            {detailQuery.data.submissions.map((submission) => {
              const review = detailQuery.data.reviews.find(
                (item) => item.submissionNumber === submission.submissionNumber,
              );
              return (
                <li key={submission.submissionNumber} className="rounded-input border border-border p-4 text-sm">
                  <p className="font-semibold text-foreground">
                    {t("deliveryReviews.ownerReview.historyMeta", { number: submission.submissionNumber, date: formatDeliveryDate(submission.submittedAt, i18n.language) ?? t("deliveryReviews.ownerReview.unavailableTime") })}
                  </p>
                  {submission.contributorNotes && (
                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{submission.contributorNotes}</p>
                  )}
                  {review && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="font-medium text-foreground">
                        {{
                          APPROVED: t("deliveryReviews.ownerReview.approve"),
                          CHANGES_REQUESTED: t("deliveryReviews.ownerReview.requestChanges"),
                          REJECTED: t("deliveryReviews.ownerReview.reject"),
                        }[review.outcome]}
                        {review.rating !== null && ` — ${t("deliveryReviews.panel.ratingOutOfFive", { rating: review.rating })}`}
                      </p>
                      {review.feedback && <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{review.feedback}</p>}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <form
        className="mt-6 space-y-4 border-t border-border pt-5"
        onSubmit={(event) => void submitReview(event)}
      >
        <div>
          <Label htmlFor="delivery-review-outcome">{t("deliveryReviews.ownerReview.decision")}</Label>
          <NativeSelect
            id="delivery-review-outcome"
            name="outcome"
            className="mt-2"
            value={outcome}
            disabled={reviewMutation.isPending}
            onChange={(event) => changeOutcome(event.target.value as ReviewOutcome)}
          >
            <NativeSelectOption value="APPROVED">
              {t("deliveryReviews.ownerReview.approve")}
            </NativeSelectOption>
            <NativeSelectOption value="CHANGES_REQUESTED">
              {t("deliveryReviews.ownerReview.requestChanges")}
            </NativeSelectOption>
            <NativeSelectOption value="REJECTED">
              {t("deliveryReviews.ownerReview.reject")}
            </NativeSelectOption>
          </NativeSelect>
        </div>

        {outcome === "APPROVED" && (
          <div>
            <Label htmlFor="delivery-review-rating">{t("deliveryReviews.ownerReview.rating")}</Label>
            <div className="relative mt-2">
              <Star className="pointer-events-none absolute start-4 top-4 z-10 size-4 text-muted-foreground" aria-hidden />
              <NativeSelect
                id="delivery-review-rating"
                name="rating"
                className="ps-11"
                value={rating}
                disabled={reviewMutation.isPending}
                onChange={(event) => {
                  idempotencyKey.current = null;
                  setRating(event.target.value);
                  setValidationError(null);
                }}
              >
                <NativeSelectOption value="">
                  {t("deliveryReviews.ownerReview.chooseRating")}
                </NativeSelectOption>
                {[1, 2, 3, 4, 5].map((value) => (
                  <NativeSelectOption key={value} value={value}>
                    {t("deliveryReviews.ownerReview.stars", { count: value })}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="delivery-review-feedback">
            {t("deliveryReviews.ownerReview.feedback")} {outcome === "APPROVED" ? t("common.optional") : t("common.required")}
          </Label>
          <Textarea
            id="delivery-review-feedback"
            name="feedback"
            rows={4}
            maxLength={5000}
            className="mt-2 resize-y text-base"
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
          {reviewMutation.isPending ? t("deliveryReviews.ownerReview.saving") : actionLabel}
        </Button>
      </form>
    </Card>
  );
}
