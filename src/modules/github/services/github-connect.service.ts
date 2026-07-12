import { startGitHubOAuth } from "./github.service";

/**
 * Browser-side orchestration for connecting a GitHub account from inside the
 * app (profile completion, settings). Uses the real backend endpoints:
 * GET /github/oauth/start → provider redirect → POST /github/oauth/callback.
 *
 * The GitHub OAuth App used for account connection should redirect to the
 * backend OAuth callback URL, e.g. /github/oauth/callback. If the backend
 * forwards code/state to the SPA, /auth/callback can finish the browser flow.
 */

export interface PendingGitHubConnect {
  kind: "github-connect";
  state: string;
  returnTo: string;
  startedAt: string;
}

const PENDING_GITHUB_CONNECT_KEY = "sharek.pending-github-connect";

export function readPendingGitHubConnect(): PendingGitHubConnect | null {
  try {
    const raw = sessionStorage.getItem(PENDING_GITHUB_CONNECT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingGitHubConnect>;
    if (
      parsed.kind !== "github-connect" ||
      typeof parsed.state !== "string" ||
      typeof parsed.returnTo !== "string"
    ) {
      return null;
    }
    return parsed as PendingGitHubConnect;
  } catch {
    return null;
  }
}

export function clearPendingGitHubConnect(): void {
  sessionStorage.removeItem(PENDING_GITHUB_CONNECT_KEY);
}

export async function startGitHubConnect(returnTo: string): Promise<void> {
  const start = await startGitHubOAuth();
  const record: PendingGitHubConnect = {
    kind: "github-connect",
    state: start.state,
    returnTo,
    startedAt: new Date().toISOString(),
  };
  sessionStorage.setItem(PENDING_GITHUB_CONNECT_KEY, JSON.stringify(record));
  window.location.assign(start.authorizationUrl);
}
