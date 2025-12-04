import React from "react";
import { cn } from "@/lib/cn";

type ProgressStatus = "brand" | "success" | "warning" | "danger" | "info";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  thickness?: number;
  showLabel?: boolean;
  status?: ProgressStatus;
  ariaLabel?: string;
}

const statusColorMap: Record<ProgressStatus, string> = {
  brand: "var(--action-primary)",
  success: "var(--text-success)",
  warning: "var(--action-warning)",
  danger: "var(--action-destructive)",
  info: "var(--action-info)",
};

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 48,
  thickness = 6,
  showLabel = true,
  status = "brand",
  ariaLabel,
}) => {
  const radius = (size - thickness) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-label={ariaLabel ?? `Progress ${progress}%`}
    >
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-subtle)"
          strokeWidth={thickness}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={statusColorMap[status]}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "text-xs font-semibold",
              status === "brand" ? "text-(--text-primary)" : "text-(--text-primary)"
            )}
          >
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

