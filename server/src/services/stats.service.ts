import { prisma } from '../prisma.js';

export interface DailySummaryItem {
  date: string; // YYYY-MM-DD
  groupSpend: number; // in minor units
  individualSpend: number; // in minor units
  totalSpend: number; // in minor units
}

export interface MonthlyTrendItem {
  monthKey: string; // e.g. "2026-05"
  monthLabel: string; // e.g. "May"
  year: number;
  groupSpend: number;
  individualSpend: number;
  totalSpend: number;
}

export interface StatsOverview {
  currentMonthTotal: number;
  lastMonthTotal: number;
  percentageChange: number; // positive = spent more, negative = spent less
  changeDirection: 'increased' | 'decreased' | 'unchanged';
  dailyAverage: number;
  highestSpendingDay: {
    date: string;
    amount: number;
  } | null;
  topItems: Array<{
    name: string;
    totalAmount: number;
    percentage: number;
  }>;
  sixMonthTrend: MonthlyTrendItem[];
  insight: string;
}

/**
 * Returns daily aggregated spending for the current user across a given period (week or month).
 */
export async function getDailySummary(
  userId: string,
  period: 'week' | 'month' = 'week'
): Promise<DailySummaryItem[]> {
  const days = period === 'week' ? 7 : 30;
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (days - 1));

  // Fetch splits for the user within range
  const splits = await prisma.split.findMany({
    where: {
      userId,
      item: {
        createdAt: { gte: startDate },
      },
    },
    include: {
      item: {
        select: {
          id: true,
          type: true,
          createdAt: true,
        },
      },
    },
  });

  // Map by day YYYY-MM-DD
  const dailyMap = new Map<string, { group: number; individual: number }>();

  // Initialize all days in the range so there are no missing date gaps
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    dailyMap.set(key, { group: 0, individual: 0 });
  }

  for (const split of splits) {
    const dateKey = new Date(split.item.createdAt).toISOString().split('T')[0];
    const current = dailyMap.get(dateKey) || { group: 0, individual: 0 };

    if (split.item.type === 'group') {
      current.group += split.share;
    } else {
      current.individual += split.share;
    }
    dailyMap.set(dateKey, current);
  }

  const result: DailySummaryItem[] = [];
  dailyMap.forEach((val, date) => {
    result.push({
      date,
      groupSpend: val.group,
      individualSpend: val.individual,
      totalSpend: val.group + val.individual,
    });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculates high-level monthly metrics, 6-month trends, top items, and insights.
 */
export async function getSpendingStats(userId: string): Promise<StatsOverview> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Boundaries for current month
  const startCurrentMonth = new Date(currentYear, currentMonth, 1);
  const endCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

  // Boundaries for last month
  const startLastMonth = new Date(currentYear, currentMonth - 1, 1);
  const endLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  // 6 months ago start
  const startSixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);

  // Fetch all user splits in the last 6 months
  const allRecentSplits = await prisma.split.findMany({
    where: {
      userId,
      item: {
        createdAt: { gte: startSixMonthsAgo },
      },
    },
    include: {
      item: {
        select: {
          id: true,
          name: true,
          type: true,
          createdAt: true,
        },
      },
    },
  });

  let currentMonthTotal = 0;
  let lastMonthTotal = 0;
  const currentMonthDailySpends = new Map<string, number>();
  const itemSpendMap = new Map<string, number>();

  // Buckets for 6-month trend
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendBuckets: Record<string, { group: number; individual: number; year: number; monthName: string }> = {};

  for (let m = 5; m >= 0; m--) {
    const target = new Date(currentYear, currentMonth - m, 1);
    const y = target.getFullYear();
    const mIdx = target.getMonth();
    const key = `${y}-${String(mIdx + 1).padStart(2, '0')}`;
    trendBuckets[key] = {
      group: 0,
      individual: 0,
      year: y,
      monthName: monthNames[mIdx],
    };
  }

  for (const s of allRecentSplits) {
    const itemDate = new Date(s.item.createdAt);
    const amount = s.share;
    const y = itemDate.getFullYear();
    const mIdx = itemDate.getMonth();
    const monthKey = `${y}-${String(mIdx + 1).padStart(2, '0')}`;

    if (trendBuckets[monthKey]) {
      if (s.item.type === 'group') {
        trendBuckets[monthKey].group += amount;
      } else {
        trendBuckets[monthKey].individual += amount;
      }
    }

    // Current Month metrics
    if (itemDate >= startCurrentMonth && itemDate <= endCurrentMonth) {
      currentMonthTotal += amount;
      const dayKey = itemDate.toISOString().split('T')[0];
      currentMonthDailySpends.set(dayKey, (currentMonthDailySpends.get(dayKey) || 0) + amount);

      const normalizedItemName = s.item.name.trim();
      itemSpendMap.set(normalizedItemName, (itemSpendMap.get(normalizedItemName) || 0) + amount);
    }

    // Last Month metrics
    if (itemDate >= startLastMonth && itemDate <= endLastMonth) {
      lastMonthTotal += amount;
    }
  }

  // Percentage change calculation
  let percentageChange = 0;
  let changeDirection: 'increased' | 'decreased' | 'unchanged' = 'unchanged';

  if (lastMonthTotal > 0) {
    const diff = currentMonthTotal - lastMonthTotal;
    percentageChange = Math.round((diff / lastMonthTotal) * 100);
    if (percentageChange > 0) changeDirection = 'increased';
    else if (percentageChange < 0) {
      changeDirection = 'decreased';
      percentageChange = Math.abs(percentageChange);
    }
  } else if (currentMonthTotal > 0) {
    percentageChange = 100;
    changeDirection = 'increased';
  }

  // Daily average in current month
  const daysPassed = Math.max(1, now.getDate());
  const dailyAverage = Math.round(currentMonthTotal / daysPassed);

  // Highest spending day
  let highestSpendingDay: { date: string; amount: number } | null = null;
  currentMonthDailySpends.forEach((amount, date) => {
    if (!highestSpendingDay || amount > highestSpendingDay.amount) {
      highestSpendingDay = { date, amount };
    }
  });

  // Top 5 items
  const sortedItems = Array.from(itemSpendMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, totalAmount]) => ({
      name,
      totalAmount,
      percentage: currentMonthTotal > 0 ? Math.round((totalAmount / currentMonthTotal) * 100) : 0,
    }));

  // Build 6-month trend array
  const sixMonthTrend: MonthlyTrendItem[] = Object.entries(trendBuckets).map(
    ([key, data]) => ({
      monthKey: key,
      monthLabel: data.monthName,
      year: data.year,
      groupSpend: data.group,
      individualSpend: data.individual,
      totalSpend: data.group + data.individual,
    })
  );

  // Natural language insight generator
  let insight = 'Your spending habits are right on track this month.';
  if (lastMonthTotal > 0) {
    if (changeDirection === 'decreased') {
      insight = `Great job! You spent ${percentageChange}% less this month compared to last month.`;
    } else if (changeDirection === 'increased') {
      insight = `You spent ${percentageChange}% more this month than last month.`;
    } else {
      insight = `Your total spending this month is equal to last month.`;
    }
  } else if (currentMonthTotal > 0) {
    insight = `Welcome! Your total tracked spending for this month is ৳${(currentMonthTotal / 100).toFixed(2)}.`;
  }

  return {
    currentMonthTotal,
    lastMonthTotal,
    percentageChange,
    changeDirection,
    dailyAverage,
    highestSpendingDay,
    topItems: sortedItems,
    sixMonthTrend,
    insight,
  };
}
