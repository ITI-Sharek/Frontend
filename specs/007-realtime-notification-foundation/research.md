# Research: Realtime Notification Foundation

## Decision 1: TanStack Query is the only client authority for Notification server state

**Decision**: Use `useInfiniteQuery` for cursor pages, ordinary queries for unread count/preferences, and mutations with targeted cache updates plus final invalidation. The provider does not keep a second Notification array.

**Rationale**: The application already uses TanStack Query for server state. Its infinite-query shape supports cursor pages and load-more state, while query invalidation provides a safer fallback than attempting to normalize every filtered page after an uncertain event.

**Alternatives considered**:

- Keep the provider array and hydrate it from HTTP: rejected because two mutable authorities would drift.
- Add Redux/Zustand: rejected because no additional client-state problem justifies another dependency.

**Primary references**:

- <https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries>
- <https://tanstack.com/query/latest/docs/reference/QueryClient>

## Decision 2: Patch only provably safe event transitions

**Decision**: A valid contiguous created/read event may patch known first-page/count caches. Duplicate/stale events are ignored. Unknown filters, missing aggregate state, version gaps, or malformed payloads invalidate relevant queries and refetch.

**Rationale**: Manual cache updates are fast when the transition is known, but filtered infinite queries are easy to corrupt. TanStack Query explicitly supports targeted invalidation as the reliable recovery mechanism.

**Alternative considered**: Fully normalize every Notification by ID and synthesize every filtered page. Rejected as unnecessary cache architecture for MVP.

## Decision 3: Subscribe to the existing token boundary with `useSyncExternalStore`

**Decision**: Add subscribe/getSnapshot/getServerSnapshot behavior around the existing storage service, with an immutable token snapshot and null server snapshot. Same-tab setters notify subscribers; the browser `storage` event covers other tabs.

**Rationale**: The root provider currently reads localStorage once and misses login/token refresh/logout. React's official external-store hook provides explicit subscription and SSR behavior without coupling Notifications to private auth components.

**Alternative considered**: Poll localStorage. Rejected because it delays security-sensitive logout/refresh behavior and wastes work.

**Primary reference**: <https://react.dev/reference/react/useSyncExternalStore>

## Decision 4: Use WebSocket-only Socket.IO transport

**Decision**: Connect `/realtime` with `transports: ["websocket"]`. HTTP remains fully functional when WebSocket is unavailable.

**Rationale**: NestJS documents that Redis does not make Socket.IO polling safe across load-balanced instances without sticky routing. WebSocket-only avoids introducing sticky-session infrastructure and matches realtime's best-effort role.

**Alternative considered**: Retain polling fallback. Rejected for this slice because its operational requirement is larger than its benefit; the product already has durable HTTP fallback.

**Primary reference**: <https://docs.nestjs.com/websockets/adapter>

## Decision 5: Keep event deduplication bounded and transient

**Decision**: Retain a bounded insertion-ordered set of recent event IDs (initial target 1,000 per tab). Server aggregate versions and HTTP state remain authoritative.

**Rationale**: Realtime is at-least-once and duplicates are normal. An unbounded set leaks memory; durable local persistence would incorrectly imply event replay authority.

**Alternatives considered**:

- No event ID tracking: rejected because duplicates could create transient badge/list errors.
- Persist IDs in localStorage/IndexedDB: rejected because reconnect reconciliation makes long-lived event history unnecessary.

## Decision 6: Validate deep links as same-origin paths

**Decision**: Accept only strings beginning with exactly one `/`, parse against the current origin, require matching origin, and reject protocol-relative/scheme-bearing values. Navigation still depends on backend authorization at the destination.

**Rationale**: Deep links are server-generated but remain data crossing a trust boundary. A narrow relative-path rule prevents open redirects and accidental external navigation.

## Decision 7: Keep browser delivery visibly deferred

**Decision**: Store/show the server's browser preference state only as disabled/unavailable explanatory UI until Slice 5. Do not register a service worker or request permission.

**Rationale**: Presenting a working toggle before a subscription/delivery path exists would create false expectations and inconsistent device state.

## Decision 8: Reconcile before declaring realtime synchronized

**Decision**: After socket connect/reconnect, refresh unread count and the visible first inbox page. Connection UI differentiates `connecting`, `synchronizing`, `connected`, `delayed`, and `unauthorized`.

**Rationale**: A connected socket says only that future live delivery is possible; it does not prove missed durable state was recovered.

**Alternative considered**: Show connected on the Socket.IO `connect` callback. Rejected because it would overstate correctness during the HTTP recovery gap.
