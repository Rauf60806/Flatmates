import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { api, ApiStatsOverview } from '../api/client';
import { TrendChart } from '../components/charts/TrendChart';
import { formatCurrency } from '../utils/format';

export const Stats: React.FC = () => {
  const [stats, setStats] = useState<ApiStatsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch {}
      setLoading(false);
    };
    fetchStats();
  }, []);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  if (loading || !stats) {
    return (
      <div className="px-4 md:px-0 pt-5 md:pt-0 pb-8 space-y-6">
        <h2 className="text-2xl font-extrabold text-ink-light tracking-tight">Statistics & Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-28 animate-pulse shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 h-64 animate-pulse shadow-sm" />
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 h-64 animate-pulse shadow-sm" />
        </div>
      </div>
    );
  }

  const ChangeIcon =
    stats.changeDirection === 'decreased'
      ? TrendingDown
      : stats.changeDirection === 'increased'
      ? TrendingUp
      : Minus;

  const changeColor =
    stats.changeDirection === 'decreased'
      ? 'text-success'
      : stats.changeDirection === 'increased'
      ? 'text-danger'
      : 'text-ink-muted';

  const changeBg =
    stats.changeDirection === 'decreased'
      ? 'bg-success/8'
      : stats.changeDirection === 'increased'
      ? 'bg-danger/8'
      : 'bg-gray-100';

  return (
    <div className="px-4 md:px-0 pt-5 md:pt-0 pb-8 space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-ink-light dark:text-ink-dark tracking-tight">Statistics & Analytics</h2>
        <p className="text-xs sm:text-sm text-ink-muted dark:text-ink-muted-dark mt-0.5">
          Spending trends, monthly comparisons, and category insights
        </p>
      </div>

      {/* Insight Banner */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-teal/5 dark:bg-teal/10 border border-teal/15 dark:border-teal/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-2xl">💡</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal">Spending Insight</p>
            <p className="text-sm font-medium text-ink-light dark:text-ink-dark mt-0.5">{stats.insight}</p>
          </div>
        </div>
      </motion.div>

      {/* Top Metric Cards: 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Month-over-Month Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-ground-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-5 space-y-3 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">
                This Month Total
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold tabular-nums text-ink-light dark:text-ink-dark">
                {formatCurrency(stats.currentMonthTotal)}
              </p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${changeBg}`}>
              <ChangeIcon className={`w-4 h-4 ${changeColor}`} />
              <span className={`text-xs font-bold ${changeColor}`}>
                {stats.percentageChange}%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>Last Month:</span>
            <span className="font-semibold tabular-nums text-ink-light dark:text-ink-dark">{formatCurrency(stats.lastMonthTotal)}</span>
          </div>
        </motion.div>

        {/* Daily Average */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-ground-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-5 flex flex-col justify-between transition-colors"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">
              Daily Average Spend
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold tabular-nums text-ink-light dark:text-ink-dark">
              {formatCurrency(stats.dailyAverage)}
            </p>
          </div>
          <p className="text-xs text-ink-muted dark:text-ink-muted-dark mt-3">Calculated over active days this month</p>
        </motion.div>

        {/* Highest Spending Day */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white dark:bg-ground-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-5 flex flex-col justify-between transition-colors"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark mb-1">
              Highest Spending Day
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold tabular-nums text-ink-light dark:text-ink-dark">
              {stats.highestSpendingDay ? formatCurrency(stats.highestSpendingDay.amount) : '৳0'}
            </p>
          </div>
          <p className="text-xs text-ink-muted dark:text-ink-muted-dark mt-3">
            {stats.highestSpendingDay
              ? new Date(stats.highestSpendingDay.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'No recorded expenses yet'}
          </p>
        </motion.div>
      </div>

      {/* Charts & Breakdown: 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 6-Month Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-7 bg-white dark:bg-ground-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-5 sm:p-6 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-ink-light dark:text-ink-dark">6-Month Spending Trend</h3>
              <p className="text-xs text-ink-muted dark:text-ink-muted-dark mt-0.5">Historical overview of monthly flat expenditures</p>
            </div>
          </div>
          <TrendChart data={stats.sixMonthTrend} currentMonthKey={currentMonthKey} />
        </motion.div>

        {/* Top Items */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5 bg-white dark:bg-ground-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-5 sm:p-6 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-ink-light dark:text-ink-dark">Top Expenses</h3>
              <p className="text-xs text-ink-muted dark:text-ink-muted-dark mt-0.5">Highest expenditure items</p>
            </div>
            <span className="text-xs font-bold text-teal bg-teal/10 dark:bg-teal/20 px-2.5 py-1 rounded-full">
              Top {stats.topItems.length}
            </span>
          </div>

          {stats.topItems.length === 0 ? (
            <p className="text-xs text-ink-muted dark:text-ink-muted-dark text-center py-8">No item breakdown available yet</p>
          ) : (
            <div className="space-y-4">
              {stats.topItems.map((item, i) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink-muted dark:text-ink-muted-dark w-4">{i + 1}.</span>
                      <span className="text-sm font-semibold text-ink-light dark:text-ink-dark">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-ink-light dark:text-ink-dark">
                      {formatCurrency(item.totalAmount)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-teal rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          100,
                          Math.round((item.totalAmount / (stats.topItems[0]?.totalAmount || 1)) * 100)
                        )}%`,
                      }}
                      transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
