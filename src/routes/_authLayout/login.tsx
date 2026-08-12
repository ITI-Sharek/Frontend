import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getPostLoginPath, ROUTES } from "@/config/routes.config";
import {
  AuthHero,
  getCurrentUser,
  LoginForm,
} from "@/modules/auth";
import type { AuthSessionDto, AuthUserDto } from "@/modules/auth";
import { isDemoSocialAuthToken } from "@/modules/auth/services/social-auth.service";
import {
  ContributorProfileErrorView,
  ensureCurrentContributorProfile,
} from "@/modules/contributors";
import { storageService } from "@/services/storage.service";
import { shouldEnsureContributorProfile } from "./login.helpers";

export const Route = createFileRoute("/_authLayout/login")({
  head: () => ({
    meta: [{ title: "تسجيل الدخول | Sharek" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [retryUser, setRetryUser] = useState<AuthUserDto | null>(null);

  async function navigateAfterAuth(user: AuthUserDto) {
    if (shouldEnsureContributorProfile(user)) {
      const profile = await ensureCurrentContributorProfile();
      storageService.setUsername(profile.username);
      navigate({ to: ROUTES.contributorProfile(profile.username) });
      return;
    }

    if (user.username) {
      storageService.setUsername(user.username);
    }
    navigate({ to: getPostLoginPath(user) });
  }

  async function handleLoginSuccess(session: AuthSessionDto) {
    setRetryUser(session.user);
    await navigateAfterAuth(session.user);
  }

  async function retryContributorProfileNavigation() {
    if (!retryUser) return;

    try {
      setSessionError(null);
      await navigateAfterAuth(retryUser);
    } catch {
      setSessionError(t("auth.sessionLoginError"));
    }
  }

  useEffect(() => {
    const accessToken = storageService.getAccessToken();
    if (accessToken === null) return;

    if (isDemoSocialAuthToken(accessToken)) {
      storageService.clearTokens();
      return;
    }

    let isActive = true;

    getCurrentUser()
      .then(async (user) => {
        if (!isActive) return;

        setRetryUser(user);
        try {
          await navigateAfterAuth(user);
        } catch {
          setSessionError(t("auth.sessionLoginError"));
        }
      })
      .catch(() => {
        storageService.clearTokens();
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <>
      <AuthHero heading={t("auth.loginHero")} subtext={t("auth.loginSubtext")} />
      {sessionError && (
        <ContributorProfileErrorView
          message={sessionError}
          onRetry={retryContributorProfileNavigation}
        />
      )}
      <LoginForm
        onLoginSuccess={async (session) => {
          try {
            setSessionError(null);
            await handleLoginSuccess(session);
          } catch {
            setRetryUser(session.user);
            setSessionError(t("auth.sessionLoginError"));
          }
        }}
      />
    </>
  );
}
