import type { QueryClient } from "@tanstack/react-query";

import { notificationKeys } from "../api/query-keys";
import type {
  NotificationPreferencesDto,
  NotificationPresentationDto,
} from "../types/notification.types";

function parseClockMinutes(value: string | null): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function localClockMinutes(now: Date, timeZone: string): number | null {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const hour = Number(parts.find((part) => part.type === "hour")?.value);
    const minute = Number(parts.find((part) => part.type === "minute")?.value);
    return Number.isInteger(hour) && Number.isInteger(minute)
      ? hour * 60 + minute
      : null;
  } catch {
    return null;
  }
}

function isWithinQuietHours(
  preferences: NotificationPreferencesDto,
  now: Date,
): boolean {
  const { quietHours } = preferences;
  if (!quietHours.enabled) return false;
  if (!quietHours.timeZone) return true;

  const start = parseClockMinutes(quietHours.startLocal);
  const end = parseClockMinutes(quietHours.endLocal);
  const current = localClockMinutes(now, quietHours.timeZone);
  if (start === null || end === null || current === null) return true;

  return start < end
    ? current >= start && current < end
    : current >= start || current < end;
}

export function shouldPlayNotificationSound(
  queryClient: QueryClient,
  notification: NotificationPresentationDto,
  now = new Date(),
): boolean {
  if (notification.isRead || notification.priority === "ambient") return false;

  const preferences = queryClient.getQueryData<NotificationPreferencesDto>(
    notificationKeys.preferences(),
  );
  if (!preferences || isWithinQuietHours(preferences, now)) return false;

  const category = preferences.categories.find(
    (candidate) => candidate.type === notification.type,
  );
  return category === undefined || category.requiredInApp || category.inAppEnabled;
}
