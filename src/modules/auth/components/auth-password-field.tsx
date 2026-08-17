import { Eye, EyeOff, Lock } from "lucide-react";
import { useId, useState } from "react";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface AuthPasswordFieldProps
  extends Omit<React.ComponentProps<"input">, "type" | "id"> {
  label: string;
}

export function AuthPasswordField({ label, ...props }: AuthPasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex w-full flex-col gap-1">
      <Label htmlFor={id} className="w-full text-start text-xs font-medium text-foreground">
        {label}
      </Label>
      <div className="relative w-full">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          dir="ltr"
          className="h-10 text-xs sm:text-sm ps-9 pe-9 text-left"
          {...props}
        />
        {/* Lock on the start edge, reveal toggle on the end edge — matching
            the `ps-9 pe-9` gutters in both text directions. */}
        <Lock
          className="pointer-events-none absolute top-1/2 start-3 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute top-1/2 end-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {visible ? (
            <EyeOff className="size-3.5" aria-hidden="true" />
          ) : (
            <Eye className="size-3.5" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
