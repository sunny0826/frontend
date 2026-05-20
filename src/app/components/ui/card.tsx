import * as React from "react";

import { cn } from "./utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        // Frosted glass effect
        "relative flex flex-col gap-6 rounded-xl overflow-hidden",
        "bg-[#1E293B]",
        "backdrop-blur-xl backdrop-saturate-150",
        "border border-[#475569]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        "ring-1 ring-white/5",
        "text-card-foreground",
        // Subtle highlight gradient overlay at top
        "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn(
        // Bigger, bolder, tighter with gradient text
        "relative pl-3.5 text-lg font-bold tracking-tight leading-none",
        "bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent",
        // Keep child SVG icons visible (they would otherwise inherit text-transparent)
        "[&_svg]:text-emerald-400",
        "[&_svg]:[-webkit-text-fill-color:currentColor]",
        // Decorative gradient bar on the left
        "before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
        "before:h-5 before:w-1 before:rounded-full",
        "before:bg-gradient-to-b before:from-emerald-500 before:to-teal-500",
        "before:shadow-[0_0_8px_rgba(34,197,94,0.5)]",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
