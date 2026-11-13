import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ApiDailySummary {
  date: string;
  groupSpend: number;
  individualSpend: number;
  totalSpend: number;
}

interface DailyBarChartProps {
  data: ApiDailySummary[];
  isLoading?: boolean;
}

function formatShortDate(dateStr: string, isLast: boolean, isMonth: boolean): string {
  if (isLast) return 'Today';
  const d = new Date(dateStr);
  if (isMonth) {
    return d.getDate().toString();
  }
  return d.toLocaleDateString('en-IN', { weekday: 'short' });
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTaka(minor: number): string {
  return `৳${(minor / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export const DailyBarChart: React.FC<DailyBarChartProps> = ({ data, isLoading }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="h-48 flex items-end justify-between gap-2 px-3 py-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-t-lg animate-pulse"
            style={{ height: `${30 + (i * 13) % 65}%` }}
          />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-ink-muted dark:text-ink-muted-dark text-sm border border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
        <span className="text-2xl mb-1">📊</span>
        <span>No spending data for this period</span>
      </div>
    );
  }

  const isMonth = data.length > 7;
  const maxSpend = Math.max(...data.map((d) => d.totalSpend), 0);
  const ceiling = maxSpend > 0 ? maxSpend * 1.15 : 10000;

  const hoveredItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="select-none">
      {/* Top Value Banner on Hover or Summary */}
      <div className="flex items-center justify-between text-xs mb-3 px-1 min-h-[24px]">
        {hoveredItem ? (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="font-bold text-ink-light dark:text-ink-dark flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal inline-block" />
              {formatFullDate(hoveredItem.date)}:
            </span>
            <span className="font-extrabold text-teal tabular-nums">
              {formatTaka(hoveredItem.totalSpend)}
            </span>
            {(hoveredItem.groupSpend > 0 || hoveredItem.individualSpend > 0) && (
              <span className="text-ink-muted dark:text-ink-muted-dark text-[11px] hidden sm:inline">
                ({hoveredItem.groupSpend > 0 ? `Group: ${formatTaka(hoveredItem.groupSpend)}` : ''}
                {hoveredItem.groupSpend > 0 && hoveredItem.individualSpend > 0 ? ' · ' : ''}
                {hoveredItem.individualSpend > 0 ? `Personal: ${formatTaka(hoveredItem.individualSpend)}` : ''})
              </span>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
            Tap or hover over bars for details
          </span>
        )}

        {/* Peak reference indicator */}
        <span className="text-[11px] font-semibold text-ink-muted dark:text-ink-muted-dark tabular-nums hidden sm:inline">
          Peak: {formatTaka(maxSpend)}
        </span>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative h-44 sm:h-48 pt-4 pb-6">
        {/* Background Reference Lines */}
        <div className="absolute inset-x-0 top-4 bottom-6 flex flex-col justify-between pointer-events-none">
          {/* 100% line */}
          <div className="border-b border-dashed border-gray-100 dark:border-gray-800 w-full" />
          {/* 50% line */}
          <div className="border-b border-dashed border-gray-100/80 dark:border-gray-800/80 w-full" />
          {/* Baseline (solid) */}
          <div className="border-b border-gray-200 dark:border-gray-700 w-full" />
        </div>

        {/* Bar Columns Container (Flex items grounded at baseline) */}
        <div className="absolute inset-x-0 top-4 bottom-6 flex items-end justify-between px-1 sm:px-2 gap-1 sm:gap-2">
          {data.map((item, i) => {
            const isHovered = hoveredIndex === i;
            const isLast = i === data.length - 1;
            const isFirst = i === 0;

            const totalPercent = ceiling > 0 ? Math.min(100, (item.totalSpend / ceiling) * 100) : 0;
            const groupPercent =
              item.totalSpend > 0 ? (item.groupSpend / item.totalSpend) * 100 : 0;
            const indPercent =
              item.totalSpend > 0 ? (item.individualSpend / item.totalSpend) * 100 : 0;

            const hasBoth = item.groupSpend > 0 && item.individualSpend > 0;

            return (
              <div
                key={item.date}
                className="relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTouchStart={() => setHoveredIndex(i)}
              >
                {/* Column Hover Background Pill */}
                <div
                  className={`
                    absolute inset-y-0 -inset-x-0.5 sm:-inset-x-1 rounded-xl transition-all duration-150 pointer-events-none
                    ${isHovered ? 'bg-teal/5 dark:bg-teal/10 ring-1 ring-teal/20' : 'opacity-0'}
                  `}
                />

                {/* Vertical Bar Slot */}
                <div
                  className={`
                    relative w-full h-full flex flex-col justify-end items-center
                    ${isMonth ? 'max-w-[8px] sm:max-w-[10px]' : 'max-w-[28px] sm:max-w-[36px]'}
                  `}
                >
                  {/* Subtle Ghost Track (Full available height) */}
                  <div className="absolute inset-0 rounded-t-md bg-gray-50/70 dark:bg-gray-800/40 pointer-events-none" />

                  {/* Active Bar Stack Grounded to Baseline */}
                  {item.totalSpend > 0 ? (
                    <motion.div
                      className="w-full flex flex-col justify-end relative z-10 overflow-hidden shadow-sm"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(totalPercent, 3)}%` }}
                      transition={{ type: 'spring', damping: 20, stiffness: 220, delay: i * 0.015 }}
                      style={{
                        borderTopLeftRadius: isMonth ? 3 : 6,
                        borderTopRightRadius: isMonth ? 3 : 6,
                      }}
                    >
                      {/* 1. Group Spend Segment (Top - Teal) */}
                      {item.groupSpend > 0 && (
                        <div
                          style={{ height: `${groupPercent}%` }}
                          className="w-full bg-teal dark:bg-teal-dark transition-all duration-200"
                        />
                      )}

                      {/* Micro Divider between stacked segments */}
                      {hasBoth && <div className="h-[1px] bg-white/40 dark:bg-gray-900/40 w-full shrink-0" />}

                      {/* 2. Individual Spend Segment (Bottom - Slate) */}
                      {item.individualSpend > 0 && (
                        <div
                          style={{ height: `${indPercent}%` }}
                          className="w-full bg-slate-500 dark:bg-slate-600 transition-all duration-200"
                        />
                      )}
                    </motion.div>
                  ) : (
                    /* Zero Spend Baseline Indicator */
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-gray-700 group-hover:bg-teal/40 transition-colors mb-0.5 z-10" />
                  )}
                </div>

                {/* Floating Tooltip anchored right above this bar */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className={`
                        absolute bottom-[calc(100%+8px)] z-30 pointer-events-none
                        ${isFirst ? 'left-0 translate-x-0' : isLast ? 'right-0 translate-x-0' : 'left-1/2 -translate-x-1/2'}
                      `}
                    >
                      <div className="bg-ink-light dark:bg-gray-800 text-white text-xs rounded-xl py-2 px-3 shadow-xl whitespace-nowrap border border-white/10 dark:border-gray-700">
                        <div className="text-[11px] text-gray-300 font-medium">
                          {formatFullDate(item.date)}
                        </div>
                        <div className="text-sm font-extrabold text-white tabular-nums mt-0.5">
                          {formatTaka(item.totalSpend)}
                        </div>
                        {(item.groupSpend > 0 || item.individualSpend > 0) && (
                          <div className="text-[10px] text-gray-300 flex items-center gap-2.5 pt-1 border-t border-white/10 dark:border-gray-700 mt-1">
                            {item.groupSpend > 0 && (
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-300 inline-block" />
                                Group: {formatTaka(item.groupSpend)}
                              </span>
                            )}
                            {item.individualSpend > 0 && (
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
                                Personal: {formatTaka(item.individualSpend)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Arrow / Caret */}
                      <div
                        className={`
                          w-2 h-2 bg-ink-light dark:bg-gray-800 rotate-45 -mt-1 border-r border-b border-white/10 dark:border-gray-700
                          ${isFirst ? 'ml-3' : isLast ? 'ml-auto mr-3' : 'mx-auto'}
                        `}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* X-Axis Date Labels Row */}
        <div className="absolute inset-x-0 bottom-0 h-6 flex items-center justify-between px-1 sm:px-2 gap-1 sm:gap-2 pointer-events-none">
          {data.map((item, i) => {
            const isLast = i === data.length - 1;
            const isHovered = hoveredIndex === i;
            const shouldShow = !isMonth || isLast || i === 0 || i % 5 === 0;

            return (
              <div key={item.date} className="flex-1 flex justify-center">
                {shouldShow && (
                  <span
                    className={`
                      text-[11px] tabular-nums transition-colors
                      ${
                        isLast
                          ? 'font-bold text-teal dark:text-teal-dark'
                          : isHovered
                          ? 'font-semibold text-ink-light dark:text-ink-dark'
                          : 'font-medium text-slate-400 dark:text-slate-500'
                      }
                    `}
                  >
                    {formatShortDate(item.date, isLast, isMonth)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Accessible Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 pt-2 border-t border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-2 text-xs font-medium text-ink-light dark:text-ink-dark">
          <span className="w-2.5 h-2.5 rounded-full bg-teal inline-block shadow-sm" />
          <span>Group Share</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-ink-light dark:text-ink-dark">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block shadow-sm" />
          <span>Individual Expense</span>
        </div>
      </div>
    </div>
  );
};
