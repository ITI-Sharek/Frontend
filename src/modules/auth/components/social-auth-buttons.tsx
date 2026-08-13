import { Github } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";

import {
  getSocialAuthProviderLabel,
  startSocialAuth,
} from "../services/social-auth.service";
import type {
  SocialAuthIntent,
  SocialAuthProvider,
  SocialAuthRole,
} from "../services/social-auth.service";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.42 3.58v2.98h3.91c2.29-2.11 3.53-5.22 3.53-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.91-2.98c-1.08.72-2.46 1.15-4.02 1.15-3.1 0-5.72-2.09-6.66-4.9H1.3v3.07C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.34 14.36A7.2 7.2 0 0 1 4.96 12c0-.82.14-1.61.38-2.36V6.57H1.3A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.3 5.43l4.04-3.07z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.45-3.45C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.57l4.04 3.07c.94-2.81 3.56-4.89 6.66-4.89z"
      />
    </svg>
  );
}

interface SocialAuthButtonsProps {
  intent?: SocialAuthIntent;
  /**
   * Used by the backend only when a new Share-k user must be created
   * (register intent — pass the role the user chose in step 1). Existing
   * users keep their saved role.
   */
  role?: SocialAuthRole;
}

export function SocialAuthButtons({
  intent = "login",
  role = "contributor",
}: SocialAuthButtonsProps) {
  const { t } = useTranslation();
  const [activeProvider, setActiveProvider] =
    useState<SocialAuthProvider | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSocialAuth(provider: SocialAuthProvider) {
    const providerLabel = getSocialAuthProviderLabel(provider);
    setActiveProvider(provider);
    setMessage(
      provider === "github"
        ? t("auth.openingGithubLogin")
        : t("auth.openingProviderLogin", { provider: providerLabel }),
    );

    try {
      await startSocialAuth(provider, intent, role);
    } catch {
      setActiveProvider(null);
      setMessage(t("auth.socialAuthError", { provider: providerLabel }));
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full gap-4" dir="ltr">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={activeProvider !== null}
          onClick={() => handleSocialAuth("github")}
        >
          <span>
            {activeProvider === "github"
              ? t("auth.openingInProgress")
              : "GitHub"}
          </span>
          <Github className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={activeProvider !== null}
          onClick={() => handleSocialAuth("google")}
        >
          <span>
            {activeProvider === "google"
              ? t("auth.openingInProgress")
              : "Google"}
          </span>
          <GoogleIcon />
        </Button>
      </div>

      {message && (
        <p
          className="text-right text-xs leading-5 text-muted-foreground"
          role="status"
        >
          {message}
        </p>
      )}

      <p className="text-right text-xs leading-5 text-muted-foreground">
        {t("auth.githubIdentityNote")}
      </p>
    </div>
  );
}
