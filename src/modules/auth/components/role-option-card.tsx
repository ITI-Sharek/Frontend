import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface RoleOptionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
}

export function RoleOptionCard({
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
}: RoleOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative flex w-full flex-col items-start gap-2 rounded-input border p-4 text-start transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-input-bg hover:border-primary/50",
      )}
    >
      {selected && (
        <span className="absolute top-3 end-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3" />
        </span>
      )}
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-full",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-border/40 text-foreground",
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="font-semibold text-foreground">{title}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </button>
  );
}
