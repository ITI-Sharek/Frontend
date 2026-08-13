import { axiosInstance } from "@/lib/axios/axios-instance";
import { translate } from "@/lib/translate";
import { ROUTES } from "@/config/routes.config";

import type {
  AuthSessionDto,
  AuthTokensDto,
  AuthUserDto,
} from "../types/auth.types";

export type SocialAuthProvider = "github" | "google";
export type SocialAuthIntent = "login" | "register";
export type SocialAuthRole = "owner" | "contributor";

type SocialAuthCallbackResult =
  | {
      status: "demo-select";
      provider: SocialAuthProvider;
      intent: SocialAuthIntent;
    }
  | { status: "demo"; session: AuthSessionDto }
  | { status: "session"; session: AuthSessionDto }
  | { status: "tokens"; tokens: AuthTokensDto }
  | { status: "code"; code: string; state: string }
  | { status: "error"; message: string }
  | { status: "missing" };

interface SocialAuthStartResponse {
  provider: string;
  role: SocialAuthRole;
  authorizationUrl: string;
  state: string;
  expiresAt: string;
}

export interface PendingSocialAuth {
  provider: SocialAuthProvider;
  intent: SocialAuthIntent;
  role?: SocialAuthRole;
  state: string;
  startedAt: string;
}

const PROVIDER_LABELS: Record<SocialAuthProvider, string> = {
  github: "GitHub",
  google: "Google",
};

const PENDING_SOCIAL_AUTH_KEY = "sharek.pending-social-auth";
const DEMO_TOKEN_EXPIRY = "2026-12-31T23:59:59.000Z";

// Local demo mode simulates the provider hop without backend/provider
// credentials (useful for UI demos). Real backend social auth is the default.
function isDemoModeEnabled(): boolean {
  return import.meta.env.VITE_SOCIAL_AUTH_DEMO === "1";
}

export function isSocialAuthProvider(
  provider: string | null,
): provider is SocialAuthProvider {
  return provider === "github" || provider === "google";
}

export function getSocialAuthProviderLabel(
  provider: SocialAuthProvider,
): string {
  return PROVIDER_LABELS[provider];
}

export function isDemoSocialAuthToken(token: string | null): boolean {
  return token?.startsWith("demo-") ?? false;
}

function getBrowserOrigin(): string {
  if (typeof window === "undefined") return "http://localhost:3001";
  return window.location.origin;
}

// --- pending-flow record (survives the provider redirect round-trip) ---

export function savePendingSocialAuth(record: PendingSocialAuth): void {
  sessionStorage.setItem(PENDING_SOCIAL_AUTH_KEY, JSON.stringify(record));
}

