import { MessageCircle } from "lucide-react";

/** Placeholder trigger — direct messaging isn't built yet. */
export function MessagesButton() {
  return (
    <span
      aria-disabled="true"
      title="الرسائل — قريباً"
      className="relative inline-flex size-10 cursor-not-allowed items-center justify-center rounded-input border border-border bg-card text-muted-foreground opacity-60"
    >
      <MessageCircle className="size-4.5" aria-hidden="true" />
      <span className="sr-only">الرسائل، قريباً</span>
    </span>
  );
}
