import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type FieldState = "default" | "error" | "success";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  state?: FieldState;
  options: SelectOption[];
}

const stateStyles: Record<FieldState, string> = {
  default:
    "border-(--border-default) focus-visible:border-(--border-focus) focus-visible:ring-[rgba(89,71,255,0.18)]",
  success:
    "border-[rgba(18,183,106,0.4)] focus-visible:border-[var(--text-success)] focus-visible:ring-[rgba(18,183,106,0.18)]",
  error:
    "border-(--action-destructive) focus-visible:border-(--action-destructive) focus-visible:ring-[rgba(240,68,56,0.18)]",
};

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    { label, helperText, errorText, state = "default", options, className, id, disabled, ...rest },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const resolvedState = errorText ? "error" : state;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              "text-sm font-medium",
              disabled
                ? "text-(--text-tertiary)"
                : "text-(--text-primary)"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full appearance-none rounded-sm border bg-(--surface-elevated) px-4 py-3 text-sm text-(--text-primary) transition focus-visible:outline-none focus-visible:ring-4",
              disabled
                ? "cursor-not-allowed border-(--border-subtle) bg-(--surface-muted) text-(--text-tertiary) opacity-70"
                : stateStyles[resolvedState],
              className
            )}
            {...rest}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 inline-flex h-4 w-4 -translate-y-1/2 items-center justify-center text-(--text-tertiary)">
            <ChevronDown />
          </span>
        </div>
        {(helperText || errorText) && (
          <p
            className={cn(
              "text-xs",
              errorText
                ? "text-(--action-destructive)"
                : "text-(--text-secondary)"
            )}
          >
            {errorText ?? helperText}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";

const ChevronDown = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);






