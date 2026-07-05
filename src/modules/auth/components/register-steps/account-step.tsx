import { Mail, User } from "lucide-react";

import { AuthDivider } from "../auth-divider";
import { AuthPasswordField } from "../auth-password-field";
import { AuthTextField } from "../auth-text-field";
import { SocialAuthButtons } from "../social-auth-buttons";

interface AccountStepProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  onChange: (
    field: "firstName" | "lastName" | "email" | "password",
    value: string,
  ) => void;
}

export function AccountStep({
  firstName,
  lastName,
  email,
  password,
  onChange,
}: AccountStepProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1 text-right">
        <h2 className="text-lg font-bold text-foreground">بيانات الحساب</h2>
        <p className="text-sm text-muted-foreground">
          أنشئ بيانات الدخول الخاصة بحسابك.
        </p>
      </div>

      <SocialAuthButtons />
      <AuthDivider label="أو عبر البريد" />

      <div className="grid w-full grid-cols-2 gap-4">
        <AuthTextField
          id="firstName"
          label="الاسم الأول"
          icon={User}
          dir="rtl"
          placeholder="محمد"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
        />
        <AuthTextField
          id="lastName"
          label="الاسم الأخير"
          icon={User}
          dir="rtl"
          placeholder="أحمد"
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
        />
      </div>
      <AuthTextField
        id="email"
        label="البريد الإلكتروني"
        icon={Mail}
        placeholder="name@company.com"
        autoComplete="email"
        value={email}
        onChange={(e) => onChange("email", e.target.value)}
      />
      <AuthPasswordField
        label="كلمة المرور"
        autoComplete="new-password"
        value={password}
        onChange={(e) => onChange("password", e.target.value)}
      />
    </div>
  );
}
