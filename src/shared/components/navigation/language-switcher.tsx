import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from "@/lib/i18n";

/**
 * Compact language switcher button group.
 * Persists the chosen language to localStorage via i18next's LanguageDetector.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language.startsWith("en") ? "en" : "ar";

  function handleChange(lang: string) {
    if (lang === currentLang) return;
    void i18n.changeLanguage(lang);
  }

  return (
    <div
      role="group"
      aria-label={t("languageSwitcher.ariaLabel")}
      className={cn("flex items-center gap-0.5", className)}
    >
      <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = lang === currentLang;
        return (
          <button
            key={lang}
            type="button"
            aria-pressed={isActive}
            lang={lang}
            dir={lang === "ar" ? "rtl" : "ltr"}
            onClick={() => handleChange(lang)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {LANGUAGE_LABELS[lang]}
          </button>
        );
      })}
    </div>
  );
}
