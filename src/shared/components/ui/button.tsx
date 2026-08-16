import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex touch-manipulation cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "rounded-input bg-primary text-primary-foreground shadow-[0_2px_8px_-2px_rgba(59,79,216,0.4)] hover:bg-primary/88 dark:shadow-[0_4px_12px_-4px_rgba(124,146,255,0.4)]",
        outline:
          "rounded-input border border-border bg-card text-foreground hover:border-primary/35 hover:bg-primary/[0.035]",
        ghost:
          "rounded-input text-muted-foreground hover:bg-surface-fog hover:text-foreground",
        destructive:
          "rounded-input bg-destructive text-white hover:bg-destructive/85 focus-visible:ring-destructive",
      },
      size: {
        default: "min-h-11 px-4 py-2.5 text-sm",
        sm: "min-h-10 px-4 py-2 text-sm",
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
