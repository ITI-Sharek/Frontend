import { BadgeCheck, CircleAlert, Loader2, LockKeyhole } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Meter } from "@/shared/components/data-display/stat";
import { PageHeader } from "@/shared/components/layout/page-layout";
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
    <li className="flex items-start gap-2.5 text-sm leading-6">
      {included ? (
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-evidence-soft text-evidence-teal">
          <BadgeCheck className="size-3.5" aria-hidden />
        </span>
      ) : (
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-subtle-foreground">
          <LockKeyhole className="size-3" aria-hidden />
        </span>
      )}
      <span
        className={
          included
            ? "font-medium text-foreground"
            : "text-muted-foreground line-through decoration-border-strong"
        }
      >
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

  const usage = status.usage;

  return (
    <section className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-6 sm:px-6 md:py-8">
      <PageHeader
        eyebrow={t("subscriptions.title")}
        title={t("subscriptions.plan.title")}
        description={t("subscriptions.plan.description")}
      />

      {/*
       * The current plan is drawn as an issued card: an indigo band naming the
       * tier, then the entitlements it grants. Teal appears once, on the badge
       * confirming this is the plan actually in force — the same "the platform
       * checked this" meaning it carries everywhere else.
       */}
      <div className="overflow-hidden rounded-card border border-border bg-card shadow-[var(--shadow-record)]">
        <div className="relative flex items-center justify-between gap-4 bg-[linear-gradient(105deg,var(--sk-indigo-800),var(--sk-indigo-600))] px-5 py-5 sm:px-6">
          <span
            aria-hidden
            className="sk-dotgrid absolute inset-0 [--texture-ink:rgba(255,255,255,0.22)]"
          />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-white/70">
              {t("subscriptions.currentPlan")}
            </p>
            <h2 className="mt-1 text-2xl font-bold leading-tight text-white">
              {t(PLAN_LABEL_KEYS[status.plan])}
            </h2>
          </div>
          {isGold ? (
            <span className="relative inline-flex items-center gap-1.5 rounded-full bg-evidence-teal px-3 py-1.5 text-xs font-bold text-evidence-teal-foreground">
              <BadgeCheck className="size-4" aria-hidden />
              {t("subscriptions.plan.currentBadge")}
            </span>
          ) : null}
        </div>

        <div className="grid gap-6 p-5 sm:p-6">
          {/*
           * Usage is already on the payload but was never shown here, so the
           * page could not answer "how much of it have I used". A meter makes
           * the remaining allowance the first thing readable.
           */}
          {usage ? (
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {status.roleContext === "owner"
                    ? t("subscriptions.usage.ownerTitle")
                    : t("subscriptions.usage.contributorTitle")}
                </h3>
                <p className="tnum text-sm font-bold text-foreground">
                  {t("subscriptions.usage.count", {
                    used: usage.used,
                    limit: usage.limit,
                  })}
                </p>
              </div>
              <Meter
                className="mt-2.5"
                value={usage.used}
                max={usage.limit}
                tone={usage.used >= usage.limit ? "attention" : "primary"}
                label={
                  status.roleContext === "owner"
                    ? t("subscriptions.usage.ownerTitle")
                    : t("subscriptions.usage.contributorTitle")
                }
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {t("subscriptions.usage.remaining", {
                  count: Math.max(0, usage.limit - usage.used),
                })}
              </p>
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t("subscriptions.plan.whatYouHave")}
            </h3>
            {status.benefits.length > 0 ? (
              <ul className="mt-3 grid gap-2.5">
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
            <p className="border-t border-border pt-4 text-xs text-subtle-foreground">
              {status.roleContext === "owner"
                ? t("subscriptions.usage.ownerRenews", { date: renewsAt })
                : t("subscriptions.usage.contributorRenews", { date: renewsAt })}
            </p>
          ) : null}
        </div>
      </div>

      {isGold ? null : (
        <Card className="grid gap-5 border-primary/25">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-primary">
                {t("subscriptions.viewPlans")}
              </p>
              <h2 className="mt-1 text-xl font-bold text-foreground">
                {t("subscriptions.plans.gold")}
              </h2>
            </div>
            <p
              className="tnum text-xl font-bold tracking-tight text-primary"
              dir="ltr"
            >
              {t("subscriptions.plan.price")}
            </p>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">
            {t("subscriptions.plan.goldDescription")}
          </p>

          {/*
            The upgrade seam. PAY-05 replaces this block with the Paymob
            hosted-checkout entry point; until the backend can start a checkout
            there is nothing honest to put behind a button, so the page says so
            rather than rendering one that does nothing.
          */}
          <div
            className="sk-hatch rounded-input border border-dashed border-border-strong p-4 text-sm leading-6 text-muted-foreground"
            role="note"
          >
            {t("subscriptions.plan.checkoutPending")}
          </div>
        </Card>
      )}
    </section>
  );
}
