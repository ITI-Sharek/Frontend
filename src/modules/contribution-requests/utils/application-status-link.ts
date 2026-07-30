const APPLICATION_STATUS_KEY_PREFIX = "sharek:application-status:";

export function rememberApplicationStatus(
  contributionRequestId: string,
  applicationId: string,
): void {
  try {
    globalThis.sessionStorage.setItem(
      `${APPLICATION_STATUS_KEY_PREFIX}${contributionRequestId}`,
      applicationId,
    );
  } catch {
    // Navigation convenience must never make a successful submission fail.
  }
}

export function getRememberedApplicationId(
  contributionRequestId: string,
): string | null {
  try {
    return globalThis.sessionStorage.getItem(
      `${APPLICATION_STATUS_KEY_PREFIX}${contributionRequestId}`,
    );
  } catch {
    return null;
  }
}
