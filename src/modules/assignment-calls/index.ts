export { CallControls } from "./components/call-controls";
export type { CallControlsProps } from "./components/call-controls";
export { CallDevicePreview } from "./components/call-device-preview";
export type { CallDevicePreviewProps } from "./components/call-device-preview";
export { CallLaunchButton } from "./components/call-launch-button";
export type { CallLaunchButtonProps } from "./components/call-launch-button";
export { CallStage } from "./components/call-stage";
export type { CallStageProps } from "./components/call-stage";
export { CallUnavailableNotice } from "./components/call-unavailable-notice";
export { IncomingCallSheet } from "./components/incoming-call-sheet";
export type { IncomingCallSheetProps } from "./components/incoming-call-sheet";
export { MinimizedCallBar } from "./components/minimized-call-bar";
export type { MinimizedCallBarProps } from "./components/minimized-call-bar";

export {
  useAnswerAssignmentCallMutation,
  useDeclineAssignmentCallMutation,
  useEndAssignmentCallMutation,
  useReconnectAssignmentCallMutation,
  useStartAssignmentCallMutation,
} from "./api/mutations/use-assignment-call-mutations";
export { useJoinCredentialsQuery } from "./api/queries/use-assignment-call-queries";
export { assignmentCallKeys } from "./api/query-keys";

export { getAssignmentCallErrorMessage } from "./constants/call-error-copy";
export {
  DEVICE_PREFERENCE_STORAGE_KEY,
  ICE_DISCONNECT_GRACE_MS,
  SIGNAL_ACK_TIMEOUT_MS,
} from "./constants/call-config";

export { getAssignmentCallCapabilities } from "./lib/call-capabilities";
export type { AssignmentCallCapabilities } from "./lib/call-capabilities";
export {
  INITIAL_CALL_MACHINE_STATE,
  callStateMachineReducer,
} from "./lib/call-state-machine";
export type {
  CallMachineAction,
  CallMachineContext,
  CallMachineError,
  CallMachineRole,
  CallMachineState,
  CallMachineStatus,
} from "./lib/call-state-machine";
export {
  acquireLocalMedia,
  listMediaDevices,
  mapGetUserMediaError,
  stopLocalMedia,
  stopMediaKindResult,
} from "./lib/media-devices";
export type {
  AcquireLocalMediaOptions,
  AcquireLocalMediaResult,
  EnumeratedDevice,
  MediaAcquisitionErrorReason,
  MediaKindResult,
} from "./lib/media-devices";
export { createAssignmentCallPeerConnection } from "./lib/peer-connection";
export type {
  AssignmentCallPeerCallbacks,
  AssignmentCallPeerConnection,
  AssignmentCallPeerRole,
  CreatePeerConnectionOptions,
  MediaKind,
} from "./lib/peer-connection";
export {
  SignalAckTimeoutError,
  createSignalingChannel,
} from "./lib/signaling-channel";
export type { SignalingChannel } from "./lib/signaling-channel";

export {
  answerAssignmentCall,
  declineAssignmentCall,
  endAssignmentCall,
  getJoinCredentials,
  reconnectAssignmentCall,
  startAssignmentCall,
} from "./services/assignment-calls.service";

export type {
  AssignmentCallApiError,
  AssignmentCallCommandPayload,
  AssignmentCallDto,
  AssignmentCallEvent,
  AssignmentCallEventType,
  AssignmentCallOutcome,
  AssignmentCallSignalAck,
  AssignmentCallSignalCandidate,
  AssignmentCallSignalInbound,
  AssignmentCallSignalKind,
  AssignmentCallSignalOutbound,
  IceServerDto,
  JoinCredentialsDto,
  StartAssignmentCallPayload,
  StartOrAnswerCallResponseDto,
} from "./types/assignment-call.types";

export { isAssignmentCallEvent } from "./utils/assignment-call-event";
export {
  readDevicePreference,
  writeDevicePreference,
} from "./utils/device-preference-storage";
export type { DevicePreference } from "./utils/device-preference-storage";
