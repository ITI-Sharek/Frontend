import { useTranslation } from "react-i18next";
import type { UserRole } from "../types/auth.types";

interface DevAutoFillLinksProps {
  onAutoFill: (credentials: { email: string; password: string }) => void;
}

const DEV_ACCOUNTS: Array<{
  role: UserRole;
  labelKey: string;
  email: string;
  password: string;
}> = [
  {
    role: "contributor",
    labelKey: "contributor",
    email: "contributor@sharek.local",
    password: "Admin@1234",
  },
  {
    role: "owner",
    labelKey: "owner",
    email: "owner@sharek.local",
    password: "Admin@1234",
  },
  {
    role: "admin",
    labelKey: "admin",
    email: "admin@sharek.local",
    password: "Admin@1234",
  },
];

export function DevLoginButtons({ onAutoFill }: DevAutoFillLinksProps) {
  const { t } = useTranslation();

  if (!import.meta.env.DEV) return null;

  return (
    <div className="flex w-full items-center justify-center gap-1.5 flex-wrap text-center text-xs text-muted-foreground pt-1">
      <span className="text-[11px] opacity-75">{t("auth.devLogin.title")}:</span>
      {DEV_ACCOUNTS.map((account, index) => (
        <span key={account.role} className="inline-flex items-center gap-1.5">
          <button
            type="button"
            className="text-[11px] font-medium text-primary hover:underline focus:outline-none transition-colors"
            onClick={() => onAutoFill({ email: account.email, password: account.password })}
          >
            {t(`auth.devLogin.${account.labelKey}`)}
          </button>
          {index < DEV_ACCOUNTS.length - 1 && <span className="opacity-40">·</span>}
        </span>
      ))}
    </div>
  );
}
