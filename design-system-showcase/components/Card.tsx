import React from "react";
import { cn } from "@/lib/cn";

type CardPadding = "sm" | "md" | "lg";
type CardElevation = "none" | "sm" | "md";
type CardSurface = "elevated" | "muted" | "subtle";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  elevation?: CardElevation;
  surface?: CardSurface;
  interactive?: boolean;
}

const paddingMap: Record<CardPadding, string> = {
  sm: "p-5 md:p-6",
  md: "p-6 md:p-7",
  lg: "p-7 md:p-8",
};

const surfaceMap: Record<CardSurface, string> = {
  elevated: "bg-[var(--surface-elevated)]",
  muted: "bg-[var(--surface-muted)]",
  subtle: "bg-[var(--surface-app-strong)]",
};

const elevationMap: Record<CardElevation, string> = {
  none: "shadow-none border border-[var(--border-subtle)]",
  sm: "shadow-[var(--shadow-1)]",
  md: "shadow-[var(--shadow-card)]",
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "md",
  elevation = "md",
  surface = "elevated",
  interactive = false,
  ...rest
}) => {
  return (
    <div
      className={cn(
        "rounded-xl transition-transform duration-150",
        paddingMap[padding],
        surfaceMap[surface],
        elevationMap[elevation],
        interactive
          ? "hover:-translate-y-0.5 hover:shadow-(--shadow-card) focus-within:-translate-y-0.5 focus-within:shadow-(--shadow-card)"
          : "",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

