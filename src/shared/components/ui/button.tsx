import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex touch-manipulation cursor-pointer items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-semibold leading-none",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out",
    "active:translate-y-px",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
  ],
  {
    variants: {
      variant: {
        /* The platform acting. Solid indigo, one per view. */
        primary:
          "rounded-input bg-primary text-primary-foreground shadow-[var(--shadow-primary)] hover:bg-primary-hover",
        /*
         * Reserved for actions that record proven work — submitting a
         * delivery, approving one. Teal is the evidence hue, so it never
         * appears on an ordinary action.
         */
        evidence:
          "rounded-input bg-evidence-teal text-evidence-teal-foreground hover:brightness-[0.94]",
        outline:
          "rounded-input border border-border-strong bg-card text-foreground hover:border-primary/45 hover:bg-primary-soft",
        subtle:
          "rounded-input bg-surface-fog text-foreground hover:bg-surface-muted",
        ghost:
          "rounded-input text-muted-foreground hover:bg-surface-fog hover:text-foreground",
        destructive:
          "rounded-input bg-destructive text-white hover:brightness-[0.92] focus-visible:ring-destructive",
        /* Inline text action — reads as a link, hits like a button. */
        link: "rounded-sm text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-11 px-4 py-2.5 text-sm",
        sm: "min-h-9 px-3.5 py-2 text-[13px]",
        lg: "min-h-12 px-6 py-3 text-[15px]",
        icon: "size-10",
        xs: "min-h-7 px-2 py-1 text-xs",
        "icon-xs": "size-6 p-0",
        "icon-sm": "size-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

interface ButtonProps
  extends
    React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
