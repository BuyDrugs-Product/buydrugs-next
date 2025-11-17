import React from "react";
import { cn } from "@/lib/cn";

type ChipVariant = "neutral" | "tag" | "brand" | "success" | "outline";
type ChipSize = "sm" | "md";

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const sizeMap: Record<ChipSize, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
};

const variantMap: Record<ChipVariant, string> = {
  neutral:
    "bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border-subtle)]",
  tag:
    "bg-[var(--action-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)]",
  brand:
    "bg-[rgba(89,71,255,0.10)] text-[var(--text-brand)] border border-[rgba(89,71,255,0.24)]",
  success:
    "bg-[rgba(18,183,106,0.12)] text-[var(--text-success)] border border-[rgba(18,183,106,0.24)]",
  outline:
    "bg-transparent text-[var(--text-secondary)] border border-[var(--border-default)]",
};

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = "neutral",
  size = "md",
  leadingIcon,
  trailingIcon,
  className,
  ...rest
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium shadow-[var(--shadow-1)] transition-colors",
        sizeMap[size],
        variantMap[variant],
        className
      )}
      {...rest}
    >
      {leadingIcon && (
        <span className="inline-flex h-4 w-4 items-center justify-center">
          {leadingIcon}
        </span>
      )}
      <span className="truncate">{label}</span>
      {trailingIcon && (
        <span className="inline-flex h-4 w-4 items-center justify-center">
          {trailingIcon}
        </span>
      )}
    </span>
  );
};

