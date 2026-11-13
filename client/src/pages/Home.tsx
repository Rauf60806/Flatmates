import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, ApiItem, ApiDailySummary } from '../api/client';
import { DailyBarChart } from '../components/charts/DailyBarChart';
import { ItemCard } from '../components/items/ItemCard';
import { ItemCardSkeleton, ChartBarSkeleton } from '../components/ui/Skeletons';
import { CountUp } from '../components/ui/CountUp';
import { SegmentedToggle } from '../components/ui/SegmentedToggle';
import { groupByDate } from '../utils/format';
import { Button } from '../components/ui/Button';

type Period = 'week' | 'month';

const PAGE_SIZE = 15;

export const Home: React.FC = () => {
  const { user } = useAuth();

  const [period, setPeriod] = useState<Period>('week');
  const [summary, setSummary] = useState<ApiDailySummary[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [monthTotal, setMonthTotal] = useState(0);

  const [items, setItems] = useState<ApiItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch summary (chart data)
  const fetchSummary = useCallback(async (p: Period) => {
    setSummaryLoading(true);
    try {
      const res = await api.get(`/summary?period=${p}`);
      if (res.data.success) {
        setSummary(res.data.data || []);
      }
    } catch {}
    setSummaryLoading(false);
  }, []);

  // Fetch current month total for the counter
  const fetchMonthTotal = useCallback(async () => {
    try {
      const res = await api.get('/summary?period=month');
      if (res.data.success) {
        const data: ApiDailySummary[] = res.data.data || [];
        const total = data.reduce((acc, d) => acc + d.totalSpend, 0);
        setMonthTotal(total);
      }
    } catch {}
  }, []);

  const fetchItems = useCallback(async (pageNum: number, replace: boolean) => {
    if (replace) setItemsLoading(true);
    else setLoadingMore(true);

    try {
      const res = await api.get(`/items?page=${pageNum}&limit=${PAGE_SIZE}`);
      if (res.data.success) {
        const newItems: ApiItem[] = res.data.items || [];
        setItems((prev) => (replace ? newItems : [...prev, ...newItems]));
        setHasMore(res.data.pagination?.hasMore || false);
      }
    } catch {}

    if (replace) setItemsLoading(false);
    else setLoadingMore(false);
  }, []);

  useEffect(() => {
    fetchSummary(period);
    fetchItems(1, true);
    fetchMonthTotal();
    setPage(1);
  }, [period, fetchSummary, fetchItems, fetchMonthTotal]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchItems(nextPage, false);
  };

  const grouped = groupByDate(items);

  // Calculate this month's breakdown
  const groupSpendMonth = summary.reduce((acc, d) => acc + d.groupSpend, 0);
  const indSpendMonth = summary.reduce((acc, d) => acc + d.individualSpend, 0);

  if (!user) return null;

  return (
    <div className="px-4 md:px-0 pt-5 md:pt-0 pb-6 space-y-6">
      {/* Header: Month spend counter & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-ground-surface-dark md:bg-transparent md:dark:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border md:border-none border-gray-100 dark:border-gray-800 shadow-sm md:shadow-none transition-colors">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark mb-0.5">
            Welcome back, {user.name.split(' ')[0]} 👋
          </p>
          <div className="flex items-baseline gap-2">
            <CountUp
              value={monthTotal}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink-light dark:text-ink-dark tracking-tight"
            />
            <span className="text-sm font-medium text-ink-muted dark:text-ink-muted-dark">spent this month</span>
          </div>
        </div>

        {/* Desktop Quick Summary Pill Cards */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="bg-white dark:bg-ground-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-2.5 shadow-sm text-left transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal">Group Share</p>
            <p className="text-lg font-bold text-ink-light dark:text-ink-dark tabular-nums">
              ৳{(groupSpendMonth / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-white dark:bg-ground-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-2.5 shadow-sm text-left transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate">Individual</p>
            <p className="text-lg font-bold text-ink-light dark:text-ink-dark tabular-nums">
              ৳{(indSpendMonth / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Responsive 2-Column Layout on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chart & Quick Stats (Span 7 on md, Span 7 or 8 on lg) */}
        <div className="md:col-span-7 lg:col-span-7 space-y-6">
          {/* Chart Card */}
          <div className="bg-white dark:bg-ground-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 sm:p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-ink-light dark:text-ink-dark">Daily Expenses</h3>
                <p className="text-xs text-ink-muted dark:text-ink-muted-dark mt-0.5">Overview of group vs personal spending</p>
              </div>
              <SegmentedToggle
                size="sm"
                value={period}
                onChange={(v) => setPeriod(v as Period)}
                options={[
                  { value: 'week', label: 'Week' },
                  { value: 'month', label: 'Month' },
                ]}
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={period}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {summaryLoading ? (
                  <ChartBarSkeleton />
                ) : (
                  <DailyBarChart data={summary} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Quick Helpful Desktop Tip or Stats */}
          <div className="hidden md:block bg-gradient-to-r from-teal/5 to-teal/10 dark:from-teal/10 dark:to-teal/20 rounded-2xl border border-teal/15 dark:border-teal/25 p-5 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-teal dark:text-teal-dark">Fair & Exact Splitting</h4>
                <p className="text-xs text-ink-muted dark:text-ink-muted-dark mt-1 max-w-md">
                  All shared expenses are automatically distributed down to the exact cent across active flatmates.
                </p>
              </div>
              <span className="text-2xl">✨</span>
            </div>
          </div>
        </div>

        {/* Right Column: Expense History (Span 5 on md, Span 5 on lg) */}
        <div className="md:col-span-5 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink-light dark:text-ink-dark">Expense History</h3>
            <span className="text-xs font-semibold text-ink-muted dark:text-ink-muted-dark">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {itemsLoading ? (
            <div className="bg-white dark:bg-ground-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-50 dark:divide-gray-800 px-4 transition-colors">
              {Array.from({ length: 5 }).map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <div className="bg-white dark:bg-ground-surface-dark rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-10 text-center transition-colors">
              <p className="text-4xl mb-3">🛒</p>
              <p className="text-sm font-semibold text-ink-light dark:text-ink-dark">No expenses yet</p>
              <p className="text-xs text-ink-muted dark:text-ink-muted-dark mt-1">
                Add your first item using the Add button
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-ground-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-4 transition-colors">
              {grouped.map((group) => (
                <div key={group.date}>
                  <div className="py-2.5 sticky top-0 bg-white dark:bg-ground-surface-dark z-10 border-b border-gray-50 dark:border-gray-800 transition-colors">
                    <span className="text-[11px] font-bold text-ink-muted dark:text-ink-muted-dark uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {group.items.map((item) => (
                      <ItemCard key={item.id} item={item} currentUserId={user.id} />
                    ))}
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="py-4 flex justify-center border-t border-gray-50 dark:border-gray-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLoadMore}
                    isLoading={loadingMore}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
