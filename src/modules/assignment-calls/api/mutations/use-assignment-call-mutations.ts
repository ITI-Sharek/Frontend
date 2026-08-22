import { useMutation } from "@tanstack/react-query";

import {
  answerAssignmentCall,
  declineAssignmentCall,
  endAssignmentCall,
  reconnectAssignmentCall,
  startAssignmentCall,
} from "../../services/assignment-calls.service";

/**
 * Every call command is idempotent HTTP, committed then published --
 * exactly like every other command in this codebase (README, "the rule that
 * shapes everything here"). These mutations carry no cache invalidation of
 * their own: call lifecycle lives in `assignment-call-provider.tsx`'s state
 * machine, not in TanStack Query's cache.
 */
export function useStartAssignmentCallMutation() {
  return useMutation({ mutationFn: startAssignmentCall });
}

export function useAnswerAssignmentCallMutation() {
  return useMutation({ mutationFn: answerAssignmentCall });
}

export function useDeclineAssignmentCallMutation() {
  return useMutation({ mutationFn: declineAssignmentCall });
}

export function useEndAssignmentCallMutation() {
  return useMutation({ mutationFn: endAssignmentCall });
}

export function useReconnectAssignmentCallMutation() {
  return useMutation({ mutationFn: reconnectAssignmentCall });
}
