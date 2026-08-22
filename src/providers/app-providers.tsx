import { MotionConfig } from "framer-motion";
import { I18nextProvider } from "react-i18next";

import i18n from "@/lib/i18n";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { NotificationsProvider } from "@/providers/notifications-provider";
import { AssignmentCallProvider } from "@/providers/assignment-call-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <MotionConfig reducedMotion="user">
        <QueryProvider>
          <ThemeProvider>
            <NotificationsProvider>
              {/*
                Inside NotificationsProvider (reads the shared socket via
                RealtimeSocketContext) and outside the router outlet
                (`{children}` below) so an active call's state and
                RTCPeerConnection survive route navigation.
              */}
              <AssignmentCallProvider>{children}</AssignmentCallProvider>
            </NotificationsProvider>
          </ThemeProvider>
        </QueryProvider>
      </MotionConfig>
    </I18nextProvider>
  );
}
