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
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor={id} className="w-full text-right">
        {label}
      </Label>
      <div className="relative w-full">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          dir="ltr"
          className="ps-10 pe-10 text-left"
          {...props}
        />
        <Lock className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {visible ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}
