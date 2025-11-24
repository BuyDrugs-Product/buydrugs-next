import React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/cn';

interface PhoneInputFieldProps {
  label?: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  required?: boolean;
  helperText?: string;
  className?: string;
}
export const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  label,
  value,
  onChange,
  required,
  helperText,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-semibold text-(--text-primary)">
          {label}
          {required && <span className="ml-1 text-(--action-danger)">*</span>}
        </label>
      )}
      <PhoneInput
        international
        defaultCountry="KE"
        value={value}
        onChange={onChange}
        className={cn(
          'phone-input-custom',
          'flex h-11 w-full items-center rounded-lg border border-(--border-default)',
          'bg-white px-3 text-sm',
          'transition-all duration-200',
          'hover:border-(--border-strong)',
          'focus-within:border-(--action-primary) focus-within:ring-2 focus-within:ring-(--action-primary)/10',
        )}
        numberInputProps={{
          className: cn(
            'flex-1 bg-transparent outline-none',
            'text-(--text-primary) placeholder:text-(--text-tertiary)',
          ),
        }}
      />
      {helperText && (
        <p className="text-xs leading-snug text-(--text-tertiary)">{helperText}</p>
      )}

      {/* Custom styles to match design system */}
      <style jsx global>{`
        .phone-input-custom {
          font-family: inherit;
        }
        
        .phone-input-custom .PhoneInputCountry {
          margin-right: 0.5rem;
          display: flex;
          align-items: center;
        }
        
        .phone-input-custom .PhoneInputCountryIcon {
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 0.125rem;
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
        }
        
        .phone-input-custom .PhoneInputCountrySelectArrow {
          margin-left: 0.25rem;
          color: var(--text-tertiary);
          width: 0.5rem;
          height: 0.5rem;
        }
        
        .phone-input-custom input {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        
        .phone-input-custom select {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          opacity: 0;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
