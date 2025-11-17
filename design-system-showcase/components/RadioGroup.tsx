import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  name?: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const RadioGroup = ({
  name,
  options,
  value,
  defaultValue,
  onChange,
  disabled,
  className,
  ...rest
}: RadioGroupProps) => {
  const generatedName = useId();
  const groupName = name ?? generatedName;

  return (
    <div className={cn("flex flex-col gap-3", className)} {...rest}>
      {options.map((option) => {
        const radioProps: React.InputHTMLAttributes<HTMLInputElement> = {
          name: groupName,
          value: option.value,
          onChange: (event) => onChange?.(event.target.value),
          disabled,
        };

        // Use controlled (checked) or uncontrolled (defaultChecked), but not both
        if (value !== undefined) {
          radioProps.checked = value === option.value;
        } else if (defaultValue !== undefined) {
          radioProps.defaultChecked = defaultValue === option.value;
        }

        return (
          <Radio
            key={option.value}
            label={option.label}
            description={option.description}
            {...radioProps}
          />
        );
      })}
    </div>
  );
};

interface RadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className, disabled, onChange, checked, ...rest }, ref) => {
    const generatedId = useId();
    
    return (
      <label
        htmlFor={generatedId}
        className={cn(
          "flex cursor-pointer items-start gap-3",
          disabled ? "cursor-not-allowed opacity-60" : "",
          className
        )}
      >
        <span className="relative inline-flex h-5 w-5 shrink-0">
          <input
            id={generatedId}
            type="radio"
            ref={ref}
            disabled={disabled}
            onChange={onChange}
            checked={checked}
            className={cn(
              "peer h-5 w-5 appearance-none rounded-full border-2 border-(--border-default) bg-(--surface-elevated) transition checked:border-(--action-primary) checked:bg-(--surface-elevated) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-(--surface-elevated)"
            )}
            {...rest}
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-(--action-primary) scale-0 transition-transform duration-150 peer-checked:scale-100" />
          </span>
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-(--text-primary)">
            {label}
          </span>
          {description && (
            <span className="text-sm text-(--text-secondary)">
              {description}
            </span>
          )}
        </span>
      </label>
    );
  }
);

Radio.displayName = "Radio";


