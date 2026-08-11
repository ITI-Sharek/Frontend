# Tasks: Realtime Notification Foundation

**Input**: `specs/007-realtime-notification-foundation/`

**Tests**: Add failing focused tests before implementation. Preserve unrelated Contribution Request/Material working-tree edits.

## Phase 1: Baseline and typed HTTP authority

- [x] T001 Record focused Notifications/provider/shell/settings and full repository baselines without changing unrelated dirty files.
- [x] T002 [P] Add failing exact service contract tests in `src/modules/notifications/services/notifications.service.test.ts`.
- [x] T003 [P] Add failing DTO/envelope/deep-link guard tests in `src/modules/notifications/utils/*.test.ts`.
- [x] T004 Replace legacy socket DTOs with version-1 page/count/presentation/preference/envelope types in `src/modules/notifications/types/notification.types.ts`.
- [x] T005 Implement HTTP methods in `src/modules/notifications/services/notifications.service.ts` using the shared Axios instance.
- [x] T006 Add Notification query keys, infinite list query, latest-page/count/preferences queries, and read/all/preferences mutations under `src/modules/notifications/api/`.
- [x] T007 Export only the intended public Notification surface from `src/modules/notifications/index.ts` and document it in a new module README.

## Phase 2: Durable inbox and read behavior

- [x] T008 [P] Add failing Notification Center tests for HTTP loading, empty, error, unread/all-read, filters, load-more, and no-socket behavior.
- [x] T009 [P] Add failing popover tests for initial HTTP data, badge-independent item display, deep-link safety, and passive-unread behavior.
- [x] T010 [P] Add failing mutation tests for read/unread/all-read optimistic success, rollback, stale-not-found, and final reconciliation.
- [x] T011 Rebuild `notification-center.tsx` over infinite query data with accessible filters/load-more and every approved state.
- [x] T012 Rebuild `notification-popover.tsx` over latest-page/count queries; do not compute the shell badge from loaded rows.
- [x] T013 Implement intentional read/unread/all-read actions and safe deep-link navigation with stable error-code recovery.
- [x] T014 Update member/admin Notification routes only as needed for composition/meta and retain their existing guards.

## Phase 3: Session-aware `/realtime` bridge

- [x] T015 [P] Add failing storage token-store tests for same-tab subscribers, cross-tab storage events, immutable snapshots, and SSR null snapshot.
- [x] T016 [P] Add failing socket wrapper tests for `/realtime`, WebSocket-only transport, bearer replacement, and cleanup.
- [x] T017 [P] Add failing event reducer tests for valid, duplicate, stale, contiguous, gapped, malformed, unknown-version/type, filtered-list, and bounded-ID behavior.
- [x] T018 Add session token subscribe/getSnapshot/getServerSnapshot behavior to `src/services/storage.service.ts` without changing Axios ownership.
- [x] T019 Replace `createNotificationSocket` with the shared `/realtime` wrapper in `src/lib/socket/socket-client.ts`.
- [x] T020 Implement runtime envelope/DTO guards, bounded recent-event IDs, aggregate comparison, cache patching, and invalidation under `src/modules/notifications/utils/`.
- [x] T021 Refactor `src/providers/notifications-provider.tsx` into a token-aware socket-to-query bridge with no Notification item array/local read authority.
- [x] T022 Add reconnect/focus/online reconciliation and distinct idle/connecting/synchronizing/connected/delayed/unauthorized states.
- [x] T023 Add provider tests for SSR, login after mount, token refresh, logout, one-socket invariant, duplicate/gap delivery, reconnect, and HTTP usability while disconnected.

## Phase 4: Preferences and language integration

- [x] T024 [P] Add failing preferences panel tests for defaults, retention choices, overnight quiet hours, timezone, required/optional categories, browser-deferred copy, save, rollback, and revision conflict.
- [x] T025 Build `NotificationPreferencesPanel` in `src/modules/notifications/components/notification-preferences-panel.tsx` with accessible form/status behavior.
- [x] T026 Add `notifications` to the `/settings` section union/composition and export the panel through the Notifications public barrel.
- [x] T027 Expose the same panel from the admin Notification Center without adding an unapproved admin settings route.
- [x] T028 Replace the mock-only language setting with `PATCH /auth/me/preferences`, update the authenticated-user cache from its public DTO, and invalidate Notification presentation queries so retained items use the current language.

## Phase 5: Coordinated cutover and validation

- [x] T029 Complete the coordinated `/realtime` rollout after backend flag verification, including removing the server's temporary `/notifications` namespace and proving the deployed client/server cutover.
- [x] T030 [P] Update Notification presenter tests for every semantic category, generic unknown fallback, priority, long Arabic/English copy, and non-color-only treatment.
- [x] T031 [P] Add two-tab/offline/reconnect integration fixtures for duplicate/out-of-order/gapped events and server-state convergence.
- [ ] T032 Run the quickstart across member/admin, mobile/desktop, Arabic/English, RTL/LTR, keyboard, screen reader, 200% zoom, dark theme, and reduced motion.
- [x] T033 Verify p95 two-second presentation, first-100 five-second recovery, and no unsafe deep-link/raw-payload logging in the integration environment.
- [x] T034 Run route generation, lint, exact TypeScript, focused/full Vitest, production build, and `git diff --check`.
- [x] T035 Review the complete intended diff, document backend contract/version dependency and remaining Slice 5 push work, and do not commit/push unless requested.

### Validation notes

- T029 completed against the local integration stack: the backend realtime flag
  was enabled, the server-side `/notifications` gateway was retired, and the
  browser smoke flow confirmed the client/server `/realtime` cutover.
- T033 completed with the backend profile: 500 sockets connected, event
  presentation p95 was 39 ms, first-100 HTTP reconciliation was 177 ms, and
  the cross-user room received zero events. Client deep-link guards reject
  external/malformed links, and the Notification feature/provider contain no
  raw-payload or parameter logging.
- T034 client lint, exact TypeScript, focused/full Vitest, production build, and
  `git diff --check` passed. T032 remains the manual accessibility and visual
  matrix item: member/admin, mobile/desktop, Arabic/English, RTL/LTR, keyboard,
  screen reader, 200% zoom, dark theme, and reduced motion.

## Dependencies

```text
Typed HTTP contract
  -> durable center/popover/read actions
  -> session-aware realtime bridge
  -> preferences/language
  -> coordinated old-socket removal and hardening
```

T002/T003 are parallel. T008–T010 are parallel after DTO/service setup. T015–T017 are parallel. T024 can start once preference types/services exist. UI files overlapping the user's dirty Contribution Request/Material work are not part of this plan.

## Format Validation

All 35 tasks use sequential IDs, concrete paths/boundaries, and map to TASK-9-03 and Slice 1 acceptance.
