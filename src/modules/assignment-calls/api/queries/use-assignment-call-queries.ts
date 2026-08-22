import { useQuery } from "@tanstack/react-query";

import { getJoinCredentials } from "../../services/assignment-calls.service";
import { assignmentCallKeys } from "../query-keys";

/**
 * Not mounted automatically -- `start`/`answer`/`reconnect` already return
 * `joinCredentials` inline, which covers the normal path end to end. This
 * hook exists for the rare secondary case: credentials minted during
 * `outgoing_preview`/`incoming_preview` expiring before the user actually
 * confirms, where the preview screen can call `refetch()` to renew them
 * without re-running the whole start/answer command.
 */
export function useJoinCredentialsQuery(callId: string) {
  return useQuery({
    queryKey: assignmentCallKeys.joinCredentials(callId),
    queryFn: () => getJoinCredentials(callId),
    enabled: false,
    retry: false,
  });
}
