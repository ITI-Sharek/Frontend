import { describe, expect, it } from "vitest";

import { ROUTES } from "@/config/routes.config";

import {
  buildDemoSocialAuthCallbackUrl,
  buildDemoSocialAuthSelectedUrl,
  createDemoSocialAuthSession,
  isDemoSocialAuthToken,
  readSocialAuthCallbackResult,
} from "./social-auth.service";

describe("social auth service", () => {
  it("builds demo callback URLs for providers", () => {
    const url = new URL(
      buildDemoSocialAuthCallbackUrl(
        "github",
        "login",
        "http://localhost:3001",
      ),
    );

    expect(url.pathname).toBe(ROUTES.authCallback);
    expect(url.searchParams.get("provider")).toBe("github");
    expect(url.searchParams.get("intent")).toBe("login");
    expect(url.searchParams.get("demo")).toBe("1");
  });

  it("builds selected demo account callback URLs", () => {
    const url = new URL(
      buildDemoSocialAuthSelectedUrl({
        provider: "google",
        intent: "login",
        account: "team",
        origin: "http://localhost:3001",
      }),
    );

    expect(url.pathname).toBe(ROUTES.authCallback);
    expect(url.searchParams.get("provider")).toBe("google");
    expect(url.searchParams.get("intent")).toBe("login");
    expect(url.searchParams.get("demo")).toBe("1");
    expect(url.searchParams.get("account")).toBe("team");
  });

  it("parses real provider redirects into a code result", () => {
    const result = readSocialAuthCallbackResult(
      "?code=provider-code-123&state=sharek-state-456",
    );

    expect(result).toEqual({
      status: "code",
      code: "provider-code-123",
      state: "sharek-state-456",
    });
  });

  it("prioritizes provider errors over a code parameter", () => {
    const result = readSocialAuthCallbackResult(
      "?error=access_denied&code=x&state=y",
    );

    expect(result.status).toBe("error");
  });

  it("creates deterministic demo sessions for the selected provider", () => {
    const session = createDemoSocialAuthSession("github");

    expect(session.user.email).toBe("github.primary.demo@example.com");
    expect(session.user.username).toBe("github-primary-demo");
    expect(session.user.role).toBe("owner");
    expect(session.tokens.accessToken).toBe("demo-github-primary-access-token");
  });

  it("asks for demo account selection before creating a demo session", () => {
    const result = readSocialAuthCallbackResult(
      "?provider=google&intent=login&demo=1",
    );

    expect(result).toEqual({
      status: "demo-select",
      provider: "google",
      intent: "login",
    });
  });

  it("parses selected demo account callback results", () => {
    const result = readSocialAuthCallbackResult(
      "?provider=google&intent=login&demo=1&account=team",
    );

    expect(result.status).toBe("demo");
    if (result.status === "demo") {
      expect(result.session.user.email).toBe("google.team.demo@example.com");
    }
  });

  it("detects local demo tokens", () => {
    expect(isDemoSocialAuthToken("demo-google-primary-access-token")).toBe(true);
    expect(isDemoSocialAuthToken("real-access-token")).toBe(false);
    expect(isDemoSocialAuthToken(null)).toBe(false);
  });

  it("parses returned token callbacks without a user payload", () => {
    const result = readSocialAuthCallbackResult(
      "?accessToken=access-1&refreshToken=refresh-1",
    );

    expect(result).toEqual({
      status: "tokens",
      tokens: {
        accessToken: "access-1",
        refreshToken: "refresh-1",
        expiresAt: "",
        refreshExpiresAt: "",
      },
    });
  });

  it("surfaces provider callback errors", () => {
    expect(
      readSocialAuthCallbackResult(
        "?error=access_denied&error_description=Denied",
      ),
    ).toEqual({ status: "error", message: "Denied" });
  });
});
