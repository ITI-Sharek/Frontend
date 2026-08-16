import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";

import {
  useUpdateNotificationPreferencesMutation,
} from "../api/mutations/use-notification-mutations";
import { useNotificationPreferencesQuery } from "../api/queries/use-notification-queries";
import type {
  NotificationCategoryPreferenceDto,
  NotificationPreferencesDto,
  NotificationType,
} from "../types/notification.types";
import { getNotificationTypeLabel } from "./notification-presenter";

const RETENTION_OPTIONS = [30, 90, 180, 365] as const;

interface PreferencesForm {
  retentionDays: NotificationPreferencesDto["retentionDays"];
  quietHours: {
    enabled: boolean;
    startLocal: string;
    endLocal: string;
    timeZone: string;
  };
  categories: NotificationCategoryPreferenceDto[];
}

function getTimeZones(): string[] {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone");
  }
  return ["UTC", "Africa/Cairo", "Europe/London", "America/New_York"];
}

function toForm(preferences: NotificationPreferencesDto): PreferencesForm {
  const browserTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  return {
    retentionDays: preferences.retentionDays,
    quietHours: {
      enabled: preferences.quietHours.enabled,
      startLocal: preferences.quietHours.startLocal ?? "22:00",
      endLocal: preferences.quietHours.endLocal ?? "06:00",
      timeZone: preferences.quietHours.timeZone ?? browserTimeZone,
    },
    categories: preferences.categories.map((category) => ({ ...category })),
  };
}

function getCategoryPatch(category: NotificationCategoryPreferenceDto) {
  return {
    type: category.type,
    inAppEnabled: category.requiredInApp || category.inAppEnabled,
    browserEnabled: false,
  };
}

