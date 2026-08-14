import { BadgeCheck, CircleAlert, Loader2, LockKeyhole } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { formatServerInstant } from "@/shared/utils/format-server-instant";

import { useSubscriptionStatusQuery } from "../api/queries/use-subscription-query";
import type {
  SubscriptionBenefitDto,
  SubscriptionPlan,
} from "../types/subscription.types";


const PLAN_LABEL_KEYS: Record<SubscriptionPlan, string> = {
  free: "subscriptions.plans.free",
  gold: "subscriptions.plans.gold",
};

function BenefitRow({ benefit }: { benefit: SubscriptionBenefitDto }) {
  const included = benefit.state === "included";
  return (
    <li className="flex items-start gap-2 text-sm leading-6">
      {included ? (
        <BadgeCheck
          className="mt-1 size-4 shrink-0 text-evidence-teal"
          aria-hidden
        />
      ) : (
        <LockKeyhole
          className="mt-1 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      )}
      <span className={included ? "text-foreground" : "text-muted-foreground"}>
        {benefit.label}
      </span>
    </li>
  );
}

/**
 * The plan page.
 *
 * Every upgrade call to action in the product lands here, so it has to answer
 * one question honestly: what do I have, what would I get, and what does it
 * cost.
 *
 * What it shows is deliberately split by who owns the fact:
 *
 * - **What the reader currently has** is server-authored, read from
 *   `GET /me/subscription`. Plan, status, usage and benefit labels all come
 *   from the backend, so a limit that changes there changes here with no
 *   frontend release.
 * - **The price** is product copy (DEC-077), carried in the translation files.
 *   It is a published, stable number rather than reconstructed plan policy —
 *   the thing the server-authored-benefits rule forbids is the UI deriving
 *   *limits* from a plan name, which nothing here does. When PAY-02's plan
 *   catalog ships, this string should be replaced by the served price.
 *
 * There is no purchase affordance that does not work. Checkout arrives with
 * PAY-05; until then this page says so plainly instead of showing a dead
 * button.
 */
export function PlanPageView() {
  const { t, i18n } = useTranslation();
  const query = useSubscriptionStatusQuery();

  if (query.isPending) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 p-6 text-sm text-muted-foreground"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {t("subscriptions.loading")}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div role="alert" className="grid gap-3 p-6 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CircleAlert className="size-4" aria-hidden />
          {t("subscriptions.loadError")}
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => void query.refetch()}
        >
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  const status = query.data;
  const isGold = status.plan === "gold";
  const renewsAt = formatServerInstant(status.usage?.periodEnd, i18n.language);

  return (
    <section className="mx-auto grid w-full max-w-3xl gap-6 p-4 sm:p-6">
      <header className="grid gap-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t("subscriptions.plan.title")}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("subscriptions.plan.description")}
        </p>
      </header>

      <Card className="grid gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              {t("subscriptions.currentPlan")}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              {t(PLAN_LABEL_KEYS[status.plan])}
            </h2>
          </div>
          {isGold ? (
            <span className="rounded-full border border-evidence-teal/30 bg-evidence-teal/[0.08] px-3 py-1 text-xs font-semibold text-evidence-teal">
              {t("subscriptions.plan.currentBadge")}
            </span>
          ) : null}
        </div>

        <div>
          <h3 className="font-semibold text-foreground">
            {t("subscriptions.plan.whatYouHave")}
          </h3>
          {status.benefits.length > 0 ? (
            <ul className="mt-3 grid gap-2">
              {status.benefits.map((benefit) => (
                <BenefitRow key={benefit.key} benefit={benefit} />
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t("subscriptions.noBenefits")}
            </p>
          )}
        </div>

        {renewsAt ? (
          <p className="text-xs text-muted-foreground">
            {status.roleContext === "owner"
              ? t("subscriptions.usage.ownerRenews", { date: renewsAt })
              : t("subscriptions.usage.contributorRenews", { date: renewsAt })}
          </p>
        ) : null}
      </Card>

      {isGold ? null : (
        <Card className="grid gap-5 border-primary/30">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold text-foreground">
              {t("subscriptions.plans.gold")}
            </h2>
            <p className="font-mono text-lg font-bold text-primary" dir="ltr">
              {t("subscriptions.plan.price")}
            </p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            {t("subscriptions.plan.goldDescription")}
          </p>

          {/*
            The upgrade seam. PAY-05 replaces this block with the Paymob
            hosted-checkout entry point; until the backend can start a checkout
            there is nothing honest to put behind a button, so the page says so
            rather than rendering one that does nothing.
          */}
          <div
            className="rounded-input border border-dashed border-border bg-surface-fog p-4 text-sm leading-6 text-muted-foreground"
            role="note"
          >
            {t("subscriptions.plan.checkoutPending")}
          </div>
        </Card>
      )}
    </section>
  );
}
