import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2.5 text-xs font-semibold leading-none transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:size-3 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "border-primary/25 bg-primary/10 text-primary [a&]:hover:bg-primary/15",
        secondary:
          "border-border bg-secondary/75 text-secondary-foreground [a&]:hover:bg-secondary",
        destructive:
          "border-destructive/35 bg-destructive/15 text-destructive [a&]:hover:bg-destructive/20 focus-visible:ring-destructive/20",
        outline:
          "border-border bg-transparent text-foreground [a&]:hover:bg-secondary/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
