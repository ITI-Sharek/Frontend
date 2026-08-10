# Client Contract: Notification HTTP and Realtime

This file mirrors the backend version-1 contract for frontend implementation. The backend contract is authoritative if a discrepancy is found.

## HTTP Service Methods

```ts
listNotifications(input: {
  cursor?: string;
  limit?: number;
  readState?: "read" | "unread";
  type?: NotificationType;
}): Promise<NotificationPageDto>

getUnreadNotificationCount(): Promise<{ unreadCount: number }>

setNotificationReadState(
  notificationId: string,
  state: "read" | "unread",
): Promise<NotificationPresentationDto>

markAllNotificationsRead(): Promise<{
  updatedCount: number;
  snapshotAt: string;
}>

getNotificationPreferences(): Promise<NotificationPreferencesDto>

updateNotificationPreferences(
  patch: UpdateNotificationPreferencesDto,
): Promise<NotificationPreferencesDto>

updateCurrentUserPreferences(input: {
  preferredLanguage: "ar" | "en";
}): Promise<AuthUserDto>
```

Exact routes:

```text
GET   /notifications
GET   /notifications/unread-count
PATCH /notifications/:notificationId/read-state
POST  /notifications/mark-all-read
GET   /me/notification-preferences
PATCH /me/notification-preferences
PATCH /auth/me/preferences
```

## Query Keys

```ts
const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => ["notifications", "list"] as const,
  list: (filters: NormalizedNotificationFilters) =>
    ["notifications", "list", filters] as const,
  unreadCount: () => ["notifications", "unread-count"] as const,
  preferences: () => ["notifications", "preferences"] as const,
};
```

The cursor is an infinite-query `pageParam`, not part of the list key.

## Realtime Client

The coordinated cutover is complete. The client uses the authenticated
`/realtime` namespace with WebSocket transport and consumes only complete
version-1 envelopes. The server's legacy `/notifications` namespace is retired;
there is no client fallback to its payload shape.

```ts
io(`${API_BASE_URL}/realtime`, {
  auth: { token: accessToken },
  transports: ["websocket"],
  autoConnect: false,
});
```

Listen for:

```text
connect
disconnect
connect_error
realtime.error
notification.created
notification.read_state_changed
```

Every domain event carries the complete version-1 envelope documented in `data-model.md`.

## Error Handling

| Stable code | Client behavior |
|---|---|
| `REALTIME_UNAUTHORIZED` | Set unauthorized; invoke existing auth refresh/logout recovery; do not loop-connect with the same token |
| `NOTIFICATION_NOT_FOUND` | Remove/invalidate stale item; show safe unavailable if the user intentionally opened it |
| `NOTIFICATION_CURSOR_INVALID` | Reset to first page and show recoverable list error |
| `NOTIFICATION_REQUIRED_CATEGORY` | Keep required toggle on and announce why |
| `NOTIFICATION_PREFERENCES_REVISION_CONFLICT` | Refetch preferences and show conflict review state |
| Other/network | Roll back optimistic mutation, show generic localized recovery, invalidate authority |

No client behavior branches on `message`.

## Deep-Link Contract

A link is navigable only when:

1. it begins with `/` but not `//`;
2. resolving it against `window.location.origin` preserves that origin;
3. it contains no username/password component;
4. navigation uses TanStack Router when the path is recognized, otherwise same-origin browser navigation may reach the app's safe not-found/unavailable handling.

The read mutation occurs because the user intentionally activates the item, not because it rendered. Mutation failure does not authorize or block navigation; target authorization remains server-owned.

## Preference UI Contract

- Retention values are exactly 30, 90, 180, 365.
- Quiet hours are off by default; enabling requires start, end, and an IANA timezone selected from the browser-supported list/fallback.
- Required category controls are non-editable and explained.
- Browser controls remain disabled with “Available in a later MVP slice” and never request permission in Slice 1.

## Current-user Language Contract

Language remains part of the identity session, not Notification preferences. `PATCH /auth/me/preferences` accepts exactly `{ preferredLanguage: "ar" | "en" }` for the authenticated user and returns the existing public auth-user DTO.

On success, the client updates its authenticated-user cache and invalidates Notification list/latest queries so retained semantic Notifications are rendered in the new language. On failure, the settings UI restores its previous selection and shows the stable backend error.
