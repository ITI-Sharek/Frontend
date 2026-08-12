import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

import { AppProviders } from "@/providers/app-providers";

// Initialize i18n early.
import "@/lib/i18n";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#ffffff" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <AppProviders>
          <DocumentLangSync />
          {children}
        </AppProviders>
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Syncs the <html> element's `lang` and `dir` attributes with the active
 * i18next language. Runs client-side only — SSR renders the defaults (ar/rtl)
 * which are then updated on hydration.
 */
function DocumentLangSync() {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "ar";
  const dir = lang === "en" ? "ltr" : "rtl";

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", dir);
  }, [lang, dir]);

  return null;
}
