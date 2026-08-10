# Implementation Plan: Realtime Notification Foundation

**Branch**: `007-realtime-notification-foundation` | **Date**: 2026-08-08 | **Spec**: [spec.md](./spec.md)

**Input**: `specs/007-realtime-notification-foundation/spec.md`

## Summary

Replace the socket-only Notification array with a typed HTTP/TanStack Query authority and use one session-aware `/realtime` WebSocket connection only as a cache accelerator. Add durable read actions, cursor pagination, localized semantic presentation, preference UI, deduplication/gap recovery, and honest degraded states while preserving the existing member/admin shells.

## Technical Context

**Language/Version**: TypeScript 6.x, React 19.2, TanStack Start/Router/Query

**Primary Dependencies**: Existing Axios, Socket.IO client, Tailwind, lucide-react, shared UI components; no new state-management or push dependency

**Storage**: Backend-owned Notification and preference state in TanStack Query. Client stores only bounded seen-event IDs, connection status, and transient UI state.

**Testing**: Vitest services/presenters/hooks/components/providers/routes, mocked Socket.IO and Axios, multi-tab/reconnect integration fixtures, route generation, lint, exact type-check, tests, build

**Target Platform**: Responsive browser web with SSR-safe setup; current capable desktop/mobile browsers

**Project Type**: TanStack Start frontend

**Performance Goals**: p95 live presentation within two seconds; first 100 reconnect items within five seconds; no full-list refetch for a valid contiguous created event

**Constraints**: Backend-localized copy; server read authority; WebSocket-only realtime transport; no service worker/Web Push; no Notification parameters in the client contract; public routes do not expose the private Notification UI

**Scale/Scope**: Member/admin shells, one popover, two center routes, member settings plus admin preference access, pages up to 100, bounded event deduplication

## Constitution Check

- **Route composition boundary — PASS**: Existing Notification routes remain thin; settings route only selects/composes a module component.
- **TanStack routing — PASS**: Existing routes/guards and relative deep-link navigation are reused; generated route output is never hand-edited.
- **Feature ownership — PASS**: `modules/notifications` owns HTTP types/services/queries/mutations/presentation; the provider owns only app-level socket/cache coordination.
- **Module isolation — PASS**: Routes and settings import the Notifications public barrel; no lateral private imports.
- **Shared placement — PASS**: The Socket.IO wrapper and auth-token subscription remain technical under `lib`/`services`; semantic policy stays in the feature.
- **State ownership — PASS**: TanStack Query is authoritative. Context does not keep an item mirror.
- **API boundary — PASS**: Axios stays in the feature service and Socket.IO stays in the technical wrapper/provider.
- **Typing and validation — PASS**: DTO/envelope/type guards are explicit; stable error codes drive recovery.
- **Import strategy — PASS**: Alias imports and public barrels match repository practice.
- **Server/browser split — PASS**: Socket, online/focus, and storage behavior begins in client effects only; queries remain SSR-safe.
- **Validation plan — PASS**: Offline initialization, duplicate/gap/reconnect, rollback, settings, responsive/RTL/accessibility, and repo gates are planned.

## Project Structure

### Documentation

```text
specs/007-realtime-notification-foundation/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── notification-client-contract.md
└── tasks.md
```

### Source Code

```text
src/modules/notifications/
├── api/
│   ├── query-keys.ts
│   ├── queries/
│   └── mutations/
├── components/
│   ├── notification-center.tsx
│   ├── notification-popover.tsx
│   ├── notification-preferences-panel.tsx
│   └── notification-connection-status.tsx
├── services/
│   └── notifications.service.ts
├── types/
│   └── notification.types.ts
├── utils/
│   ├── notification-event-reducer.ts
│   ├── realtime-envelope.guard.ts
│   └── safe-notification-link.ts
├── index.ts
└── README.md

src/providers/notifications-provider.tsx
src/lib/socket/socket-client.ts
src/services/storage.service.ts            # session token change subscription only
src/routes/_appLayout/notifications.tsx
src/routes/_adminLayout/admin.notifications.tsx
src/routes/_appLayout/settings.tsx
src/modules/settings/index.ts
```

