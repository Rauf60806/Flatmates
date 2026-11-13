import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefixElement, suffixElement, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixElement && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-ink-muted">
              {prefixElement}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full min-h-[48px] px-3.5 rounded-xl border bg-white text-ink-light placeholder-gray-400
              text-base transition-all duration-150 outline-none
              ${prefixElement ? 'pl-9' : ''}
              ${suffixElement ? 'pr-9' : ''}
              ${
                error
                  ? 'border-danger focus:ring-2 focus:ring-danger/20'
                  : 'border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20'
              }
              disabled:bg-gray-50 disabled:text-gray-400
              ${className}
            `}
            {...props}
          />
          {suffixElement && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-ink-muted">
              {suffixElement}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
