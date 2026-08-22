# Assignment Calls

Client half of one-to-one P2P WebRTC calling between an Assignment's owner
and contributor, launched from the Assignment Conversation thread. The
server (`server/src/modules/assignment-calls`) is authoritative for
lifecycle and history; this module negotiates the actual `RTCPeerConnection`
between the two browsers.

- `lib/call-state-machine.ts` -- pure reducer, zero browser APIs. All call
  lifecycle states and transitions live here; see its own doc comment and
  `call-state-machine.test.ts`'s full transition table for the contract.
  Durable server events always win over local optimism: `DURABLE_ENDED`
  forces `ended` from any status, no exceptions.
- `lib/peer-connection.ts` -- wraps `RTCPeerConnection`, implementing the
  standard "perfect negotiation" pattern (callee polite, caller impolite),
  local ICE-disconnect grace window before restarting ICE, and screen-share
  track replacement.
- `lib/media-devices.ts` -- `getUserMedia` requested once per kind (audio,
  video), never combined, so a blocked camera never blocks audio.
- `lib/call-capabilities.ts` -- feature detection only, never user-agent
  sniffing.
- `lib/signaling-channel.ts` -- thin wrapper around the shared realtime
  socket for the transient `assignment_call.signal` event; filters every
  inbound signal to this exact call/session before it reaches anything else,
  since the server fans signals out to every open tab of a user.
- `providers/assignment-call-provider.tsx` (outside this module, mounted in
  `app-providers.tsx`) owns the actual `RTCPeerConnection` instance and the
  state machine, and renders every call surface through a portal to
  `document.body` so a route change never unmounts a live `<video>`.

## Module boundary

`modules/assignment-conversations` never imports this module. The call
button lives in the Assignment Conversation thread's header, but the wiring
is a render-prop (`AssignmentConversationWorkspace`'s `renderCallAction`)
supplied by the route (`routes/_appLayout/messages.tsx`), which is the only
place both modules are composed together -- exactly the pattern CLAUDE.md
prescribes for cross-feature UI.

## Feature flag

There is no client-side "is calling enabled" pre-check. `ASSIGNMENT_CALLS_ENABLED`
is enforced server-side; a disabled deployment surfaces `ASSIGNMENT_CALL_DISABLED`
from the `start` command like any other error code, mapped to copy the same
way `CHAT_ATTACHMENTS_DISABLED` already is in `assignment-conversations`.
The call button itself is gated only by `call-capabilities` (can this
browser/device call at all) and the conversation's own `active`/`read_only`
status.
