# Notifications

The Notifications module owns the typed HTTP boundary and TanStack Query
authority for durable in-app notifications.

The public surface is exported from `index.ts`:

- `useNotificationListQuery` owns cursor pages for the Notification Center.
- `useLatestNotificationsQuery` loads the latest popover page.
- `useUnreadNotificationCountQuery` owns the shell badge authority.
- `useNotificationPreferencesQuery` owns server preference state.
- Read-state, mark-all, and preference mutations call the approved backend
  commands through the module service.

The cursor is a query page parameter, never part of a query key. The socket
provider is a thin cache accelerator: it observes the session token, validates
version-one envelopes, deduplicates bounded event IDs, patches only contiguous
cached state, and invalidates HTTP queries for gaps or uncertainty. TanStack
Query and the backend HTTP API remain authoritative.

When the access token is cleared, the provider calls feature-owned cache-clear
interfaces before returning to the idle state, removing retained private inbox,
preference, conversation, and Message data from the browser query cache.

The known category contract is declared once as `NOTIFICATION_TYPES`, including
`skill_profile_generation`. Retained entries with a category introduced by a
newer backend release still pass runtime validation and render with a generic
label until this client adds the category-specific label. Title and body always
come from the backend presentation DTO; the client never reconstructs semantic
copy from hidden parameters.

The shared realtime provider consumes only this module's public cache adapter
and reconciliation interface. In-app sound is best-effort and is suppressed
for ambient/read entries, optional disabled categories, and server-owned quiet
hours in the selected timezone.

## Backend dependency

The client contract is documented in
`server/specs/006-realtime-notification-foundation/contracts/http-and-realtime.md`:
the durable Notification HTTP endpoints, `PATCH /auth/me/preferences`, and the
authenticated `/realtime` Socket.IO namespace with WebSocket transport. The
client now consumes only version-one envelopes from `/realtime`; the server's
legacy `/notifications` namespace has been retired and is not used by this
provider.

Browser push/service-worker delivery is intentionally deferred; the preferences
panel presents that capability as unavailable until a later MVP slice.
