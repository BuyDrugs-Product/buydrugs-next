import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type CheckboxState = "default" | "error" | "success";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  state?: CheckboxState;
}

const stateBorder: Record<CheckboxState, string> = {
  default: "border-[var(--border-default)]",
  error: "border-[var(--action-destructive)]",
  success: "border-[var(--text-success)]",
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, id, state = "default", disabled, ...rest }, ref) => {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          "flex cursor-pointer items-start gap-3",
          disabled ? "cursor-not-allowed opacity-60" : "",
          className
        )}
      >
        <span className="relative inline-flex shrink-0">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "peer h-5 w-5 appearance-none rounded-xs border bg-(--surface-elevated) transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-(--surface-elevated)",
              stateBorder[state]
            )}
            {...rest}
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-(--action-on-primary) opacity-0 transition peer-checked:opacity-100">
            <span className="flex h-4 w-4 items-center justify-center rounded-[6px] bg-(--action-primary)">
              <CheckIcon />
            </span>
          </span>
        </span>
        {(label || description) && (
          <span className="flex flex-col">
            {label && (
              <span className="text-sm font-semibold text-(--text-primary)">
                {label}
              </span>
            )}
            {description && (
              <span className="text-sm text-(--text-secondary)">
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);


