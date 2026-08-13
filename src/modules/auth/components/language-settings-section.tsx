import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import { useUpdateCurrentUserPreferencesMutation } from "../api/mutations/use-current-user-preferences-mutation";
import { useCurrentUserQuery } from "../api/queries/use-current-user-query";

const LANGUAGES = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
] as const;

export function LanguageSettingsSection() {
  const { t, i18n } = useTranslation();
  const currentUserQuery = useCurrentUserQuery();
  const updateLanguageMutation = useUpdateCurrentUserPreferencesMutation();
  const [language, setLanguage] = useState<"ar" | "en">(
    currentUserQuery.data?.preferredLanguage ?? "ar",
  );
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (currentUserQuery.data?.preferredLanguage) {
      setLanguage(currentUserQuery.data.preferredLanguage);
    }
  }, [currentUserQuery.data?.preferredLanguage]);

  function changeLanguage(nextLanguage: "ar" | "en") {
    if (nextLanguage === language) return;
    const languageBeforeChange = language;
    setLanguage(nextLanguage);
    void i18n.changeLanguage(nextLanguage);
    setSaveError(false);
    updateLanguageMutation.mutate(
      { preferredLanguage: nextLanguage },
      {
        onSuccess: (user) => {
          setLanguage(user.preferredLanguage);
          void i18n.changeLanguage(user.preferredLanguage);
          setSaveError(false);
        },
        onError: () => {
          setLanguage(languageBeforeChange);
          void i18n.changeLanguage(languageBeforeChange);
          setSaveError(true);
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t("settings.language.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.language.description")}
        </p>
      </div>
      <div className="flex gap-2">
        {LANGUAGES.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={language === option.value}
            disabled={updateLanguageMutation.isPending}
            onClick={() => changeLanguage(option.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              language === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-input-bg text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {updateLanguageMutation.isPending && t("settings.language.saving")}
        {(saveError || updateLanguageMutation.isError) &&
          t("settings.language.saveError")}
      </p>
    </div>
  );
}
