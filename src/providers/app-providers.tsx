import { MotionConfig } from "framer-motion";

import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { NotificationsProvider } from "@/providers/notifications-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <QueryProvider>
        <ThemeProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
        </ThemeProvider>
      </QueryProvider>
    </MotionConfig>
  );
}
