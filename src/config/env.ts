/**
 * Browser-exposed environment values.
 *
 * The Sharek backend listens on 4000 by default (`config.get('PORT', 4000)` in
 * the API's `src/main.ts`, and `PORT=4000` in its `.env.example`); README.md and
 * CLAUDE.md document the same default. Point elsewhere with `VITE_API_URL`.
 */
const DEFAULT_API_BASE_URL = "http://localhost:4000";

function readEnv(key: string): string | undefined {
  const value = (import.meta.env as Record<string, unknown>)[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

/** Absolute API origin, never carrying a trailing slash. */
export const API_BASE_URL = (
  readEnv("VITE_API_URL") ?? DEFAULT_API_BASE_URL
).replace(/\/+$/, "");
