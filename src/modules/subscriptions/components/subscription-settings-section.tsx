import { BadgeCheck, CircleAlert, Loader2, LockKeyhole } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { formatServerInstant } from "@/shared/utils/format-server-instant";

import { useSubscriptionStatusQuery } from "../api/queries/use-subscription-query";
import type {
  SubscriptionBenefitDto,
  SubscriptionPlan,
  SubscriptionPlanStatusDto,
  SubscriptionStatus,
} from "../types/subscription.types";
import { formatBenefitLabel } from "../utils/format-benefit-label";


const PLAN_LABEL_KEYS: Record<SubscriptionPlan, string> = {
  free: "subscriptions.plans.free",
  gold: "subscriptions.plans.gold",
};

const STATUS_LABEL_KEYS: Record<SubscriptionStatus, string> = {
  active: "subscriptions.status.active",
  cancelled: "subscriptions.status.cancelled",
  expired: "subscriptions.status.expired",
};

function Benefit({ benefit }: { benefit: SubscriptionBenefitDto }) {
  const { t } = useTranslation();
  const included = benefit.state === "included";
  return (
    <li className="flex items-start gap-2 text-sm leading-6 text-foreground">
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
      <span className={included ? undefined : "text-muted-foreground"}>
        {formatBenefitLabel(benefit, t)}
      </span>
    </li>
  );
}

function UsageMeter({ status }: { status: SubscriptionPlanStatusDto }) {
  const { t, i18n } = useTranslation();
  const usage = status.usage;
  if (!usage) return null;

  const remaining = Math.max(0, usage.limit - usage.used);
  const percent =
    usage.limit > 0
      ? Math.min(100, Math.round((usage.used / usage.limit) * 100))
      : 0;
  // The window the count is measured over is a server fact, so the sentence
  // that names its end is built from the server's `periodEnd` and never from a
  // clock reading on this machine (DEC-034).
  const renewsAt = formatServerInstant(usage.periodEnd, i18n.language);
  const usageTitleKey =
    status.roleContext === "owner"
      ? "subscriptions.usage.ownerTitle"
      : "subscriptions.usage.contributorTitle";
  const renewsKey =
    status.roleContext === "owner"
      ? "subscriptions.usage.ownerRenews"
      : "subscriptions.usage.contributorRenews";

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <span id="subscription-usage-title" className="font-semibold text-foreground">
          {t(usageTitleKey)}
        </span>
        <span className="font-mono text-muted-foreground" dir="ltr">
          {t("subscriptions.usage.count", {
            used: usage.used,
            limit: usage.limit,
          })}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-labelledby="subscription-usage-title"
        aria-valuemin={0}
        aria-valuemax={usage.limit}
        aria-valuenow={usage.used}
        aria-valuetext={t("subscriptions.usage.remaining", {
          count: remaining,
        })}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
      {renewsAt ? (
        <p className="text-xs text-muted-foreground">
          {t(renewsKey, { date: renewsAt })}
        </p>
      ) : null}
    </div>
  );
}

export function SubscriptionSettingsSection() {
  const { t } = useTranslation();
  const query = useSubscriptionStatusQuery();

  if (query.isPending) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {t("subscriptions.loading")}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div role="alert" className="grid gap-3 text-sm text-muted-foreground">
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

  return (
    <section aria-labelledby="subscription-settings-title" className="grid gap-5">
      <div>
        <h2
          id="subscription-settings-title"
          className="text-lg font-bold text-foreground"
        >
          {t("subscriptions.title")}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {t("subscriptions.description")}
        </p>
      </div>

      <Card className="grid gap-5 shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              {t("subscriptions.currentPlan")}
            </p>
            <h3 className="mt-1 text-2xl font-bold text-foreground">
              {t(PLAN_LABEL_KEYS[status.plan])}
            </h3>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/[0.06] px-3 py-1 text-xs font-semibold text-primary">
            {t(STATUS_LABEL_KEYS[status.status])}
          </span>
        </div>

        {/*
          A cancelled plan keeps its benefits until the paid period ends. Saying
          so is the difference between a user thinking they have already lost
          access and knowing exactly when they will.
        */}
        {status.status === "cancelled" ? (
          <p className="rounded-input border border-border bg-surface-fog p-3 text-sm leading-6 text-muted-foreground">
            {t("subscriptions.cancelledNotice")}
          </p>
        ) : null}

        {status.usage ? (
          <UsageMeter status={status} />
        ) : (
          <p className="rounded-input border border-border bg-surface-fog p-3 text-sm leading-6 text-muted-foreground">
            {t("subscriptions.noUsage")}
          </p>
        )}

        <div className="border-t border-border pt-4">
          <h4 className="font-semibold text-foreground">
            {t("subscriptions.benefits")}
          </h4>
          {status.benefits.length > 0 ? (
            <ul className="mt-3 grid gap-2">
              {status.benefits.map((benefit) => (
                <Benefit key={benefit.key} benefit={benefit} />
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t("subscriptions.noBenefits")}
            </p>
          )}
        </div>

        {!isGold && (
          <div className="grid gap-2 border-t border-border pt-4">
            <Button asChild className="w-fit">
              <Link to={ROUTES.plan}>{t("subscriptions.viewPlans")}</Link>
            </Button>
          </div>
        )}
      </Card>
    </section>
  );
}
