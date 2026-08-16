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
      <Label htmlFor={id} className="w-full text-right text-xs font-medium text-foreground">
        {label}
      </Label>
      <div className="relative w-full">
        <Input
          id={id}
          dir={dir}
          className={cn(
            "h-9 text-xs sm:text-sm pe-4 ps-9",
            dir === "rtl" ? "text-right" : "text-left",
            className,
          )}
          {...props}
        />
        <Icon
          className="absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