export function NotificationPreferencesPanel() {
  const { t } = useTranslation();
  const preferencesQuery = useNotificationPreferencesQuery();
  const updateMutation = useUpdateNotificationPreferencesMutation();
  const [form, setForm] = useState<PreferencesForm | null>(null);
  const [status, setStatus] = useState<"idle" | "saved" | "conflict" | "error">(
    "idle",
  );
  const timeZones = useMemo(getTimeZones, []);

  useEffect(() => {
    if (preferencesQuery.data) {
      setForm(toForm(preferencesQuery.data));
      setStatus("idle");
    }
  }, [preferencesQuery.data]);

  if (preferencesQuery.isLoading || !form) {
    return (
      <div role="status" className="text-sm text-muted-foreground">
        {t("notifications.preferences.loading")}
      </div>
    );
  }

  if (preferencesQuery.isError) {
    return (
      <div role="alert" className="grid gap-3 text-sm text-muted-foreground">
        <span>{t("notifications.preferences.loadError")}</span>
        <Button type="button" variant="outline" onClick={() => void preferencesQuery.refetch()}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  function updateCategory(type: NotificationType, inAppEnabled: boolean) {
    setForm((current) =>
      current
        ? {
            ...current,
            categories: current.categories.map((category) =>
              category.type === type && !category.requiredInApp
                ? { ...category, inAppEnabled }
                : category,
            ),
          }
        : current,
    );
  }

  function save() {
    const currentPreferences = preferencesQuery.data;
    const currentForm = form;
    if (!currentPreferences || !currentForm) return;
    setStatus("idle");
    updateMutation.mutate(
      {
        expectedRevision: currentPreferences.revision,
        retentionDays: currentForm.retentionDays,
        quietHours: {
          enabled: currentForm.quietHours.enabled,
          startLocal: currentForm.quietHours.enabled
            ? currentForm.quietHours.startLocal
            : null,
          endLocal: currentForm.quietHours.enabled
            ? currentForm.quietHours.endLocal
            : null,
          timeZone: currentForm.quietHours.enabled
            ? currentForm.quietHours.timeZone
            : null,
        },
        categories: currentForm.categories.map(getCategoryPatch),
      },
      {
        onSuccess: (updatedPreferences) => {
          setForm(toForm(updatedPreferences));
          setStatus("saved");
        },
        onError: (error) => {
          if (
            getApiErrorCode(error) ===
            "NOTIFICATION_PREFERENCES_REVISION_CONFLICT"
          ) {
            setForm(toForm(currentPreferences));
            setStatus("conflict");
            void preferencesQuery.refetch();
            return;
          }
          setForm(toForm(currentPreferences));
          setStatus("error");
        },
      },
    );
  }

  return (
    <section aria-labelledby="notification-preferences-title" className="grid gap-6">
      <div>
        <h2 id="notification-preferences-title" className="text-lg font-bold text-foreground">
          {t("notifications.preferences.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("notifications.preferences.description")}
        </p>
      </div>

      <label className="grid max-w-sm gap-2 text-sm font-semibold text-foreground">
        {t("notifications.preferences.retention")}
        <NativeSelect
          name="notification-retention"
          size="sm"
          value={form.retentionDays}
          onChange={(event) =>
            setForm({
              ...form,
              retentionDays: Number(event.target.value) as PreferencesForm["retentionDays"],
            })
          }
          className="font-normal"
        >
          {RETENTION_OPTIONS.map((days) => (
            <NativeSelectOption key={days} value={days}>
              {t("notifications.preferences.days", { count: days })}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>

      <fieldset className="grid gap-3 rounded-input border border-border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">{t("notifications.preferences.quietHours")}</legend>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            name="notification-quiet-hours-enabled"
            data-notification-setting="quiet-hours"
            checked={form.quietHours.enabled}
            onCheckedChange={(checked) =>
              setForm({
                ...form,
                quietHours: { ...form.quietHours, enabled: checked === true },
              })
            }
          />
          {t("notifications.preferences.enableQuietHours")}
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-xs text-muted-foreground">
            {t("notifications.preferences.start")}
            <Input
              type="time"
              name="notification-quiet-hours-start"
              value={form.quietHours.startLocal}
              disabled={!form.quietHours.enabled}
              onChange={(event) =>
                setForm({
                  ...form,
                  quietHours: { ...form.quietHours, startLocal: event.target.value },
                })
              }
            />
          </label>
          <label className="grid gap-1 text-xs text-muted-foreground">
            {t("notifications.preferences.end")}
            <Input
              type="time"
              name="notification-quiet-hours-end"
              value={form.quietHours.endLocal}
              disabled={!form.quietHours.enabled}
              onChange={(event) =>
                setForm({
                  ...form,
                  quietHours: { ...form.quietHours, endLocal: event.target.value },
                })
              }
            />
          </label>
          <label className="grid gap-1 text-xs text-muted-foreground">
            {t("notifications.preferences.timeZone")}
            <NativeSelect
              name="notification-quiet-hours-timezone"
              value={form.quietHours.timeZone}
              disabled={!form.quietHours.enabled}
              onChange={(event) =>
                setForm({
                  ...form,
                  quietHours: { ...form.quietHours, timeZone: event.target.value },
                })
              }
            >
              {[form.quietHours.timeZone, ...timeZones]
                .filter((zone, index, values) => zone && values.indexOf(zone) === index)
                .map((zone) => (
                  <NativeSelectOption key={zone} value={zone}>
                    {zone}
                  </NativeSelectOption>
                ))}
            </NativeSelect>
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("notifications.preferences.quietHoursHelp")}
        </p>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold text-foreground">{t("notifications.preferences.categories")}</legend>
        {form.categories.map((category) => (
          <div
            key={category.type}
            className="flex flex-wrap items-center justify-between gap-3 rounded-input border border-border p-3"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                {getNotificationTypeLabel(t, category.type)}
              </p>
              {category.requiredInApp && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("notifications.preferences.required")}
                </p>
              )}
            </div>
            <Checkbox
              name={`notification-category-${category.type}`}
              data-notification-category={category.type}
              checked={category.requiredInApp || category.inAppEnabled}
              disabled={category.requiredInApp}
              onCheckedChange={(checked) =>
                updateCategory(category.type, checked === true)
              }
            />
          </div>
        ))}
      </fieldset>

      <div className="grid gap-2 rounded-input border border-border p-4">
        <p className="text-sm font-semibold text-foreground">{t("notifications.preferences.browserTitle")}</p>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox disabled checked={false} aria-readonly="true" />
          {t("notifications.preferences.browserLater")}
        </label>
        <p className="text-xs text-muted-foreground">
          {t("notifications.preferences.browserHelp")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" disabled={updateMutation.isPending} onClick={save}>
          {updateMutation.isPending ? t("common.saving") : t("notifications.preferences.save")}
        </Button>
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {status === "saved" && t("notifications.preferences.saved")}
          {status === "conflict" && t("notifications.preferences.conflict")}
          {status === "error" && t("notifications.preferences.saveError")}
        </p>
      </div>
    </section>
  );
}
