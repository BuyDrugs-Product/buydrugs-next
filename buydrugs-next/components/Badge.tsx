import React from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "neutral" | "brand" | "success" | "danger";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number | string;
  variant?: BadgeVariant;
  soft?: boolean;
}

const variantMap: Record<BadgeVariant, { bg: string; color: string }> = {
  neutral: {
    bg: "bg-(--surface-muted)",
    color: "text-(--text-primary)",
  },
  brand: {
    bg: "bg-[rgba(89,71,255,0.10)]",
    color: "text-(--text-brand)",
  },
  success: {
    bg: "bg-[rgba(18,183,106,0.12)]",
    color: "text-[var(--text-success)]",
  },
  danger: {
    bg: "bg-[rgba(240,68,56,0.12)]",
    color: "text-[var(--text-danger)]",
  },
};

export const Badge: React.FC<BadgeProps> = ({
  count,
  variant = "neutral",
  className,
  soft = true,
  ...rest
}) => {
  const { bg, color } = variantMap[variant];

  return (
    <span
      className={cn(
        "inline-flex min-w-[28px] items-center justify-center rounded-sm px-3 py-1 text-sm font-semibold shadow-(--shadow-1)",
        soft ? `${bg} ${color}` : "bg-(--text-primary) text-white",
        className
      )}
      {...rest}
    >
      {count}
    </span>
  );
};

