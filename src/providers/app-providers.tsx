// Initialize i18n before anything else renders.
import i18n from "@/lib/i18n";

import { I18nextProvider } from "react-i18next";

import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { NotificationsProvider } from "@/providers/notifications-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryProvider>
        <ThemeProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
        </ThemeProvider>
      </QueryProvider>
    </I18nextProvider>
  );
}
