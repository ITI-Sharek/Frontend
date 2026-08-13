import { MotionConfig } from "framer-motion";
import { I18nextProvider } from "react-i18next";

import i18n from "@/lib/i18n";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { NotificationsProvider } from "@/providers/notifications-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <MotionConfig reducedMotion="user">
        <QueryProvider>
          <ThemeProvider>
            <NotificationsProvider>{children}</NotificationsProvider>
          </ThemeProvider>
        </QueryProvider>
      </MotionConfig>
    </I18nextProvider>
  );
}
