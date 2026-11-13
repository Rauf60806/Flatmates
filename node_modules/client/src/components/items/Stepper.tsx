import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
}) => {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="flex items-center gap-3">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted flex-1">
          {label}
        </label>
      )}
      <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={decrement}
          disabled={value <= min}
          className="w-12 h-12 flex items-center justify-center text-ink-light hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-10 text-center text-base font-bold tabular-nums text-ink-light select-none">
          {value}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={increment}
          disabled={value >= max}
          className="w-12 h-12 flex items-center justify-center text-ink-light hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
