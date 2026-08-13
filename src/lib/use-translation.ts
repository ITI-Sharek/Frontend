/**
 * Type-safe i18n hook re-exported from react-i18next.
 *
 * Usage:
 *   const { t } = useTranslation();
 *   t("common.save")          // type-safe key
 *   t("home.greeting", { name: "Ahmed" })   // with interpolation
 */
import { useTranslation as useTranslationBase } from "react-i18next";

import type ar from "../../messages/ar.json";

// Derive the key type from the Arabic source-of-truth file.
export type TranslationKeys = keyof typeof ar;

/**
 * Drop-in replacement for react-i18next's `useTranslation`.
 * Adds no runtime overhead; purely a re-export for import consistency.
 */
export const useTranslation = useTranslationBase;
export { useTranslationBase };

// Re-export i18n instance so callers don't need to import from the lib file.
export { default as i18n } from "./i18n";