export function readPendingSocialAuth(): PendingSocialAuth | null {
  try {
    const raw = sessionStorage.getItem(PENDING_SOCIAL_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingSocialAuth;
    if (!isSocialAuthProvider(parsed.provider)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingSocialAuth(): void {
  sessionStorage.removeItem(PENDING_SOCIAL_AUTH_KEY);
}

// --- real backend flow ---

/**
 * GET /auth/{provider}/start?role= — the backend requires `role` even for
 * sign-in (it is only used when a new user must be created; existing users
 * keep their saved role). GitHub social auth is identity-only and must not be
 * treated as repository consent; the profile/onboarding GitHub connector owns
 * `/github/oauth/start` for public/private repository access. For plain
 * sign-in we default to "contributor"; making the param optional for sign-in
 * is requested in ../docs/architecture/contracts/api-contract-additions.md.
 */
export async function requestSocialAuthStart(
  provider: SocialAuthProvider,
  role: SocialAuthRole,
): Promise<SocialAuthStartResponse> {
  const { data } = await axiosInstance.get<SocialAuthStartResponse>(
    `/auth/${provider}/start`,
    { params: { role } },
  );
  return data;
}

/**
 * POST /auth/{provider}/callback with the provider `code` and Share-k `state`
 * → full auth session. Provider OAuth apps may still redirect to backend OAuth
 * callback URLs first; if the backend forwards code/state to the SPA, this
 * frontend callback route completes the session.
 */
export async function completeSocialAuthCallback(
  provider: SocialAuthProvider,
  code: string,
  state: string,
): Promise<AuthSessionDto> {
  const { data } = await axiosInstance.post<AuthSessionDto>(
    `/auth/${provider}/callback`,
    { code, state },
  );
  return data;
}

export async function startSocialAuth(
  provider: SocialAuthProvider,
  intent: SocialAuthIntent,
  role: SocialAuthRole = "contributor",
): Promise<void> {
  if (isDemoModeEnabled()) {
    window.location.assign(buildDemoSocialAuthCallbackUrl(provider, intent));
    return;
  }

  const start = await requestSocialAuthStart(provider, role);
  savePendingSocialAuth({
    provider,
    intent,
    role,
    state: start.state,
    startedAt: new Date().toISOString(),
  });
  window.location.assign(start.authorizationUrl);
}

// --- demo flow (opt-in via VITE_SOCIAL_AUTH_DEMO=1) ---

export function buildDemoSocialAuthCallbackUrl(
  provider: SocialAuthProvider,
  intent: SocialAuthIntent,
  origin = getBrowserOrigin(),
): string {
  const url = new URL(ROUTES.authCallback, origin);
  url.searchParams.set("provider", provider);
  url.searchParams.set("intent", intent);
  url.searchParams.set("demo", "1");
  return url.toString();
}

export function buildDemoSocialAuthSelectedUrl({
  provider,
  intent,
  account,
  origin = getBrowserOrigin(),
}: {
  provider: SocialAuthProvider;
  intent: SocialAuthIntent;
  account: string;
  origin?: string;
}): string {
  const url = new URL(buildDemoSocialAuthCallbackUrl(provider, intent, origin));
  url.searchParams.set("account", account);
  return url.toString();
}

export function createDemoSocialAuthSession(
  provider: SocialAuthProvider,
  account = "primary",
): AuthSessionDto {
  const label = getSocialAuthProviderLabel(provider);
  const username = `${provider}-${account}-demo`;
  const now = new Date().toISOString();

  return {
    user: {
      id: `demo-${provider}-${account}-user`,
      email: `${provider}.${account}.demo@example.com`,
      username,
      firstName: label,
      lastName: "Demo",
      avatarUrl: null,
      role: "owner",
      status: "active",
      preferredLanguage: "ar",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    },
    tokens: {
      accessToken: `demo-${provider}-${account}-access-token`,
      refreshToken: `demo-${provider}-${account}-refresh-token`,
      expiresAt: DEMO_TOKEN_EXPIRY,
      refreshExpiresAt: DEMO_TOKEN_EXPIRY,
    },
  };
}

// --- callback URL parsing ---

function decodeJsonParam<T>(value: string): T | null {
  try {
    return JSON.parse(decodeURIComponent(value)) as T;
  } catch {
    try {
      return JSON.parse(atob(value)) as T;
    } catch {
      return null;
    }
  }
}

export function readSocialAuthCallbackResult(
  search: string,
): SocialAuthCallbackResult {
  const params = new URLSearchParams(search);
  const provider = params.get("provider");
  const error = params.get("error");

  if (error) {
    return {
      status: "error",
      message:
        params.get("error_description") ??
        params.get("message") ??
        translate("auth.callback.loginError"),
    };
  }

  if (params.get("demo") === "1") {
    if (!isSocialAuthProvider(provider)) {
      return {
        status: "error",
        message: translate("auth.callback.unknownProvider"),
      };
    }

    const intent = params.get("intent") === "register" ? "register" : "login";
    const account = params.get("account");

    if (!account) {
      return { status: "demo-select", provider, intent };
    }

    return {
      status: "demo",
      session: createDemoSocialAuthSession(provider, account),
    };
  }

  // Real provider redirect: GitHub/Google land here with ?code=&state=.
  const code = params.get("code");
  const state = params.get("state");
  if (code && state) {
    return { status: "code", code, state };
  }

  const sessionParam = params.get("session");
  if (sessionParam) {
    const session = decodeJsonParam<AuthSessionDto>(sessionParam);
    if (session?.tokens.accessToken && session.tokens.refreshToken) {
      return { status: "session", session };
    }
  }

  const accessToken = params.get("accessToken") ?? params.get("access_token");
  const refreshToken = params.get("refreshToken") ?? params.get("refresh_token");

  if (accessToken && refreshToken) {
    const tokens: AuthTokensDto = {
      accessToken,
      refreshToken,
      expiresAt: params.get("expiresAt") ?? params.get("expires_at") ?? "",
      refreshExpiresAt:
        params.get("refreshExpiresAt") ?? params.get("refresh_expires_at") ?? "",
    };
    const userParam = params.get("user");
    const user = userParam ? decodeJsonParam<AuthUserDto>(userParam) : null;

    if (user) {
      return { status: "session", session: { user, tokens } };
    }

    return { status: "tokens", tokens };
  }

  return { status: "missing" };
}
