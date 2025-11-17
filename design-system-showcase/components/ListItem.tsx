import React from "react";
import { cn } from "@/lib/cn";

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  leading?: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  dense?: boolean;
  interactive?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  leading,
  title,
  subtitle,
  trailing,
  dense = false,
  interactive = true,
  className,
  onClick,
  ...rest
}) => {
  const WrapperComponent = "div";

  return (
    <WrapperComponent
      className={cn(
        "flex items-center gap-4 rounded-[var(--radius-md)] transition-colors",
        dense ? "px-4 py-3" : "px-5 py-4",
        interactive
          ? "hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-elevated)]"
          : "",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...rest}
    >
      {leading && <div className="flex-shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </div>
        {subtitle && (
          <div className="text-sm text-[var(--text-secondary)]">{subtitle}</div>
        )}
      </div>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </WrapperComponent>
  );
};

