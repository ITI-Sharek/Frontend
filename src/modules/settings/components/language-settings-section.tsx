import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";

/** Settings → "Language": connects to react-i18next and persists via localStorage. */
export function LanguageSettingsSection() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.startsWith("en") ? "en" : "ar";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          {t("settings.language.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.language.description")}
        </p>
      </div>
      <div className="flex gap-2">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang}
            type="button"
            lang={lang}
            dir={lang === "ar" ? "rtl" : "ltr"}
            aria-pressed={currentLang === lang}
            onClick={() => void i18n.changeLanguage(lang)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              currentLang === lang
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-input-bg text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {t(`settings.language.options.${lang}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
