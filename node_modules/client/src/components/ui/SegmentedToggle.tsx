import React from 'react';
import { motion } from 'framer-motion';

export interface SegmentedToggleOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedToggleProps {
  options: SegmentedToggleOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const SegmentedToggle: React.FC<SegmentedToggleProps> = ({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
}) => {
  const heightClass = size === 'sm' ? 'h-9' : 'h-11';
  const textClass = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div
      className={`relative inline-flex p-1 bg-gray-100 rounded-xl ${heightClass} ${className}`}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`relative z-10 flex-1 inline-flex items-center justify-center gap-1.5 px-3 ${textClass} font-medium rounded-lg transition-colors duration-150 ${
              isActive ? 'text-ink-light' : 'text-ink-muted'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="segmented-pill"
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
