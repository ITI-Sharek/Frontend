import type { LucideIcon } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/lib/utils";

interface AuthTextFieldProps extends React.ComponentProps<"input"> {
  label: string;
  icon: LucideIcon;
}

export function AuthTextField({
  label,
  icon: Icon,
  id,
  className,
  dir = "ltr",
  ...props
}: AuthTextFieldProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      <Label htmlFor={id} className="w-full text-start text-xs font-medium text-foreground">
        {label}
      </Label>
      <div className="relative w-full">
        <Input
          id={id}
          dir={dir}
          className={cn(
            "h-10 text-xs sm:text-sm pe-4 ps-9",
            dir === "rtl" ? "text-right" : "text-left",
            className,
          )}
          {...props}
        />
        {/*
         * The input reserves its icon gutter with `ps-9`, so the icon has to
         * sit on the start edge too. It was pinned to `right-3`, which put it
         * on the opposite side from its own padding under the English layout
         * and left the placeholder indented against empty space.
         */}
        <Icon
          className="pointer-events-none absolute top-1/2 start-3 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
