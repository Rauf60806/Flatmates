import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-150 select-none focus:outline-none focus:ring-2 focus:ring-teal/30 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'min-h-[40px] px-3 text-xs',
    md: 'min-h-[48px] px-4 text-sm',
    lg: 'min-h-[52px] px-6 text-base font-semibold',
  };

  const variantStyles = {
    primary: 'bg-teal text-white hover:bg-teal-hover shadow-sm',
    secondary: 'bg-slate text-white hover:bg-slate-hover shadow-sm',
    outline: 'border border-gray-200 bg-white text-ink-light hover:bg-gray-50',
    danger: 'bg-danger text-white hover:bg-red-600 shadow-sm',
    ghost: 'text-ink-light hover:bg-gray-100 dark:hover:bg-gray-800',
  };

  return (
    <motion.button
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};
