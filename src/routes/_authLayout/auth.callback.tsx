import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getPostLoginPath, ROUTES } from "@/config/routes.config";
import { AuthHero, getCurrentUser } from "@/modules/auth";
import type { AuthTokensDto, AuthUserDto } from "@/modules/auth";
import {
  buildDemoSocialAuthSelectedUrl,
  clearPendingSocialAuth,
  completeSocialAuthCallback,
  getSocialAuthProviderLabel,
  readPendingSocialAuth,
  readSocialAuthCallbackResult,
  startSocialAuth,
} from "@/modules/auth/services/social-auth.service";
import type {
  SocialAuthIntent,
  SocialAuthProvider,
} from "@/modules/auth/services/social-auth.service";
import { ensureCurrentContributorProfile } from "@/modules/contributors";
import {
  clearPendingGitHubConnect,
  completeGitHubOAuth,
  readPendingGitHubConnect,
  startGitHubConnect,
} from "@/modules/github";
import { storageService } from "@/services/storage.service";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { shouldEnsureContributorProfile } from "./login.helpers";

export const Route = createFileRoute("/_authLayout/auth/callback")({
  head: () => ({
    meta: [{ title: "Sharek" }],
  }),
  component: AuthCallbackPage,
});

function persistTokens(tokens: AuthTokensDto) {
  storageService.setAccessToken(tokens.accessToken);
  storageService.setRefreshToken(tokens.refreshToken);
}

function AuthCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [demoSelection, setDemoSelection] = useState<{
    provider: SocialAuthProvider;
    intent: SocialAuthIntent;
  } | null>(null);
  const [githubRetry, setGitHubRetry] = useState<
    | { kind: "connect"; returnTo: string }
    | { kind: "social"; intent: SocialAuthIntent; role: "owner" | "contributor" }
    | null
  >(null);
  const [socialIntentAction, setSocialIntentAction] = useState<
    SocialAuthIntent | null
  >(null);

  async function retryGitHubWithAccountPicker() {
    if (!githubRetry) return;
    setErrorMessage(null);
    try {
      if (githubRetry.kind === "connect") {
        await startGitHubConnect(githubRetry.returnTo);
      } else {
        await startSocialAuth("github", githubRetry.intent, githubRetry.role);
      }
    } catch {
      setErrorMessage(t("auth.callback.retryAccountError"));
    }
  }

  async function navigateAfterSocialAuth(
    user: AuthUserDto,
    options: { ensureContributorProfile: boolean },
  ) {
    if (
      options.ensureContributorProfile &&
      shouldEnsureContributorProfile(user)
    ) {
      const profile = await ensureCurrentContributorProfile();
      navigate({ to: ROUTES.contributorProfile(profile.username) });
      return;
    }

    navigate({ to: getPostLoginPath(user) });
  }

  useEffect(() => {
    let isActive = true;

    async function completeSocialAuth() {
      const result = readSocialAuthCallbackResult(window.location.search);

      try {
        if (result.status === "error") {
          setErrorMessage(result.message);
          return;
        }

        if (result.status === "missing") {
          setErrorMessage(t("auth.callback.missingProviderData"));
          return;
        }

        if (result.status === "demo-select") {
          if (isActive) {
            setDemoSelection({
              provider: result.provider,
              intent: result.intent,
            });
          }
          return;
        }

        if (result.status === "demo" || result.status === "session") {
          persistTokens(result.session.tokens);
          await navigateAfterSocialAuth(result.session.user, {
            ensureContributorProfile: result.status !== "demo",
          });
          return;
        }

        if (result.status === "code") {
          // Real provider redirect. Two flows can land here — GitHub account
          // *connection* (started from the profile/settings while logged in)
          // and social *sign-in* — distinguished by their pending records.
          const pendingConnect = readPendingGitHubConnect();
          if (pendingConnect) {
            await completeGitHubOAuth({
              code: result.code,
              state: result.state,
            });
            clearPendingGitHubConnect();
            if (!isActive) return;
            navigate({ to: pendingConnect.returnTo });
            return;
          }

          const pending = readPendingSocialAuth();
          if (!pending) {
            setErrorMessage(
              t("auth.callback.sessionExpired"),
            );
            return;
          }

          const session = await completeSocialAuthCallback(
            pending.provider,
            result.code,
            result.state,
          );
          clearPendingSocialAuth();
          if (!isActive) return;

          persistTokens(session.tokens);
          await navigateAfterSocialAuth(session.user, {
            ensureContributorProfile: true,
          });
          return;
        }

        persistTokens(result.tokens);
        const user = await getCurrentUser();
        if (!isActive) return;

        await navigateAfterSocialAuth(user, { ensureContributorProfile: true });
      } catch (error) {
        const pendingConnect = readPendingGitHubConnect();
        const pendingSocial = readPendingSocialAuth();
        const errorCode = isAxiosError(error)
          ? (error.response?.data as { code?: unknown } | undefined)?.code
          : undefined;
        const isGitHubAccountConflict =
          errorCode === "GITHUB_ACCOUNT_TAKEN" ||
          errorCode === "AUTH_PROVIDER_ACCOUNT_ALREADY_LINKED" ||
          errorCode === "GITHUB_SIGN_IN_EMAIL_CONFLICT" ||
          errorCode === "GITHUB_AUTH_ACCOUNT_MISMATCH";
        const isSocialIntentError =
          errorCode === "SOCIAL_AUTH_ACCOUNT_NOT_FOUND" ||
          errorCode === "SOCIAL_AUTH_ACCOUNT_ALREADY_EXISTS";

        if (isGitHubAccountConflict) {
          if (pendingConnect) {
            setGitHubRetry({
              kind: "connect",
              returnTo: pendingConnect.returnTo,
            });
          } else if (pendingSocial?.provider === "github") {
            setGitHubRetry({
              kind: "social",
              intent: pendingSocial.intent,
              role: pendingSocial.role ?? "contributor",
            });
          }
        }
        clearPendingSocialAuth();
        clearPendingGitHubConnect();
        if (!pendingConnect) {
          storageService.clearTokens();
        }
        if (isActive) {
          if (isSocialIntentError) {
            setSocialIntentAction(
              errorCode === "SOCIAL_AUTH_ACCOUNT_NOT_FOUND"
                ? "register"
                : "login",
            );
          }
          const githubConflictMessage =
            errorCode === "GITHUB_SIGN_IN_EMAIL_CONFLICT"
              ? t("auth.callback.githubEmailConflict")
              : errorCode === "GITHUB_AUTH_ACCOUNT_MISMATCH"
                ? t("auth.callback.githubAccountMismatch")
                : t("auth.callback.githubAccountTaken");
          setErrorMessage(
            errorCode === "SOCIAL_AUTH_ACCOUNT_NOT_FOUND"
              ? t("auth.callback.socialAccountNotFound")
              : errorCode === "SOCIAL_AUTH_ACCOUNT_ALREADY_EXISTS"
                ? t("auth.callback.socialAccountAlreadyExists")
                : isGitHubAccountConflict
              ? githubConflictMessage
              : t("auth.callback.loginError"),
          );
        }
      }
    }

    completeSocialAuth();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <>
      <AuthHero
        heading={
          demoSelection
            ? t("auth.callback.chooseProviderAccount", { provider: getSocialAuthProviderLabel(demoSelection.provider) })
            : t("auth.callback.title")
        }
        subtext={
          demoSelection ? t("auth.callback.demoSubtext") : t("auth.callback.processingSubtext")
        }
      />
      <Card className="items-center text-center">
        {demoSelection ? (
          <DemoAccountSelection
            provider={demoSelection.provider}
            intent={demoSelection.intent}
          />
        ) : errorMessage ? (
          <div className="flex w-full flex-col items-center gap-4">
            <p className="text-sm text-destructive">{errorMessage}</p>
            {githubRetry && (
              <Button
                type="button"
                onClick={() => void retryGitHubWithAccountPicker()}
              >
                {t("auth.callback.chooseAnotherGithub")}
              </Button>
            )}
            <Button asChild variant="outline">
              <Link
                to={
                  socialIntentAction === "register"
                    ? ROUTES.register
                    : ROUTES.login
                }
              >
                {socialIntentAction === "register"
                  ? t("auth.createAccount")
                  : t("auth.callback.backToLogin")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex w-full items-center justify-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span>{t("auth.callback.completing")}</span>
          </div>
        )}
      </Card>
    </>
  );
}

function DemoAccountSelection({
  provider,
  intent,
}: {
  provider: SocialAuthProvider;
  intent: SocialAuthIntent;
}) {
  const { t } = useTranslation();
  const providerLabel = getSocialAuthProviderLabel(provider);
  const accounts = [
    {
      id: "primary",
      name: `${providerLabel} Demo`,
      email: `${provider}.primary.demo@example.com`,
    },
    {
      id: "team",
      name: `${providerLabel} Team Demo`,
      email: `${provider}.team.demo@example.com`,
    },
  ];

  return (
    <div className="flex w-full flex-col gap-4 text-right">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">
          {t("auth.callback.chooseAccount")}
        </p>
        <p className="text-xs leading-5 text-muted-foreground">
          {t("auth.callback.demoDescription", { provider: providerLabel })}
        </p>
      </div>

      <div className="flex w-full flex-col gap-3" dir="ltr">
        {accounts.map((account) => (
          <Button
            key={account.id}
            type="button"
            variant="outline"
            className="w-full justify-between px-4 py-3 text-left"
            onClick={() => {
              window.location.assign(
                buildDemoSocialAuthSelectedUrl({
                  provider,
                  intent,
                  account: account.id,
                }),
              );
            }}
          >
            <span className="flex min-w-0 flex-col items-start">
              <span className="truncate text-sm font-semibold">
                {account.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {account.email}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              {providerLabel}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
