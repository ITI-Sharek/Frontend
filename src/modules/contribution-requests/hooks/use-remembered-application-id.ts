import { useCallback, useEffect, useState } from "react";

const APPLICATION_STATUS_KEY_PREFIX = "sharek:application-status:";

function applicationStatusKey(contributionRequestId: string): string {
  return `${APPLICATION_STATUS_KEY_PREFIX}${contributionRequestId}`;
}

function readRememberedApplicationId(
  contributionRequestId: string,
): string | null {
  const key = applicationStatusKey(contributionRequestId);
  try {
    const durableApplicationId = globalThis.localStorage.getItem(key);
    if (durableApplicationId) return durableApplicationId;
  } catch {
    // Fall back to the legacy session value when durable storage is disabled.
  }

  try {
    const sessionApplicationId = globalThis.sessionStorage.getItem(key);
    if (!sessionApplicationId) return null;
    try {
      globalThis.localStorage.setItem(key, sessionApplicationId);
    } catch {
      // Continue using the legacy session value when durable storage fails.
    }
    return sessionApplicationId;
  } catch {
    return null;
  }
}

function writeRememberedApplicationId(
  contributionRequestId: string,
  applicationId: string,
): void {
  const key = applicationStatusKey(contributionRequestId);
  try {
    globalThis.localStorage.setItem(key, applicationId);
  } catch {
    try {
      globalThis.sessionStorage.setItem(key, applicationId);
    } catch {
      // Navigation convenience must never make a successful submission fail.
    }
  }
}

export function useRememberedApplicationId(contributionRequestId: string) {
  const [applicationId, setApplicationId] = useState<string | null>(null);

  useEffect(() => {
    setApplicationId(readRememberedApplicationId(contributionRequestId));
  }, [contributionRequestId]);

  const rememberApplicationId = useCallback(
    (nextApplicationId: string) => {
      writeRememberedApplicationId(contributionRequestId, nextApplicationId);
    },
    [contributionRequestId],
  );

  const forgetApplicationId = useCallback(() => {
    const key = applicationStatusKey(contributionRequestId);
    try {
      globalThis.localStorage.removeItem(key);
    } catch {
      // Continue clearing the session fallback if local storage is disabled.
    }
    try {
      globalThis.sessionStorage.removeItem(key);
    } catch {
      // An unavailable storage API must not keep the submission form hidden.
    }
    setApplicationId(null);
  }, [contributionRequestId]);

  return { applicationId, rememberApplicationId, forgetApplicationId };
}
