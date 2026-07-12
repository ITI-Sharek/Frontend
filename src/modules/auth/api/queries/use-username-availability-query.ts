import { useQuery } from "@tanstack/react-query";

import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import {
  checkUsernameAvailability,
  isValidUsernameFormat,
} from "../../services/username-availability.service";
import { authKeys } from "../query-keys";

const DEBOUNCE_MS = 400;

export function useUsernameAvailabilityQuery(username: string) {
  const trimmed = username.trim();
  const debounced = useDebouncedValue(trimmed, DEBOUNCE_MS);
  const formatValid = isValidUsernameFormat(debounced);

  const query = useQuery({
    queryKey: authKeys.usernameAvailability(debounced),
    queryFn: () => checkUsernameAvailability(debounced),
    enabled: formatValid,
    staleTime: 30_000,
    retry: false,
  });

  return {
    ...query,
    formatValid,
    isDebouncing: trimmed.length > 0 && trimmed !== debounced,
  };
}
