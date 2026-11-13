import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

export const ItemCardSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 py-3">
    <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="h-5 w-16" />
  </div>
);

export const BalanceCardSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
    <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-20" />
    </div>
    <Skeleton className="h-6 w-20 rounded-full" />
  </div>
);

export const ChartBarSkeleton: React.FC = () => (
  <div className="flex items-end justify-around h-24 gap-1">
    {Array.from({ length: 7 }).map((_, i) => {
      const heights = [45, 60, 35, 72, 50, 65, 40];
      return (
        <div
          key={i}
          className="flex-1 rounded-t-md animate-pulse bg-gray-200"
          style={{ height: `${heights[i % heights.length]}%` }}
        />
      );
    })}
  </div>
);
