import { MessageCircle } from "lucide-react";

import { ROUTES } from "@/config/routes.config";
import { Link } from "@tanstack/react-router";

export function MessagesButton({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      to={ROUTES.messages}
      aria-label={
        unreadCount > 0
          ? `فتح المحادثات، ${unreadCount} غير مقروءة`
          : "فتح المحادثات"
      }
      title="المحادثات"
      className="relative inline-flex size-10 items-center justify-center rounded-input border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <MessageCircle className="size-4.5" aria-hidden="true" />
      {unreadCount > 0 && (
        <span className="absolute -end-1 -top-1 min-w-5 rounded-full bg-destructive px-1 text-center text-[10px] font-bold leading-5 text-destructive-foreground">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
