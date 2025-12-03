import React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "success";

type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-elevated)] rounded-[var(--radius-sm)] disabled:pointer-events-none disabled:opacity-50";

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-8 px-3 text-xs",
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-12 px-6 text-lg",
};

const iconOnlyClasses: Record<ButtonSize, string> = {
  xs: "px-0 w-8",
  sm: "px-0 w-9",
  md: "px-0 w-11",
  lg: "px-0 w-12",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--action-primary)] text-[var(--action-on-primary)] shadow-[var(--shadow-2)] hover:bg-[var(--action-primary-hover)] active:bg-[var(--action-primary-active)]",
  secondary:
    "bg-[var(--action-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-[var(--shadow-1)] hover:bg-[var(--action-secondary-hover)] active:bg-[var(--action-secondary-active)]",
  outline:
    "bg-transparent text-[var(--text-brand)] border border-[var(--action-outline-border)] hover:bg-[var(--action-outline)] active:bg-[var(--state-active)]",
  ghost:
    "bg-transparent text-[var(--text-primary)] hover:bg-[var(--action-ghost-hover)] active:bg-[var(--state-active)]",
  destructive:
    "bg-[var(--action-destructive)] text-[var(--action-on-destructive)] shadow-[var(--shadow-1)] hover:bg-[var(--action-destructive-hover)] active:bg-[var(--action-destructive-active)]",
  success:
    "rounded-full bg-[rgba(18,183,106,0.12)] text-[var(--text-success)] hover:bg-[rgba(18,183,106,0.18)] active:bg-[rgba(18,183,106,0.24)]",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  children,
  className,
  fullWidth,
  ...props
}) => {
  const iconOnly = Boolean(icon && !children);

  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        iconOnly ? iconOnlyClasses[size] : undefined,
        fullWidth ? "w-full" : undefined,
        className
      )}
      {...props}
    >
      {icon && (
        <span className="inline-flex h-5 w-5 items-center justify-center">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};

