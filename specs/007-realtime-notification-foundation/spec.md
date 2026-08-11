# Feature Specification: Realtime Notification Foundation

**Feature Branch**: `007-realtime-notification-foundation`

**Created**: 2026-08-08

**Status**: Ready for implementation planning

**Input**: Sprint 9 Slice 1 and backlog TASK-9-03.

**Traceability**: TASK-9-03; DEC-044, DEC-052, DEC-054–057, DEC-064, DEC-068–070, DEC-072/073/075; ADR 0007, 0010, 0012, 0013; backend `specs/006-realtime-notification-foundation/`.

## Source Classification

- **Current behavior**: One root `NotificationsProvider` opens `/notifications`, retains only up to 50 socket-delivered entries in React state, computes unread count locally, and marks read/all-read only in memory. There is no inbox API service/query, initial recovery, durable read mutation, preference UI, deep-link action, event envelope/gap handling, or session-token lifecycle restart. Both member/admin pages render the same Arabic-only client state.
- **Approved target behavior**: TanStack Query owns server Notification data from durable HTTP; one authenticated WebSocket-only `/realtime` connection accelerates committed changes. The client deduplicates events, reconciles gaps/reconnect/focus through HTTP, uses backend-localized presentation, persists intentional read actions, and provides notification settings without making browser delivery appear implemented.
- **Assumptions**: The backend contract in `contracts/notification-client-contract.md` lands before enabling this feature. Existing member/admin shells, Axios interceptors, query client, and accessible UI primitives are reused. Browser Push remains Slice 5.
- **Unresolved decisions**: None. The client must not infer missing backend behavior or retain the old socket state as authority.

## User Scenarios & Testing

### User Story 1 - Open a complete durable inbox (Priority: P1)

As any authenticated user, I want the popover and full Notification Center to show retained server data immediately so that I can catch up after being offline.

**Independent Test**: Seed more than one page of mixed read/unread Notifications, load with the socket unavailable, and verify the first page, unread badge, filters, pagination, empty/error states, and authorized deep links work through HTTP.

**Acceptance Scenarios**:

1. **Given** retained Notifications and no active socket, **When** the authenticated shell mounts, **Then** the unread count and latest page load from HTTP.
2. **Given** more items than one page, **When** the user requests more, **Then** the opaque cursor appends stable non-duplicated items.
3. **Given** a target is unavailable or unauthorized, **When** its deep link is opened, **Then** the item is intentionally marked read and the destination presents a safe unavailable state.

### User Story 2 - Receive and reconcile live changes (Priority: P1)

As a signed-in user, I want committed Notifications to update promptly across tabs without trusting the socket as history.

**Independent Test**: Connect two tabs, deliver duplicate/out-of-order/gapped events, disconnect one tab, commit additional state, reconnect, and verify both tabs converge to the HTTP authority.

**Acceptance Scenarios**:

1. **Given** a valid `notification.created` envelope, **When** it arrives, **Then** the cache and badge update without a full page reload.
2. **Given** the same `eventId` again, **When** it arrives, **Then** no duplicate row/count is introduced.
3. **Given** a higher aggregate version with a gap, **When** it arrives, **Then** affected Notification queries/count are invalidated and refetched rather than guessed.
4. **Given** a socket cannot connect, **When** HTTP remains available, **Then** the UI says realtime is delayed while inbox/read actions continue.

### User Story 3 - Manage intentional read state (Priority: P1)

As a user, I want read/unread/all-read actions saved on the server so that every device shows the same attention state.

**Independent Test**: Mark one item read/unread and mark all read using mocked successful/conflicting/failing HTTP responses; verify optimistic presentation rolls back on failure and remote events converge state.

**Acceptance Scenarios**:

1. **Given** an unread item, **When** its action/deep link is intentionally opened or `Mark read` is chosen, **Then** the server mutation runs and the cache updates.
2. **Given** a visible row or toast only, **When** no intentional action occurs, **Then** it remains unread.
3. **Given** a failed mutation, **When** the server rejects it, **Then** the optimistic state rolls back and a stable recoverable message appears.

### User Story 4 - Configure Notification preferences (Priority: P1)

As a user, I want to choose retention, optional categories, and quiet hours while understanding which important in-app alerts cannot be disabled.

**Independent Test**: Load defaults, change 90 to another approved retention, configure overnight quiet hours, toggle an optional category, and verify required categories are visibly locked and browser controls are labeled unavailable until Slice 5.

**Acceptance Scenarios**:

1. **Given** the default preference, **When** settings load, **Then** 90-day retention, quiet hours off, required categories on, and browser delivery off are shown.
2. **Given** an optional category, **When** it is disabled and saved, **Then** the updated server revision is displayed across views.
3. **Given** a required category, **When** it is shown, **Then** its in-app control is enabled and non-editable with an explanation.
4. **Given** browser push is not released, **When** settings render, **Then** the UI does not request permission or imply closed-tab delivery exists.

### Edge Cases

- Access token appears, refreshes, clears, or changes after the root provider mounted.
- SSR renders without `window`, `localStorage`, Socket.IO, or browser timezone.
- The first HTTP query fails while socket events arrive, or a socket event arrives during pagination.
- A Notification is purged between page fetches or read mutation.
- Two tabs perform opposing read mutations.
- Backend returns an unknown Notification type/template or a missing deep link.
- Connection oscillates, Redis is degraded, the browser is offline, or WebSocket is blocked.
- Arabic/English text, long titles, 200% zoom, narrow screens, RTL/LTR, reduced motion, and screen readers.

## Requirements

### Functional Requirements

- **FR-001**: Notification list, count, read state, and preferences MUST use typed service/query/mutation boundaries over the approved HTTP API.
- **FR-002**: TanStack Query MUST own server Notification state; React context MAY expose composition helpers/status but MUST NOT maintain a second authoritative item array.
- **FR-003**: Shell badges MUST initialize from `GET /notifications/unread-count`, not from events observed since mount.
- **FR-004**: The full center MUST use opaque cursor pagination and share cached items with the popover without duplicating transport logic.
- **FR-005**: One client-side Socket.IO connection MUST use `/realtime` with WebSocket transport while an authenticated session exists.
- **FR-006**: Token creation/change/logout MUST connect, replace, or disconnect the socket without requiring a hard reload.
- **FR-007**: The client MUST validate/version the realtime envelope, deduplicate by `eventId`, compare per-aggregate versions, and reconcile unknown/gapped state through HTTP.
- **FR-008**: Reconnect, browser focus, and transition from offline to online MUST refetch count and the visible first page before presenting synchronized status.
- **FR-009**: Passive popover/center/toast rendering MUST NOT mark an item read.
- **FR-010**: Explicit read/unread/all-read actions MUST call the server and use reversible optimistic updates or authoritative invalidation.
- **FR-011**: Opening a Notification action MUST mark it read intentionally and navigate only to the backend-provided same-origin deep link; absent/unsafe links are not executed.
- **FR-012**: The client MUST render backend-provided localized title/body and MUST NOT reconstruct semantic copy from parameters or translate user content.
- **FR-013**: Unknown type/template presentation MUST use a generic icon/label without crashing or exposing raw payload.
- **FR-014**: The Notification Center MUST present loading, empty, unread, all-read, fetching-more, error, realtime-connecting, connected, delayed/degraded, unauthorized, and target-unavailable behavior.
- **FR-015**: Notification preferences MUST support 30/90/180/365-day retention, optional categories, required-category explanation, disabled-by-default quiet hours/timezone, and revision-conflict refresh.
- **FR-016**: Member settings MUST add a Notifications section; admins MUST reach the same preference panel from their Notification Center until an admin settings route exists.
- **FR-017**: Slice 1 MUST NOT register a service worker, request browser permission, implement push subscriptions, display Message/call UI, or claim guaranteed realtime delivery.
- **FR-018**: The old `/notifications` client and local-only read mutations MUST be removed during coordinated cutover; no permanent dual provider remains.

### Trust, Safety, and Accessibility Requirements

- **TS-001**: Route guards remain UX only; the client never assumes a Notification ID/deep link is authorized because it was cached.
- **TS-002**: The client MUST ignore envelopes with malformed IDs/types/versions/payloads and refetch rather than rendering untrusted shapes.
- **TS-003**: Deep links MUST be relative same-origin paths; schemes, protocol-relative URLs, and malformed paths are rejected.
- **TS-004**: Error behavior MUST branch on stable backend codes, never localized message text.
- **TS-005**: No Notification body, parameter payload, token, or private target detail enters client logs/telemetry.
- **TS-006**: All controls and status changes MUST be keyboard accessible, visibly focused, announced appropriately, non-color-only, responsive, reduced-motion safe, and correct in Arabic RTL/English LTR.

### Key Entities

- **Notification Presentation**: Localized allowlisted server DTO rendered in center/popover.
- **Notification Page**: Cursor page cached by filters.
- **Unread Count**: Separate server query synchronized after commands/events.
- **Realtime Envelope**: Versioned event acceleration with stable ID and aggregate ordering.
- **Notification Preferences**: Server revision, retention, quiet hours, and category settings.

## Success Criteria

- **SC-001**: Refreshing after offline activity shows 100% of retained authorized items and the correct unread count before any new socket event.
- **SC-002**: Duplicate events produce zero duplicate rows/count increments; aggregate gaps always trigger reconciliation.
- **SC-003**: Two-tab read/unread/all-read scenarios converge to backend state after success, failure, and reconnect.
- **SC-004**: A committed event is presented at p95 within two seconds in the integration environment; the first 100 reconnect items appear within five seconds.
- **SC-005**: Socket/Redis failure leaves list, count, read, and preference HTTP interactions usable with honest delayed-realtime copy.
- **SC-006**: Desktop/mobile, Arabic/English, RTL/LTR, keyboard, screen-reader, 200% zoom, dark theme, and reduced-motion checks pass without critical defects.
- **SC-007**: Tests prove no unsafe external deep link, raw parameters, cross-user item, or message-text-driven error branch is introduced.

## Assumptions

- The backend exposes the exact version-1 DTO/envelope contract before the frontend flag is enabled.
- Current Axios authentication/refresh continues to own HTTP tokens; the socket subscribes to a session-token lifecycle signal rather than reading localStorage once.
- Browser Push appears only in Slice 5; browser preference fields may be displayed as unavailable or hidden until then.
