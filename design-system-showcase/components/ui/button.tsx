"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Button variants adapted to the existing design system tokens so the
// shadcn-style API matches the rest of the app visually.
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-sm)] text-sm font-semibold ring-offset-[var(--surface-elevated)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[var(--state-disabled-opacity)] gap-2",
  {
    variants: {
      variant: {
        // Primary action
        default:
          "bg-[var(--action-primary)] text-[var(--action-on-primary)] shadow-[var(--shadow-2)] hover:bg-[var(--action-primary-hover)] active:bg-[var(--action-primary-active)]",
        // Destructive
        destructive:
          "bg-[var(--action-destructive)] text-[var(--action-on-destructive)] shadow-[var(--shadow-1)] hover:bg-[var(--action-destructive-hover)] active:bg-[var(--action-destructive-active)]",
        // Subtle elevated button
        outline:
          "border border-[var(--border-subtle)] bg-[var(--action-secondary)] text-[var(--text-primary)] shadow-[var(--shadow-1)] hover:bg-[var(--action-secondary-hover)] active:bg-[var(--action-secondary-active)]",
        // Secondary filled surface
        secondary:
          "bg-[var(--action-secondary)] text-[var(--text-primary)] hover:bg-[var(--action-secondary-hover)] active:bg-[var(--action-secondary-active)]",
        // Ghost / text button
        ghost:
          "bg-transparent text-[var(--text-primary)] hover:bg-[var(--action-ghost-hover)] active:bg-[var(--state-active)]",
        // Text link
        link: "text-[var(--text-brand)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-5",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };


