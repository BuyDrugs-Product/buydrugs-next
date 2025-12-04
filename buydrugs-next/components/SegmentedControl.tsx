import React from "react";
import { cn } from "@/lib/cn";

export interface SegmentedOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
  ariaLabel?: string;
}

const sizeClasses = {
  sm: "h-9 text-sm",
  md: "h-10 text-sm md:text-base",
};

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  size = "md",
  ariaLabel,
}) => {
  return (
    <div
      className={cn(
        "inline-flex rounded-pill bg-(--surface-muted) p-1 shadow-(--shadow-1)"
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative inline-flex items-center justify-center rounded-pill px-4 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-muted)",
              sizeClasses[size],
              selected
                ? "bg-(--surface-elevated) text-(--text-brand) shadow-(--shadow-1)"
                : "text-(--text-secondary) hover:text-(--text-primary)"
            )}
          >
            {option.icon && (
              <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
                {option.icon}
              </span>
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};






