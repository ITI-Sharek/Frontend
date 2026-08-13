// Initialize the i18n singleton before any component test renders so that
// `useTranslation` resolves real strings instead of keys. Pin the language to
// Arabic (the source-of-truth messages file) so existing Arabic assertions
// stay deterministic regardless of the test environment's navigator locale.
import i18n from "@/lib/i18n";

await i18n.changeLanguage("ar");
