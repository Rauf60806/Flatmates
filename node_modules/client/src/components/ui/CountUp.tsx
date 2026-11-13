import React, { useState, useEffect } from 'react';
import { useMotionValue, animate } from 'framer-motion';

interface CountUpProps {
  value: number;
  prefix?: string;
  duration?: number;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  prefix = '৳',
  duration = 1.4,
  className = '',
}) => {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: 'easeOut',
    });

    const unsubscribe = motionValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, duration, motionValue]);

  const formatted = (displayValue / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
    </span>
  );
};
