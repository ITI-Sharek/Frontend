import { useTranslation } from "react-i18next";

/** Settings → "Subscription": mock plan + usage, per DEC-026. */
export function SubscriptionSettingsSection() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          {t("settings.subscription.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.subscription.description")}
        </p>
      </div>

      <div className="rounded-input border border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-foreground">Bronze</span>
          <span className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
            {t("settings.subscription.requestsToday", { used: 1, total: 2 })}
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/2 rounded-full bg-primary" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {t("settings.subscription.upgradeDisabled")}
      </p>
    </div>
  );
}
