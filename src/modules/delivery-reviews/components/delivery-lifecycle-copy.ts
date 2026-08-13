import type { TFunction } from "i18next";
import type { DeliveryLifecycleStatus } from "../types/delivery.types";

export function getDeliveryLifecycleCopy(t: TFunction): Record<DeliveryLifecycleStatus, string> {
  return {
    PENDING_OWNER_REVIEW: t("deliveryReviews.lifecycle.pendingOwnerReview"),
    DECLINED_BY_OWNER: t("deliveryReviews.lifecycle.declinedByOwner"),
    NOT_SELECTED: t("deliveryReviews.lifecycle.notSelected"),
    EXPIRED: t("deliveryReviews.lifecycle.expired"),
    WITHDRAWN: t("deliveryReviews.lifecycle.withdrawn"),
    REQUEST_CANCELLED: t("deliveryReviews.lifecycle.requestCancelled"),
    AWAITING_DELIVERY: t("deliveryReviews.lifecycle.awaitingDelivery"),
    DELIVERY_SUBMITTED: t("deliveryReviews.lifecycle.deliverySubmitted"),
    CHANGES_REQUESTED: t("deliveryReviews.lifecycle.changesRequested"),
    DELIVERY_REJECTED: t("deliveryReviews.lifecycle.deliveryRejected"),
    COMPLETED: t("deliveryReviews.lifecycle.completed"),
  };
}

export function formatDeliveryDate(value: string | null, locale: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
