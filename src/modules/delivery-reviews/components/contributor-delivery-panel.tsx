import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, ExternalLink, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

import { deliveryKeys } from "../api/query-keys";
import { httpDeliveryClient } from "../services/delivery-client";
import type { DeliveryClient } from "../types/delivery.types";

const GITHUB_PULL_REQUEST_URL =
  /^https:\/\/github\.com\/[A-Za-z0-9.-]+\/[A-Za-z0-9_.-]+\/pull\/[1-9]\d*\/?$/;

export function ContributorDeliveryPanel({
  applicationId,
  client = httpDeliveryClient,
}: {
  applicationId: string;
  client?: DeliveryClient;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const lifecycleQuery = useQuery({
    queryKey: deliveryKeys.contributorLifecycle(),
    queryFn: () => client.getContributorLifecycle(),
  });
  const idempotencyKey = useRef<string | null>(null);
  const [pullRequestUrl, setPullRequestUrl] = useState("");
  const [contributorNotes, setContributorNotes] = useState("");
  const [editingSubmitted, setEditingSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const contribution = lifecycleQuery.data?.contributions.find(
    (item) => item.applicationId === applicationId,
  );
  const delivery = contribution?.delivery ?? null;
  const detailQuery = useQuery({
    queryKey: deliveryKeys.detail(delivery?.id ?? "pending"),
    queryFn: () => client.getDelivery(delivery!.id),
    enabled: Boolean(delivery),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      client.submitDelivery(applicationId, {
        pullRequestUrl: pullRequestUrl.trim(),
        contributorNotes: contributorNotes.trim() || undefined,
        idempotencyKey: (idempotencyKey.current ??= crypto.randomUUID()),
      }),
    onSuccess: async () => {
      idempotencyKey.current = null;
      await queryClient.invalidateQueries({
        queryKey: deliveryKeys.contributorLifecycle(),
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: () =>
      client.updateDelivery(delivery!.id, {
        pullRequestUrl: pullRequestUrl.trim(),
        contributorNotes: contributorNotes.trim() || undefined,
        idempotencyKey: (idempotencyKey.current ??= crypto.randomUUID()),
      }),
    onSuccess: async (updatedDelivery) => {
      idempotencyKey.current = null;
      setEditingSubmitted(false);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: deliveryKeys.contributorLifecycle(),
        }),
        queryClient.invalidateQueries({
          queryKey: deliveryKeys.detail(updatedDelivery.id),
        }),
      ]);
    },
  });

  useEffect(() => {
    if (delivery?.status !== "CHANGES_REQUESTED") return;
    setPullRequestUrl(delivery.pullRequestUrl);
    setContributorNotes(delivery.contributorNotes ?? "");
  }, [delivery?.contributorNotes, delivery?.pullRequestUrl, delivery?.status]);

  if (lifecycleQuery.isPending) {
    return (
      <p role="status" className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {t("deliveryReviews.panel.loading")}
      </p>
    );
  }

  if (lifecycleQuery.isError) {
    return (
      <Card className="mt-6 border-destructive/25 p-5">
        <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
          <CircleAlert className="size-4" aria-hidden />
          {t("deliveryReviews.panel.loadError")}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => void lifecycleQuery.refetch()}
        >
          {t("common.retry")}
        </Button>
      </Card>
    );
  }

  if (!contribution || contribution.applicationStatus !== "ACCEPTED") {
    return null;
  }

  if (delivery) {
    const statusCopy = {
      SUBMITTED: t("deliveryReviews.panel.status.submitted"),
      RESUBMITTED: t("deliveryReviews.panel.status.submitted"),
      CHANGES_REQUESTED: t("deliveryReviews.panel.status.changesRequested"),
      APPROVED: t("deliveryReviews.panel.status.approved"),
      REJECTED: t("deliveryReviews.panel.status.rejected"),
    }[delivery.status];
    const isResubmission = delivery.status === "CHANGES_REQUESTED";
    const showUpdateForm = isResubmission || editingSubmitted;
    const isSending = submitMutation.isPending || updateMutation.isPending;

    return (
      <Card className="mt-6 border-evidence-teal/30 p-5 md:p-6">
        <h2 className="text-lg font-bold text-foreground">{t("deliveryReviews.panel.title")}</h2>
        <p role="status" className="mt-2 text-sm font-medium text-evidence-teal">
          {statusCopy}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("deliveryReviews.panel.submissionNumber", { number: delivery.submissionNumber })}
        </p>
        <a
          href={delivery.pullRequestUrl}
          target="_blank"
          rel="noreferrer"
          dir="ltr"
          className="mt-4 inline-flex items-center gap-2 break-all font-mono text-sm text-primary underline-offset-4 hover:underline"
        >
          {delivery.pullRequestUrl}
          <ExternalLink className="size-4 shrink-0" aria-hidden />
        </a>

        {detailQuery.data && (
          <section
            aria-labelledby="delivery-history-heading"
            className="mt-6 border-t border-border pt-5"
          >
            <h3 id="delivery-history-heading" className="font-bold text-foreground">
              {t("deliveryReviews.panel.history")}
            </h3>
            <ol className="mt-3 space-y-3">
              {detailQuery.data.submissions.map((submission) => {
                const review = detailQuery.data.reviews.find(
                  (item) => item.submissionNumber === submission.submissionNumber,
                );
                return (
                  <li
                    key={submission.submissionNumber}
                    className="rounded-input border border-border p-4 text-sm"
                  >
                    <p className="font-semibold text-foreground">
                      {t("deliveryReviews.panel.submissionNumber", { number: submission.submissionNumber })}
                    </p>
                    {review && (
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {{
                          APPROVED: t("deliveryReviews.panel.review.approvedByOwner"),
                          CHANGES_REQUESTED: t("deliveryReviews.panel.review.changesRequested"),
                          REJECTED: t("deliveryReviews.panel.review.rejectedByOwner"),
                        }[review.outcome]}
                        {review.rating !== null && ` — ${t("deliveryReviews.panel.ratingOutOfFive", { rating: review.rating })}`}
                      </p>
                    )}
                    {review?.feedback && (
                      <blockquote className="mt-2 whitespace-pre-wrap text-muted-foreground">
                        {review.feedback}
                      </blockquote>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {delivery.status === "SUBMITTED" && !editingSubmitted && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-5"
            onClick={() => {
              setPullRequestUrl(delivery.pullRequestUrl);
              setContributorNotes(delivery.contributorNotes ?? "");
              setValidationError(null);
              setSubmitError(null);
              setEditingSubmitted(true);
            }}
          >
            {t("deliveryReviews.panel.editLink")}
          </Button>
        )}

        {showUpdateForm && (
          <form
            className="mt-6 space-y-4 border-t border-border pt-5"
            onSubmit={(event) => void submit(event)}
          >
            <div>
              <Label htmlFor="delivery-pull-request-url">{t("deliveryReviews.panel.updatedPullRequestUrl")}</Label>
              <Input
                id="delivery-pull-request-url"
                name="pullRequestUrl"
                type="url"
                dir="ltr"
                className="mt-2 font-mono"
                value={pullRequestUrl}
                disabled={isSending}
                aria-invalid={Boolean(validationError)}
                aria-describedby={validationError ? "delivery-url-error" : undefined}
                onChange={(event) => {
                  idempotencyKey.current = null;
                  setPullRequestUrl(event.target.value);
                }}
              />
              {validationError && (
                <p id="delivery-url-error" role="alert" className="mt-2 text-sm text-destructive">
                  {validationError}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="delivery-contributor-notes">{t("deliveryReviews.panel.updateNotes")}</Label>
              <Textarea
                id="delivery-contributor-notes"
                name="contributorNotes"
                rows={4}
                maxLength={5000}
                className="mt-2 resize-y text-base"
                value={contributorNotes}
                disabled={isSending}
                onChange={(event) => {
                  idempotencyKey.current = null;
                  setContributorNotes(event.target.value);
                }}
              />
            </div>
            {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
            <Button type="submit" disabled={isSending}>
              <Send className="size-4" aria-hidden />
              {isSending
                ? t("deliveryReviews.panel.sending")
                : isResubmission
                  ? t("deliveryReviews.panel.resubmit")
                  : t("deliveryReviews.panel.saveLink")}
            </Button>
            {editingSubmitted && (
              <Button
                type="button"
                variant="outline"
                className="ms-2"
                disabled={isSending}
                onClick={() => {
                  idempotencyKey.current = null;
                  setEditingSubmitted(false);
                  setValidationError(null);
                  setSubmitError(null);
                }}
              >
                {t("common.cancel")}
              </Button>
            )}
          </form>
        )}
      </Card>
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    setSubmitError(null);
    const canonicalUrl = pullRequestUrl.trim();
    if (!GITHUB_PULL_REQUEST_URL.test(canonicalUrl)) {
      setValidationError(t("deliveryReviews.panel.invalidUrl"));
      return;
    }
    try {
      if (delivery) {
        await updateMutation.mutateAsync();
      } else {
        await submitMutation.mutateAsync();
      }
    } catch {
      setSubmitError(t("deliveryReviews.panel.submitError"));
    }
  }

  return (
    <Card className="mt-6 p-5 md:p-6">
      <h2 className="text-lg font-bold text-foreground">{t("deliveryReviews.panel.title")}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {t("deliveryReviews.panel.description")}
      </p>
      <form className="mt-5 space-y-4" onSubmit={(event) => void submit(event)}>
        <div>
          <Label htmlFor="delivery-pull-request-url">{t("deliveryReviews.panel.pullRequestUrl")}</Label>
          <Input
            id="delivery-pull-request-url"
            name="pullRequestUrl"
            type="url"
            dir="ltr"
            className="mt-2 font-mono"
            placeholder="https://github.com/owner/repository/pull/42"
            value={pullRequestUrl}
            disabled={submitMutation.isPending}
            aria-invalid={Boolean(validationError)}
            aria-describedby={validationError ? "delivery-url-error" : undefined}
            onChange={(event) => {
              idempotencyKey.current = null;
              setPullRequestUrl(event.target.value);
            }}
          />
          {validationError && (
            <p id="delivery-url-error" role="alert" className="mt-2 text-sm text-destructive">
              {validationError}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="delivery-contributor-notes">{t("deliveryReviews.panel.reviewerNotes")}</Label>
          <Textarea
            id="delivery-contributor-notes"
            name="contributorNotes"
            rows={4}
            maxLength={5000}
            className="mt-2 resize-y text-base"
            value={contributorNotes}
            disabled={submitMutation.isPending}
            onChange={(event) => {
              idempotencyKey.current = null;
              setContributorNotes(event.target.value);
            }}
          />
        </div>
        {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
        <Button type="submit" disabled={submitMutation.isPending}>
          <Send className="size-4" aria-hidden />
          {submitMutation.isPending ? t("deliveryReviews.panel.sending") : t("deliveryReviews.panel.submit")}
        </Button>
      </form>
    </Card>
  );
}
