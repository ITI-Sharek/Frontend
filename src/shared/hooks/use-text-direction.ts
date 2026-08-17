import { useTranslation } from "react-i18next";

/**
 * The reading direction of the active language.
 *
 * Layouts that pin a grid's column order with `dir="ltr"` still need their
 * text children to follow the language. Those children were hard-coded to
 * `dir="rtl"`, which forced Arabic punctuation and alignment onto the English
 * UI — sentences rendered with the full stop at the front. Use this instead of
 * a literal so the two concerns stay separate: `dir="ltr"` for column order,
 * `dir={useTextDirection()}` for prose.
 */
export function useTextDirection(): "ltr" | "rtl" {
  const { i18n } = useTranslation();
  return i18n.language.startsWith("en") ? "ltr" : "rtl";
}
