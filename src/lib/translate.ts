import type { TOptions } from "i18next";

import i18n from "./i18n";

/**
 * For presenters and non-React utilities. The locale boundary remounts the
 * route tree after a language change, so callers always read the active copy.
 */
export function translate(key: string, options?: TOptions) {
  return i18n.t(key, options);
}

export function activeLocale() {
  return i18n.language.startsWith("en") ? "en" : "ar";
}
