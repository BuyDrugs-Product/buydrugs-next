import React, { useState } from "react";
import { cn } from "@/lib/cn";

interface ToggleProps {
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  defaultChecked = false,
  onChange,
  label,
  disabled = false,
  id,
}) => {
  const [checked, setChecked] = useState(defaultChecked);

  const handleToggle = () => {
    if (disabled) return;
    const nextValue = !checked;
    setChecked(nextValue);
    onChange?.(nextValue);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-disabled={disabled}
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "relative h-7 w-12 rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-elevated)]",
          checked
            ? "bg-[var(--action-primary)]"
            : "bg-[var(--border-default)]",
          disabled ? "opacity-40 cursor-not-allowed" : ""
        )}
      >
        <span
          className={cn(
            "absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-[var(--surface-elevated)] shadow-[var(--shadow-1)] transition-transform duration-150",
            checked ? "translate-x-[20px]" : "translate-x-0"
          )}
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium",
            disabled ? "text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};

