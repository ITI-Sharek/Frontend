import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { formatServerResetInstant } from "@/shared/utils/format-server-instant";

import { useSubscriptionStatusQuery } from "../api/queries/use-subscription-query";

/**
 * How many Applications a contributor has left today, shown **before** they
 * start writing one.
 *
 * A contributor who discovers their allowance only from a rejected submit has
 * already spent the effort of filling in the form. That is the whole point of
 * this component existing next to the form rather than only inside its error
 * state.
 *
 * It renders nothing at all for an owner, or while the status is still loading,
 * or if the status request fails: a missing count is a strictly better outcome
 * than a wrong one, and the submit itself is still authoritative either way.
 */
export function DailyApplicationQuotaNotice() {
  const { t, i18n } = useTranslation();
  const query = useSubscriptionStatusQuery();

  const status = query.data;
  if (!status || status.roleContext !== "contributor" || !status.usage) {
    return null;
  }

  const { used, limit, periodEnd } = status.usage;
  const remaining = Math.max(0, limit - used);
  const exhausted = remaining === 0;
  // The instant the allowance refills is the server's to state, so it is
  // formatted from `periodEnd` and never derived from this machine's clock
  // (DEC-034).
  const resetsAt = formatServerResetInstant(periodEnd, i18n.language);

  return (
    <div
      // Polite rather than assertive: the count changing is useful context, not
      // an interruption worth cutting across whatever the user is typing.
      role="status"
      aria-live="polite"
      className={
        exhausted
          ? "grid gap-2 rounded-input border border-border bg-surface-fog p-3"
          : "rounded-input border border-border bg-surface-fog p-3"
      }
    >
      <p className="text-sm leading-6 text-foreground">
        {exhausted
          ? t("subscriptions.dailyQuota.none")
          : t("subscriptions.dailyQuota.remaining", {
              count: remaining,
              limit,
            })}
      </p>
      {exhausted && resetsAt ? (
        <p className="text-xs leading-5 text-muted-foreground">
          {t("subscriptions.dailyQuota.resetsAt", { date: resetsAt })}
        </p>
      ) : null}
      {exhausted && status.plan !== "gold" ? (
        <p className="text-xs leading-5 text-muted-foreground">
          {/*
            Offered, never imposed: the sentence states what Gold changes and
            links to the plan page. It does not tell the contributor they were
            wrong to run out, and it never blocks the form — the submit button
            stays live, because the server is the authority on whether a
            particular Application is allowed.
          */}
          <Link
            to={ROUTES.plan}
            className="font-semibold text-primary hover:underline"
          >
            {t("subscriptions.dailyQuota.upgradeLink")}
          </Link>{" "}
          {t("subscriptions.dailyQuota.upgradeHint")}
        </p>
      ) : null}
    </div>
  );
}
