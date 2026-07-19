# Feature Specification: Admin Skill Review and Realtime Notifications

**Feature Branch**: `004-admin-skill-review-notifications`

**Created**: 2026-07-19

**Status**: Draft

**Input**: Admin skill review APIs, review audit storage, and realtime notification delivery are already available on the backend. This feature covers the frontend surfaces that consume them.

**Grounded in**: `docs/design/wireframes/11-admin-skill-review.md`, `docs/design/navigation-model.md`, `docs/design/information-architecture.md`, `docs/design/user-journeys.md`, and `docs/design/implementation-impact.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin works the pending skill review queue (Priority: P1)

As an admin, I want a queue of pending AI-generated skill profiles so I can open the next contributor, review evidence, and decide quickly without leaving the workspace.

**Independent Test**: Open the admin queue, confirm rows are sorted oldest-first, then open a workspace and verify the current contributor, skill count, and evidence pane load together.

### User Story 2 - Admin records a review decision with provenance (Priority: P1)

As an admin, I want to approve, reject, or adjust a skill proficiency label and preserve the original AI output so the decision is honest, auditable, and visible later.

**Independent Test**: In the workspace, make one approve, one reject, and one proficiency adjustment, then confirm the UI shows the recorded decision and the original level where relevant.

### User Story 3 - Authenticated users receive realtime notifications (Priority: P1)

As an authenticated user, I want new notifications to appear without refreshing so I can see review outcomes and other platform events as they happen.

**Independent Test**: Keep the app open, trigger a notification event, and confirm the unread badge, popover, and full notifications page reflect the new item after the socket event arrives.

### User Story 4 - Contributor review status stays visible (Priority: P2)

As a contributor, I want the app shell and profile views to reflect whether my generated skills are pending, approved, rejected, or adjusted so I understand what changed after admin review.

**Independent Test**: Load a contributor account with a pending review or adjusted skill and confirm the profile/shell copy shows the current state rather than a generic success screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The frontend MUST provide a dedicated admin shell and admin-only skill review routes.
- **FR-002**: The skill review queue MUST show pending contributor profiles sorted oldest-first with queue metadata.
- **FR-003**: The skill review workspace MUST show the selected contributor, skill list, evidence panel, and navigation to the next or previous review item.
- **FR-004**: The workspace MUST support approve, reject, and proficiency-adjust actions for each skill.
- **FR-005**: The frontend MUST preserve and display the original AI proficiency when an admin adjusts a skill.
- **FR-006**: The frontend MUST surface admin review notes and review provenance in a way that is visible to the contributor-facing profile where applicable.
- **FR-007**: The frontend MUST provide a notifications page and a top-bar popover that share the same notification data source.
- **FR-008**: The frontend MUST update unread notification state in realtime when a backend notification event arrives.
- **FR-009**: The frontend MUST degrade gracefully when the realtime socket disconnects, using query refetches or cached state until the connection recovers.
- **FR-010**: The frontend MUST route admin users to the admin surface after login and MUST keep contributor and owner destinations unchanged.
- **FR-011**: The frontend MUST keep route files thin and move transport, cache, and decision logic into feature modules or provider code.
- **FR-012**: The frontend MUST not implement contributor activation logic itself; it may only display the backend-owned review and activation state.

## Key Entities

- **Skill Review Queue Item**: The contributor review entry shown in the admin queue, including waiting age and count of generated skills.
- **Skill Review Decision**: The recorded approve/reject/adjust outcome for one skill, including original proficiency and admin notes when applicable.
- **Notification Item**: A typed event rendered in the notification center, popover, and badge-driven counters.
- **Unread Notification State**: The client-visible count that stays in sync with the backend and the realtime socket.
- **Contributor Review State**: The contributor-facing status that indicates pending review, approved, rejected, or adjusted skill outcomes.

## Assumptions

- Backend review endpoints, notification endpoints, and the `notifications` socket namespace already exist.
- Admin role checks are enforced by the frontend route shell, but the backend remains the final authority.
- Contributor activation after admin review remains backend-owned; this feature only reflects that state in the UI.
- The app will use a Socket.IO client rather than a raw WebSocket because the backend transport already exposes a socket namespace.
