import { Mail, User } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { UsernameAvailabilityReason } from "../../types/auth.types";
import type { SignupRole } from "../../types/signup.types";
import { REGISTER_USERNAME_FIELD_ENABLED } from "../../constants/signup.constants";
import { AuthDivider } from "../auth-divider";
import { AuthPasswordField } from "../auth-password-field";
import { AuthTextField } from "../auth-text-field";
import { SocialAuthButtons } from "../social-auth-buttons";
import { UsernameField } from "../username-field";

interface AccountStepProps {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: SignupRole | null;
  onChange: (
    field: "firstName" | "lastName" | "username" | "email" | "password",
    value: string,
  ) => void;
  usernameStatus: {
    formatValid: boolean;
    isChecking: boolean;
    checkFailed: boolean;
    available: boolean | null;
    reason: UsernameAvailabilityReason | null;
    suggestion: string | null;
  };
}

export function AccountStep({
  firstName,
  lastName,
  username,
  email,
  password,
  role,
  onChange,
  usernameStatus,
}: AccountStepProps) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex flex-col gap-0.5 text-right">
        <h2 className="text-sm font-bold text-foreground">
          {t("register.account.title")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("register.account.subtitle")}
        </p>
      </div>

      <SocialAuthButtons intent="register" role={role ?? "contributor"} />
      <AuthDivider label={t("register.account.orViaEmail")} />

      <div className="grid w-full grid-cols-2 gap-2">
        <AuthTextField
          id="firstName"
          label={t("register.account.firstName")}
          icon={User}
          dir="rtl"
          placeholder={t("register.account.firstNamePlaceholder")}
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
        />
        <AuthTextField
          id="lastName"
          label={t("register.account.lastName")}
          icon={User}
          dir="rtl"
          placeholder={t("register.account.lastNamePlaceholder")}
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
        />
      </div>
      {REGISTER_USERNAME_FIELD_ENABLED && (
        <UsernameField
          id="username"
          value={username}
          onChange={(value) => onChange("username", value)}
          formatValid={usernameStatus.formatValid}
          isChecking={usernameStatus.isChecking}
          checkFailed={usernameStatus.checkFailed}
          available={usernameStatus.available}
          reason={usernameStatus.reason}
          suggestion={usernameStatus.suggestion}
          onUseSuggestion={(suggestion) => onChange("username", suggestion)}
        />
      )}
      <AuthTextField
        id="email"
        label={t("auth.email")}
        icon={Mail}
        placeholder="name@company.com"
        autoComplete="email"
        value={email}
        onChange={(e) => onChange("email", e.target.value)}
      />
      <AuthPasswordField
        label={t("auth.password")}
        autoComplete="new-password"
        value={password}
        onChange={(e) => onChange("password", e.target.value)}
      />
    </div>
  );
}
