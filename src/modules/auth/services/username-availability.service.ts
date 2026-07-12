import type { UsernameAvailabilityResult } from "../types/auth.types";

/**
 * MOCK IMPLEMENTATION.
 *
 * `GET /auth/username-availability` does not exist on the backend yet
 * (see docs/design/api-contract-additions.md §2, tracked as backlog item
 * FE-1 in docs/design/implementation-impact.md). This module simulates the
 * agreed response shape so the registration UI/UX can be built and
 * demonstrated now.
 *
 * To cut over once the endpoint ships: replace the body of
 * `checkUsernameAvailability` with an axiosInstance.get call and delete the
 * mock data below. `isValidUsernameFormat` is a real client-side pre-check
 * (DEC-016 format rules) and stays regardless of backend readiness.
 */

const USERNAME_FORMAT_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9_-]{1,28}[a-zA-Z0-9])?$/;

export function isValidUsernameFormat(username: string): boolean {
  return USERNAME_FORMAT_PATTERN.test(username);
}

const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "support",
  "help",
  "api",
  "root",
  "sharek",
  "share-k",
  "null",
  "undefined",
  "system",
  "moderator",
]);

const MOCK_TAKEN_USERNAMES = new Set([
  "sara-dev",
  "karim",
  "karim-muhammad",
  "test",
  "demo",
  "omar-k",
  "lina-m",
]);

function mockNetworkDelay(): Promise<void> {
  const ms = 300 + Math.round(Math.random() * 300);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateSuggestion(normalized: string): string {
  for (let suffix = 1; suffix <= 20; suffix += 1) {
    const candidate = `${normalized}-${suffix}`;
    if (!MOCK_TAKEN_USERNAMES.has(candidate) && candidate.length <= 30) {
      return candidate;
    }
  }
  return `${normalized}-${Date.now().toString().slice(-4)}`;
}

export async function checkUsernameAvailability(
  username: string,
): Promise<UsernameAvailabilityResult> {
  await mockNetworkDelay();

  if (!isValidUsernameFormat(username)) {
    return { available: false, suggestion: null, reason: "invalid_format" };
  }

  const normalized = username.trim().toLowerCase();

  if (RESERVED_USERNAMES.has(normalized)) {
    return { available: false, suggestion: null, reason: "reserved" };
  }

  if (MOCK_TAKEN_USERNAMES.has(normalized)) {
    return {
      available: false,
      suggestion: generateSuggestion(normalized),
      reason: "taken",
    };
  }

  return { available: true, suggestion: null, reason: null };
}
