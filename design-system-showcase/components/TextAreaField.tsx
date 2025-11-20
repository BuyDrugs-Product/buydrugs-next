import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type FieldState = "default" | "success" | "error";

interface TextAreaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  state?: FieldState;
  minRows?: number;
}

const stateStyles: Record<FieldState, string> = {
  default:
    "border-[var(--border-default)] focus-visible:border-[var(--border-focus)] focus-visible:ring-[rgba(89,71,255,0.18)]",
  success:
    "border-[rgba(18,183,106,0.4)] focus-visible:border-[var(--text-success)] focus-visible:ring-[rgba(18,183,106,0.18)]",
  error:
    "border-[var(--action-destructive)] focus-visible:border-[var(--action-destructive)] focus-visible:ring-[rgba(240,68,56,0.18)]",
};

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  (
    {
      label,
      helperText,
      errorText,
      className,
      id,
      state = "default",
      disabled,
      minRows = 3,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const resolvedState = errorText ? "error" : state;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "text-sm font-medium",
              disabled
                ? "text-[var(--text-tertiary)]"
                : "text-[var(--text-primary)]"
            )}
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={minRows}
          disabled={disabled}
          aria-invalid={resolvedState === "error"}
          className={cn(
            "w-full resize-none rounded-[var(--radius-sm)] border bg-[var(--surface-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition focus-visible:outline-none focus-visible:ring-4",
            disabled
              ? "cursor-not-allowed border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-tertiary)] opacity-70"
              : stateStyles[resolvedState],
            className
          )}
          {...rest}
        />
        {(helperText || errorText) && (
          <p
            className={cn(
              "text-xs",
              errorText
                ? "text-[var(--action-destructive)]"
                : "text-[var(--text-secondary)]"
            )}
          >
            {errorText ?? helperText}
          </p>
        )}
      </div>
    );
  }
);

TextAreaField.displayName = "TextAreaField";






