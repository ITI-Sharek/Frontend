# Client Data Model: Realtime Notification Foundation

## NotificationPresentationDto

```ts
type NotificationType =
  | "application_status"
  | "proposal_status"
  | "assignment_status"
  | "delivery_update"
  | "skill_review"
  | "material_status"
  | "match_found"
  | "task_recommendation"
  | "plan_limit"
  | "skill_profile_generation"
  | "moderation"
  | "account_security"
  | "conversation_activity"
  | "assignment_call"
  | "system";

type NotificationPriority = "urgent" | "attention" | "ambient";

interface NotificationPresentationDto {
  notificationId: string;
  type: NotificationType;
  templateKey: string;
  templateVersion: number;
  title: string;
  body: string;
  deepLink: string | null;
  priority: NotificationPriority;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  aggregateVersion: number;
}
```

The client never receives semantic parameters, recipient ID, deduplication key, or publication metadata. Type/template may be unknown at runtime despite compile-time unions; the parser uses a generic presentation path rather than throwing the whole page away.

## NotificationPageDto

```ts
interface NotificationPageDto {
  items: NotificationPresentationDto[];
  nextCursor: string | null;
}

interface NotificationFilters {
  readState?: "read" | "unread";
  type?: NotificationType;
  limit: number;
}
```

Query key includes normalized filters, never cursor; TanStack Query owns page parameters. Pages retain backend order. UI deduplicates flattened display by `notificationId` defensively without changing page/cursor structure.

## UnreadCountDto

```ts
interface UnreadCountDto {
  unreadCount: number;
}
```

This query is the shell badge authority. It is not derived from only loaded pages.

## RealtimeEventEnvelope

```ts
interface RealtimeEventEnvelope<TPayload> {
  eventId: string;
  type: "notification.created" | "notification.read_state_changed";
  version: 1;
  occurredAt: string;
  aggregateId: string;
  aggregateVersion: number;
  payload: TPayload;
}

interface NotificationEventPayload {
  notification: NotificationPresentationDto;
}
```

Runtime validation is mandatory. Recent `eventId` memory is bounded and transient. Per-Notification `aggregateVersion` decides stale/contiguous/gapped handling.

## NotificationPreferencesDto

```ts
interface NotificationPreferencesDto {
  retentionDays: 30 | 90 | 180 | 365;
  quietHours: {
    enabled: boolean;
    startLocal: string | null;
    endLocal: string | null;
    timeZone: string | null;
  };
  revision: number;
  categories: Array<{
    type: NotificationType;
    requiredInApp: boolean;
    inAppEnabled: boolean;
    browserEnabled: boolean;
  }>;
}
```

Form state is a local editable copy. Successful save replaces the query value. Revision conflict discards neither silently: show conflict, refetch, and ask the user to review the current server values.

## Connection State

```ts
type RealtimeConnectionStatus =
  | "idle"
  | "connecting"
  | "synchronizing"
  | "connected"
  | "delayed"
  | "unauthorized";
```

- `idle`: no authenticated token.
- `connecting`: socket attempt in progress.
- `synchronizing`: socket connected; HTTP reconciliation pending.
- `connected`: socket and reconciliation succeeded.
- `delayed`: socket unavailable or reconciliation failed; HTTP UI remains usable.
- `unauthorized`: socket session rejected; auth recovery/logout owns next action.

## Cache Transitions

| Input | Safe client action |
|---|---|
| Duplicate `eventId` | Ignore |
| Event version <= cached aggregate version | Ignore as stale |
| Created event for first unfiltered page | Prepend/deduplicate, trim page size, invalidate count |
| Contiguous read event for cached item | Replace item; adjust/invalidate count |
| Aggregate gap or item absent for update | Invalidate lists/count |
| Unknown/malformed envelope | Ignore payload and invalidate relevant authority if authenticated |
| Read mutation success | Replace with response, then invalidate count/list |
| Read mutation failure | Roll back snapshot, show stable error, invalidate |
| Mark-all success | Invalidate all Notification list/count queries |
