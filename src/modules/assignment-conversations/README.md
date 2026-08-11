# Assignment Conversations

This module exposes the first Core Assignment Chat vertical in the member
workspace:

- `MessagesButton` opens the authenticated `/messages` workspace.
- The workspace loads only conversations returned for the current member,
  names both Assignment participants, labels and aligns own versus other
  messages, supports message text search, and sends 4,000-character-bounded
  messages with client-generated idempotency keys.
- Conversation selection is reflected in the URL as `?conversation=...`, so a
  refresh or copied internal link resolves that exact conversation through the
  authorized detail endpoint even when it is outside the first cursor page.
- Conversation and Message history expose their backend cursors through
  explicit load-more controls; the workspace never silently substitutes a
  different conversation when a deep-linked target is unavailable.
- The existing authenticated `/realtime` socket consumes version-one
  `conversation.message.created` envelopes. Open unfiltered history is patched
  only for a contiguous sequence; duplicate event/message IDs are ignored and
  gaps, search results, reconnect, focus, and online recovery reconcile from
  the authorized HTTP APIs.
- `MessagesButton` reads the conversation-activity unread count, while the
  shared Notification Center receives the sender-named activity Notification.

Read positions, typing/presence, reactions, editing/retraction, attachments,
and calls are follow-up communication slices.
