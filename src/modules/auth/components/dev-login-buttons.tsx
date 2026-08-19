import { useTranslation } from "react-i18next";

interface DevAutoFillLinksProps {
  onAutoFill: (credentials: { email: string; password: string }) => void;
}

const DEV_ACCOUNTS: Array<{
  id: string;
  labelKey: string;
  email: string;
  password: string;
}> = [
  {
    id: "contributor",
    labelKey: "contributor",
    email: "contributor@sharek.local",
    password: "Admin@1234",
  },
  {
    id: "goldContributor",
    labelKey: "goldContributor",
    email: "gold-contributor@sharek.local",
    password: "Admin@1234",
  },
  {
    id: "goldNoMatches",
    labelKey: "goldNoMatches",
    email: "gold-no-matches@sharek.local",
    password: "Admin@1234",
  },
  {
    id: "goldNoSkills",
    labelKey: "goldNoSkills",
    email: "gold-no-skills@sharek.local",
    password: "Admin@1234",
  },
  {
    id: "owner",
    labelKey: "owner",
    email: "owner@sharek.local",
    password: "Admin@1234",
  },
  {
    id: "admin",
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
        <span key={account.id} className="inline-flex items-center gap-1.5">
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
