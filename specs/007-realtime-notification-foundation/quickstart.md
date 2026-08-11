# Quickstart: Realtime Notification Client

## Preconditions

- Backend `006-realtime-notification-foundation` is running with its migration, HTTP endpoints, and `/realtime` enabled.
- Use one member and one admin account; create retained read/unread Notifications in Arabic and English.

## 1. Durable first load

1. Block WebSocket connections but leave HTTP available.
2. Sign in and open the member shell.
3. Verify badge/count and latest popover items load from HTTP.
4. Open `/notifications`, load another cursor page, refresh, and verify retained items remain.
5. Confirm connection copy says realtime is delayed without calling the inbox empty.

## 2. Realtime and deduplication

1. Restore WebSocket and connect to `/realtime`.
2. Trigger a new Notification and verify it appears without reload.
3. Deliver the same envelope twice and verify one row and correct count.
4. Deliver a stale aggregate version and verify no rollback.
5. Deliver a version gap and verify HTTP reconciliation.

## 3. Token lifecycle

1. Load the app logged out, then sign in without a hard reload; verify one socket opens.
2. Refresh the access token; verify the old socket closes before the new one connects.
3. Log out; verify the socket closes and private Notification queries are cleared/disabled.
4. Repeat in a second tab and confirm no tab uses the old token indefinitely.

## 4. Read state

1. Merely open the popover/center; verify unread state stays unchanged.
2. Mark one item read, then unread, and confirm another tab converges.
3. Mark all read and verify cached pages plus server count converge.
4. Force a network failure and verify optimistic state rolls back.

## 5. Deep links

1. Activate an authorized relative deep link and verify the read mutation/navigation sequence.
2. Test missing, `//external`, `https://external`, malformed, and inaccessible links.
3. Verify unsafe links never execute and inaccessible targets show a non-leaking unavailable state.

## 6. Preferences and localization

1. Confirm 90-day default, quiet hours off, required categories locked, optional categories editable, and browser push unavailable.
2. Save 30/180/365-day choices and overnight `Africa/Cairo` quiet hours.
3. Simulate a revision conflict and verify refetch/review rather than overwrite.
4. Change Arabic/English through real persistence, refetch the same retained Notification, and verify backend-localized copy changes.

## 7. Accessibility and responsive matrix

- Keyboard-only popover, filters, rows, load-more, settings, and error recovery.
- Screen-reader names/live status without announcing every background refetch.
- Arabic RTL and English LTR at mobile, tablet, desktop, and 200% zoom.
- Dark theme and reduced motion.
- Long titles/bodies and generic unknown type without clipping essential action.

## Required Gates

```text
npm run lint
npx tsc --noEmit
npm test
npm run build
git diff --check
```
