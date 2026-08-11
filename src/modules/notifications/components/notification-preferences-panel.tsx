import { useEffect, useMemo, useState } from "react";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

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
        جارٍ تحميل تفضيلات الإشعارات…
      </div>
    );
  }

  if (preferencesQuery.isError) {
    return (
      <div role="alert" className="grid gap-3 text-sm text-muted-foreground">
        <span>تعذّر تحميل تفضيلات الإشعارات.</span>
        <Button type="button" variant="outline" onClick={() => void preferencesQuery.refetch()}>
          إعادة المحاولة
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
          تفضيلات الإشعارات
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          تحكم في مدة الاحتفاظ والتنبيهات الاختيارية وساعات الهدوء.
        </p>
      </div>

      <label className="grid max-w-sm gap-2 text-sm font-semibold text-foreground">
        مدة الاحتفاظ
        <select
          name="notification-retention"
          value={form.retentionDays}
          onChange={(event) =>
            setForm({
              ...form,
              retentionDays: Number(event.target.value) as PreferencesForm["retentionDays"],
            })
          }
          className="min-h-11 rounded-input border border-border bg-input-bg px-3 text-sm font-normal text-foreground"
        >
          {RETENTION_OPTIONS.map((days) => (
            <option key={days} value={days}>
              {days} يومًا
            </option>
          ))}
        </select>
      </label>

      <fieldset className="grid gap-3 rounded-input border border-border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">ساعات الهدوء</legend>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="notification-quiet-hours-enabled"
            checked={form.quietHours.enabled}
            onChange={(event) =>
              setForm({
                ...form,
                quietHours: { ...form.quietHours, enabled: event.target.checked },
              })
            }
            className="size-4 accent-primary"
          />
          تفعيل ساعات الهدوء
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-xs text-muted-foreground">
            البداية
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
            النهاية
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
            المنطقة الزمنية
            <select
              name="notification-quiet-hours-timezone"
              value={form.quietHours.timeZone}
              disabled={!form.quietHours.enabled}
              onChange={(event) =>
                setForm({
                  ...form,
                  quietHours: { ...form.quietHours, timeZone: event.target.value },
                })
              }
              className="min-h-[50px] rounded-input border border-border bg-input-bg px-3 text-sm text-foreground"
            >
              {[form.quietHours.timeZone, ...timeZones]
                .filter((zone, index, values) => zone && values.indexOf(zone) === index)
                .map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          يمكن أن تمتد الساعات عبر منتصف الليل، مثل 22:00 إلى 06:00.
        </p>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold text-foreground">فئات التنبيه داخل التطبيق</legend>
        {form.categories.map((category) => (
          <div
            key={category.type}
            className="flex flex-wrap items-center justify-between gap-3 rounded-input border border-border p-3"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                {getNotificationTypeLabel(category.type)}
              </p>
              {category.requiredInApp && (
                <p className="mt-1 text-xs text-muted-foreground">
                  لا يمكن تعطيل التنبيهات الأساسية.
                </p>
              )}
            </div>
            <input
              type="checkbox"
              name={`notification-category-${category.type}`}
              checked={category.requiredInApp || category.inAppEnabled}
              disabled={category.requiredInApp}
              onChange={(event) => updateCategory(category.type, event.target.checked)}
              className="size-4 accent-primary"
            />
          </div>
        ))}
      </fieldset>

      <div className="grid gap-2 rounded-input border border-border p-4">
        <p className="text-sm font-semibold text-foreground">إشعارات المتصفح</p>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" disabled checked={false} readOnly className="size-4" />
          متاحة في شريحة لاحقة
        </label>
        <p className="text-xs text-muted-foreground">
          لن نطلب إذن المتصفح أو نسجل Service Worker في هذه المرحلة.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" disabled={updateMutation.isPending} onClick={save}>
          {updateMutation.isPending ? "جارٍ الحفظ…" : "حفظ تفضيلات الإشعارات"}
        </Button>
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {status === "saved" && "تم حفظ التفضيلات."}
          {status === "conflict" && "تغيّرت التفضيلات في جلسة أخرى؛ تم تحديث النموذج."}
          {status === "error" && "تعذّر الحفظ؛ تمت استعادة آخر إعدادات محفوظة."}
        </p>
      </div>
    </section>
  );
}