**Structure Decision**: Extend the implemented Notifications feature and provider. The provider becomes a thin session/socket-to-query bridge; it no longer owns item/read arrays. A small token subscription added to the existing storage boundary lets the root provider react to login, refresh, and logout without importing auth feature internals.

## Selected Design

### 1. Query authority

- `notificationKeys.list(filters)`, `.unreadCount()`, and `.preferences()` define all cache entries.
- `useInfiniteQuery` owns center pages; a small latest-page query/prefetch supports the popover.
- The provider reads unread count via a query and exposes only connection/sync state plus helpers if useful.
- Valid contiguous created events prepend/update the first matching caches and invalidate count; read events patch the item/count when safe. Unknown filters or gaps invalidate instead of guessing.

### 2. Session-aware socket lifecycle

Enhance `storageService` with an in-memory subscriber notification on set/clear plus browser `storage` event support. `useSyncExternalStore` (or an equivalent tested hook) supplies the current access token to the provider. A token change destroys the old socket before creating one new `/realtime` WebSocket connection. SSR snapshot is null.

### 3. Reconciliation

On connect/reconnect, `online`, and document visibility returning to visible, invalidate unread count and visible first-page queries. The provider calls the connection `connected` only after this reconciliation settles; otherwise it presents `delayed`. A socket is never a prerequisite for HTTP mutations.

### 4. Event safety

A runtime guard verifies envelope version, UUID-like identifiers, known event type, positive aggregate version, and a complete allowlisted Notification DTO. Keep a bounded LRU/set of recent event IDs. Compare cached aggregate versions; ignore stale/duplicate, patch contiguous, and invalidate on gaps.

### 5. Read actions and navigation

Read/unread uses optimistic cache/count changes with a snapshot rollback and final invalidation. Mark-all snapshots visible cache state, sets retained cached items read, then reconciles. A Notification action validates a relative same-origin deep link, invokes read, and navigates; invalid/missing links keep a safe disabled/unavailable affordance.

### 6. Preferences

Members get a Notifications section in `/settings`. Admin `/admin/notifications` exposes the same panel through a local tab/disclosure until an admin settings route exists. Required categories show locked controls and explanation. Browser settings remain visibly unavailable and no permission prompt runs.

## Delivery Phases

### Phase A - Typed HTTP foundation

1. Add version-1 DTOs, service methods, query keys, queries, and mutations.
2. Replace provider item state with Query authority and initial HTTP recovery.
3. Convert center/popover to loading/error/pagination/server-read behavior.

### Phase B - `/realtime` cache bridge

1. Add token lifecycle subscription and WebSocket-only wrapper.
2. Add envelope guard, event dedup/version reducer, query patch/invalidation.
3. Add reconnect/focus/online synchronization and degraded/unauthorized UI.

### Phase C - Preferences and bilingual/accessibility hardening

1. Add settings composition and reusable preferences panel.
2. Wire actual language preference persistence through the backend identity contract so server-rendered Notification copy follows selection.
3. Verify RTL/LTR, keyboard/focus, screen readers, zoom, reduced motion, mobile/desktop, and long copy.

### Phase D - Coordinated cutover

1. Enable against backend `/realtime` in test.
2. Remove `/notifications` socket wrapper and all local-only read code.
3. Run integration/performance/reconnect gates before the feature flag is enabled.

## Verification Plan

- Services: exact endpoints/query/body/wrappers and stable error codes.
- Guards/reducer: malformed, duplicate, stale, contiguous, gapped, unknown version/type, bounded ID memory.
- Provider: SSR, login after mount, token refresh, logout, one socket, reconnect, focus/online, HTTP-without-socket.
- Components: loading/empty/error/unread/all-read/fetch-more/degraded/unauthorized, deep-link safety, optimistic rollback, preferences conflicts.
- Integration: two tabs, offline commits, duplicate/out-of-order events, 100-item recovery, language change, Redis outage.
- Visual/accessibility: member/admin, Arabic/English, RTL/LTR, mobile/desktop, 200% zoom, keyboard, screen reader, reduced motion, dark theme.
- Gates: route generation, lint, exact TypeScript, focused/full Vitest, production build, diff check.

## Complexity Tracking

No constitutional violation. A bounded recent-event set is transient deduplication only; it is not a second server-state store.
