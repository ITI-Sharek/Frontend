import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { getPostLoginPath, ROUTES } from "@/config/routes.config";
import {
  AuthHero,
  getCurrentUser,
  LoginForm,
} from "@/modules/auth";
import type { AuthSessionDto, AuthUserDto } from "@/modules/auth";
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
  const navigate = useNavigate();
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [retryUser, setRetryUser] = useState<AuthUserDto | null>(null);

  async function navigateAfterAuth(user: AuthUserDto) {
    if (shouldEnsureContributorProfile(user)) {
      const profile = await ensureCurrentContributorProfile();
      navigate({ to: ROUTES.contributorProfile(profile.username) });
      return;
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
      setSessionError("تم تسجيل الدخول لكن تعذر فتح ملف المساهم.");
    }
  }

  useEffect(() => {
    if (storageService.getAccessToken() === null) return;

    let isActive = true;

    getCurrentUser()
      .then(async (user) => {
        if (!isActive) return;

        setRetryUser(user);
        try {
          await navigateAfterAuth(user);
        } catch {
          setSessionError("تم تسجيل الدخول لكن تعذر فتح ملف المساهم.");
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
      <AuthHero heading="مرحباً بك مجدداً" subtext="سجل دخولك" />
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
            setSessionError("تم تسجيل الدخول لكن تعذر فتح ملف المساهم.");
          }
        }}
      />
    </>
  );
}
