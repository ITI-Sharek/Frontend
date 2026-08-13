import { describe, expect, it } from "vitest";

import {
  normalizeNotificationFilters,
  notificationKeys,
} from "./query-keys";

describe("notification query keys", () => {
  it("normalizes filters with a stable default page size", () => {
    expect(normalizeNotificationFilters()).toEqual({ limit: 20 });
    expect(
      normalizeNotificationFilters({
        type: "application_status",
        readState: "unread",
        limit: 50,
      }),
    ).toEqual({
      limit: 50,
      readState: "unread",
      type: "application_status",
    });
  });

  it("keeps cursor out of the list key", () => {
    const filters = normalizeNotificationFilters({ readState: "unread" });

    expect(notificationKeys.list(filters)).toEqual([
      "notifications",
      "list",
      { limit: 20, readState: "unread" },
    ]);
    expect(notificationKeys.list(filters)).toEqual(
      notificationKeys.list({ ...filters }),
    );
    expect(notificationKeys.unreadCount()).toEqual([
      "notifications",
      "unread-count",
    ]);
  });
});
