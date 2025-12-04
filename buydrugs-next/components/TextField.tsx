import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type FieldState = "default" | "success" | "error";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  state?: FieldState;
}

const stateStyles: Record<FieldState, string> = {
  default:
    "border-(--border-default) focus-visible:border-(--border-focus) focus-visible:ring-[rgba(89,71,255,0.18)]",
  success:
    "border-[rgba(18,183,106,0.4)] focus-visible:border-[var(--text-success)] focus-visible:ring-[rgba(18,183,106,0.18)]",
  error:
    "border-(--action-destructive) focus-visible:border-(--action-destructive) focus-visible:ring-[rgba(240,68,56,0.18)]",
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      helperText,
      errorText,
      leadingIcon,
      trailingIcon,
      state = "default",
      className,
      id,
      disabled,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const resolvedState = errorText ? "error" : state;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
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
          {leadingIcon && (
            <span className="pointer-events-none absolute left-4 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center text-(--text-tertiary)">
              {leadingIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={resolvedState === "error"}
            className={cn(
              "w-full rounded-sm border bg-(--surface-elevated) px-4 py-3 text-sm text-(--text-primary) placeholder:text-(--text-tertiary) transition focus-visible:outline-none focus-visible:ring-4",
              leadingIcon ? "pl-11" : "",
              trailingIcon ? "pr-11" : "",
              disabled
                ? "cursor-not-allowed border-(--border-subtle) bg-(--surface-muted) text-(--text-tertiary) opacity-70"
                : stateStyles[resolvedState],
              className
            )}
            {...rest}
          />
          {trailingIcon && (
            <span className="pointer-events-none absolute right-4 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center text-(--text-tertiary)">
              {trailingIcon}
            </span>
          )}
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

TextField.displayName = "TextField";






