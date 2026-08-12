import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

export const SUPPORTED_LANGUAGES = ["ar", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  ar: "العربية",
  en: "English",
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    fallbackLng: "ar",
    defaultNS: "translation",
    supportedLngs: [...SUPPORTED_LANGUAGES],

    detection: {
      // Persist to localStorage; read back on next load.
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "sharek-lang",
      caches: ["localStorage"],
    },

    interpolation: {
      // React already escapes values.
      escapeValue: false,
    },
  });

export default i18n;
